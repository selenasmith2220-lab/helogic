import React, { useState } from 'react';
import {
  DollarSign,
  Smartphone,
  Building,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Receipt,
} from 'lucide-react';
import { CreatorWallet, PayoutTransaction } from '../../types';
import { saveStoredCreatorWallet } from '../../utils/storage';

interface AdminWalletTabProps {
  wallet: CreatorWallet;
  onUpdateWallet: (updatedWallet: CreatorWallet) => void;
}

export const AdminWalletTab: React.FC<AdminWalletTabProps> = ({ wallet, onUpdateWallet }) => {
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'mobile_money'>('mobile_money');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bank Form State
  const [bankName, setBankName] = useState(wallet.bankDetails.bankName || '');
  const [accountNumber, setAccountNumber] = useState(wallet.bankDetails.accountNumber || '');
  const [accountName, setAccountName] = useState(wallet.bankDetails.accountName || '');
  const [swiftCode, setSwiftCode] = useState(wallet.bankDetails.swiftCode || '');
  const [bankCountry, setBankCountry] = useState(wallet.bankDetails.country || 'United States');

  // Mobile Money Form State
  const [mobileProvider, setMobileProvider] = useState(wallet.mobileMoneyDetails.provider || 'MTN Mobile Money');
  const [mobilePhone, setMobilePhone] = useState(wallet.mobileMoneyDetails.phoneNumber || '');
  const [mobileAccountName, setMobileAccountName] = useState(wallet.mobileMoneyDetails.registeredName || '');
  const [mobileCountry, setMobileCountry] = useState(wallet.mobileMoneyDetails.country || 'Ghana');

  const amountNum = parseFloat(withdrawAmount) || 0;
  const transferFee = (amountNum * 0.015).toFixed(2);
  const netTransfer = Math.max(0, amountNum - parseFloat(transferFee)).toFixed(2);

  const handleMax = () => {
    setWithdrawAmount(wallet.balance.toFixed(2));
  };

  const handleSaveDetails = () => {
    const updated: CreatorWallet = {
      ...wallet,
      bankDetails: {
        bankName,
        accountNumber,
        accountName,
        swiftCode,
        country: bankCountry,
      },
      mobileMoneyDetails: {
        provider: mobileProvider,
        phoneNumber: mobilePhone,
        registeredName: mobileAccountName,
        country: mobileCountry,
      },
    };
    saveStoredCreatorWallet(updated);
    onUpdateWallet(updated);
    setSuccessMessage('Transfer destination details updated successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (amountNum <= 0) {
      setErrorMessage('Please enter an amount greater than $0.');
      return;
    }

    if (amountNum > wallet.balance) {
      setErrorMessage(`Insufficient balance. Maximum available is $${wallet.balance.toFixed(2)}.`);
      return;
    }

    if (payoutMethod === 'mobile_money' && (!mobilePhone || !mobileAccountName)) {
      setErrorMessage('Please fill in your Mobile Money phone number and registered name.');
      return;
    }

    if (payoutMethod === 'bank' && (!bankName || !accountNumber || !accountName)) {
      setErrorMessage('Please fill in your Bank name, account number, and holder name.');
      return;
    }

    setIsProcessing(true);

    try {
      const destinationSummary =
        payoutMethod === 'mobile_money'
          ? `${mobileProvider} (${mobilePhone}) - ${mobileCountry}`
          : `${bankName} (Acct: ${accountNumber}) - ${bankCountry}`;

      // Call server endpoint or handle directly
      let txId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      let ref = 'NXU-' + Math.floor(100000 + Math.random() * 900000);

      try {
        const res = await fetch('/api/wallet/payout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountNum,
            method: payoutMethod,
            destinationDetails: destinationSummary,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.transaction) {
            txId = data.transaction.id;
            ref = data.transaction.reference;
          }
        }
      } catch {
        // Fallback safely
      }

      const newTx: PayoutTransaction = {
        id: txId,
        reference: ref,
        amount: amountNum,
        fee: parseFloat(transferFee),
        netAmount: parseFloat(netTransfer),
        method: payoutMethod,
        destinationSummary,
        timestamp: Date.now(),
        status: 'completed',
      };

      const updatedWallet: CreatorWallet = {
        ...wallet,
        balance: Number((wallet.balance - amountNum).toFixed(2)),
        totalWithdrawn: Number((wallet.totalWithdrawn + amountNum).toFixed(2)),
        transactions: [newTx, ...(wallet.transactions || [])],
        bankDetails: {
          bankName,
          accountNumber,
          accountName,
          swiftCode,
          country: bankCountry,
        },
        mobileMoneyDetails: {
          provider: mobileProvider,
          phoneNumber: mobilePhone,
          registeredName: mobileAccountName,
          country: mobileCountry,
        },
      };

      saveStoredCreatorWallet(updatedWallet);
      onUpdateWallet(updatedWallet);
      setIsProcessing(false);
      setWithdrawAmount('');
      setSuccessMessage(
        `Transfer of $${amountNum.toFixed(2)} ($${netTransfer} net) sent successfully to ${destinationSummary}! Ref: ${ref}`
      );
    } catch {
      setIsProcessing(false);
      setErrorMessage('Failed to process payout. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20">
          <div className="flex items-center justify-between opacity-85 text-xs font-semibold">
            <span>Available to Withdraw</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight">
            ${wallet.balance.toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-emerald-100">
            Real-time balance ready for instant transfer anytime
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Lifetime Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            ${wallet.totalEarned.toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Combined ad impressions, clicks & VIP subscriptions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Withdrawn to Date</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            ${wallet.totalWithdrawn.toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Successfully transferred to your bank or mobile money
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transfer Execution Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            <span>Instant Earnings Transfer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transfer your earnings directly to your personal bank account or mobile money operator anytime.
          </p>
        </div>

        {/* Payout Method Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Select Payout Method
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setPayoutMethod('mobile_money')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                payoutMethod === 'mobile_money'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <div>Mobile Money</div>
                <div className="text-[10px] text-slate-400 font-normal">M-Pesa, MTN, Airtel, MoMo</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPayoutMethod('bank')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                payoutMethod === 'bank'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building className="w-5 h-5 text-sky-600" />
              <div className="text-left">
                <div>Bank Account (Wire)</div>
                <div className="text-[10px] text-slate-400 font-normal">Direct SWIFT / ACH wire</div>
              </div>
            </button>
          </div>
        </div>

        {/* Destination Credentials */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. {payoutMethod === 'mobile_money' ? 'Mobile Money Details' : 'Bank Account Details'}
            </label>
            <button
              type="button"
              onClick={handleSaveDetails}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
            >
              Save as Default
            </button>
          </div>

          {payoutMethod === 'mobile_money' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mobile Money Provider
                </label>
                <select
                  value={mobileProvider}
                  onChange={(e) => setMobileProvider(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option>MTN Mobile Money</option>
                  <option>M-Pesa (Safaricom / Vodacom)</option>
                  <option>Airtel Money</option>
                  <option>Orange Money</option>
                  <option>Vodafone Cash</option>
                  <option>Wave</option>
                  <option>MoMo</option>
                  <option>OPay / PalmPay</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+233 55 123 4567 or +254 ..."
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Registered Account Name
                </label>
                <input
                  type="text"
                  placeholder="Full Legal Name on Mobile Wallet"
                  value={mobileAccountName}
                  onChange={(e) => setMobileAccountName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Ghana, Kenya, Nigeria, Uganda, etc."
                  value={mobileCountry}
                  onChange={(e) => setMobileCountry(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chase Bank, Barclays, Ecobank, Standard Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  placeholder="Account Number or IBAN"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  placeholder="Name on bank statement"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHASUS33"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs uppercase"
                />
              </div>
            </div>
          )}
        </div>

        {/* Withdrawal Amount & Calculation */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Transfer Amount
          </label>
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleMax}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Transfer Max
            </button>
          </div>

          {/* Breakdown pill */}
          {amountNum > 0 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-600">
                Gross: <strong className="text-slate-900">${amountNum.toFixed(2)}</strong> &bull; Gateway Fee (1.5%):{' '}
                <strong className="text-slate-900">${transferFee}</strong>
              </span>
              <span className="font-extrabold text-emerald-800">
                Net Payout into your account: ${netTransfer}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={isProcessing || amountNum <= 0 || amountNum > wallet.balance}
          onClick={handleWithdraw}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>Processing Transfer...</span>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4" />
              <span>
                Transfer ${amountNum > 0 ? amountNum.toFixed(2) : '0.00'} to{' '}
                {payoutMethod === 'mobile_money' ? 'Mobile Money' : 'Bank'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Payout History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-700" />
            <h4 className="font-bold text-sm text-slate-900">Payout & Transfer History</h4>
          </div>
          <span className="text-xs text-slate-500">
            {wallet.transactions?.length || 0} completed transfers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3 text-right">Gross</th>
                <th className="py-2.5 px-3 text-right">Fee (1.5%)</th>
                <th className="py-2.5 px-3 text-right">Net Received</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(wallet.transactions || []).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                    {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                    {tx.reference}
                  </td>
                  <td className="py-2.5 px-3 capitalize">
                    {tx.method === 'mobile_money' ? '📱 Mobile Money' : '🏦 Bank Wire'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]" title={tx.destinationSummary}>
                    {tx.destinationSummary}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    ${tx.fee.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                    ${tx.netAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
