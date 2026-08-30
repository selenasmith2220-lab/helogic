import React, { useState } from 'react';
import { X, CheckCircle2, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onGoogleSuccess: (updatedUser: User) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onGoogleSuccess,
}) => {
  const [selectedEmail, setSelectedEmail] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const defaultGoogleAccounts = [
    {
      name: currentUser?.nickname || 'Chat Nexu User',
      email: `${(currentUser?.nickname || 'user').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Selena Smith',
      email: 'selenasmith2220@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleSignIn = (accountEmail: string, accountName?: string, accountAvatar?: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (currentUser) {
        const updated: User = {
          ...currentUser,
          isGoogleUser: true,
          email: accountEmail,
          nickname: accountName || currentUser.nickname,
          avatar: accountAvatar || currentUser.avatar,
        };
        onGoogleSuccess(updated);
      }
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-sky-900 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white p-1.5 flex items-center justify-center shadow-xs">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Sign in with Google</h3>
              <p className="text-[11px] text-sky-200">Connect Google to unlock Nexu VIP & Payments</p>
            </div>
          </div>
          <button
            id="google-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h4 className="text-base font-extrabold text-slate-800">
              {currentUser?.isGoogleUser ? 'Google Account Connected' : 'Choose an account'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              to continue to <strong className="text-sky-700">Chat Nexu</strong> and subscribe to unlimited video chat.
            </p>
          </div>

          {/* Account Selection */}
          <div className="space-y-2.5">
            {defaultGoogleAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSignIn(acc.email, acc.name, acc.avatar)}
                disabled={isProcessing}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{acc.email}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>

          {/* Custom Google Email Option */}
          {!useCustom ? (
            <button
              type="button"
              onClick={() => setUseCustom(true)}
              className="w-full text-center text-xs font-semibold text-sky-600 hover:text-sky-800 py-1 cursor-pointer"
            >
              + Use another Google account
            </button>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Enter your Google Email</label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={!customEmail || !customEmail.includes('@') || isProcessing}
                onClick={() => handleSignIn(customEmail, customEmail.split('@')[0])}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isProcessing ? 'Connecting...' : 'Continue with this Google Account'}
              </button>
            </div>
          )}

          {/* Security & Benefits notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Why connect Google?</span>
            </div>
            <ul className="space-y-1 pl-5 list-disc text-slate-500">
              <li>Save your VIP membership across all devices and browsers</li>
              <li>Instantly unlock paid subscription upgrades & receipts</li>
              <li>Guaranteed 100% encrypted and private</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
