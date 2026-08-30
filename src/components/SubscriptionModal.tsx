import React, { useState } from 'react';
import { X, Crown, Check, Zap, Sparkles, Shield, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { SubscriptionPlan, User } from '../types';
import { depositToCreatorWallet, saveStoredUser } from '../utils/storage';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  plans: SubscriptionPlan[];
  onSubscriptionSuccess: (updatedUser: User) => void;
  onOpenGoogleAuth: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  plans,
  onSubscriptionSuccess,
  onOpenGoogleAuth,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'google_pay' | 'mobile_money'>('google_pay');
  const [mobileProvider, setMobileProvider] = useState('MTN Mobile Money');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const activePlans = plans.filter((p) => p.isEnabled);
  const selectedPlan = activePlans.find((p) => p.id === selectedPlanId) || activePlans[0] || plans[0];

  const handleSubscribe = () => {
    if (!currentUser?.isGoogleUser) {
      // Prompt Google connect first for account linking
      onOpenGoogleAuth();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);

      const days = selectedPlan.durationDays;
      const expiresAt = Date.now() + days * 86400000;

      const updated: User = {
        ...currentUser,
        subscriptionTier: selectedPlan.id,
        subscriptionExpiresAt: expiresAt,
        isVip: true,
      };

      // Deposit earnings into the platform owner's wallet!
      depositToCreatorWallet(selectedPlan.price, `User ${currentUser.nickname} subscribed to ${selectedPlan.name}`);
      saveStoredUser(updated);
      onSubscriptionSuccess(updated);

      setTimeout(() => {
        setIsCompleted(false);
        onClose();
      }, 1600);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-amber-200/80 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Crown className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">Chat Nexu VIP Pass</h3>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-white/30 px-2 py-0.5 rounded-full">
                  Unlimited Video
                </span>
              </div>
              <p className="text-xs text-amber-100">Bypass the 2-minute limit & video chat without restrictions</p>
            </div>
          </div>
          <button
            id="subscription-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {isCompleted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-800">VIP Membership Activated!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                You now have unlimited video chatroom access on {selectedPlan.name}. The 2-minute timer is now disabled!
              </p>
            </div>
          ) : (
            <>
              {/* Account Status Prompt */}
              {!currentUser?.isGoogleUser && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-sky-800">
                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Connect your Google account to tie your VIP subscription safely.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenGoogleAuth}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-[11px] shrink-0 cursor-pointer"
                  >
                    Google Sign Up
                  </button>
                </div>
              )}

              {/* Pricing Plans Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Your Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {activePlans.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2.5 right-2 text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs">
                            {plan.badge}
                          </span>
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-700">{plan.name}</div>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900">
                              {plan.currency}{plan.price.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              /{plan.durationDays === 1 ? 'day' : `${plan.durationDays}d`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {plan.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-amber-700">
                            {isSelected ? 'Selected' : 'Choose'}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-amber-600 bg-amber-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Plan Features List */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Everything included in {selectedPlan.name}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {selectedPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'google_pay'
                        ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-400/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base font-black">GPay</span>
                    <span className="text-[10px]">Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-400/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="text-[10px]">Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'mobile_money'
                        ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-400/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px]">Mobile Money</span>
                  </button>
                </div>

                {/* Mobile Money Details if selected */}
                {paymentMethod === 'mobile_money' && (
                  <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Provider</label>
                        <select
                          value={mobileProvider}
                          onChange={(e) => setMobileProvider(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                        >
                          <option>MTN Mobile Money</option>
                          <option>M-Pesa</option>
                          <option>Airtel Money</option>
                          <option>Orange Money</option>
                          <option>Wave / MoMo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+233 ... / +254 ..."
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                id="confirm-subscription-btn"
                type="button"
                disabled={isProcessing}
                onClick={handleSubscribe}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Activating VIP Access...</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>
                      Pay {selectedPlan.currency}{selectedPlan.price.toFixed(2)} & Unlock Video
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant activation &bull; Cancel anytime &bull; 256-bit Encrypted</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
