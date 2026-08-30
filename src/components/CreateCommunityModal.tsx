import React, { useState } from 'react';
import {
  X,
  Users,
  Shield,
  Sparkles,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { AdminSettings, ChatRoom, User } from '../types';

interface CreateCommunityModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onCreateCommunity: (community: Omit<ChatRoom, 'id' | 'userCount' | 'isCustomCommunity' | 'createdAt'>) => void;
}

const PRESET_COMMUNITY_AVATARS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&auto=format&fit=crop&q=80',
];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  adminSettings,
  onCreateCommunity,
}) => {
  if (!isOpen) return null;

  const creationPrice = adminSettings.communityCreationPrice ?? 4.99;
  const currency = adminSettings.communityCreationCurrency || '$';
  const isVipFree = currentUser.isVip && adminSettings.communityCreationFreeForVip;
  const effectivePrice = isVipFree ? 0 : creationPrice;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_COMMUNITY_AVATARS[0]);
  const [ageLimit, setAgeLimit] = useState<'all' | '18+' | '21+'>('all');
  const [genderPreference, setGenderPreference] = useState<'any' | 'female_only' | 'male_only' | 'lgbtq_friendly'>('any');
  const [rules, setRules] = useState<string[]>([
    'Be kind, respectful, and welcoming to all members',
    'No hate speech, harassment, or non-consensual behavior',
    'No spam, scam links, or unsolicited advertising',
    'Follow community age and topical guidelines',
  ]);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddRule = () => {
    if (newRuleInput.trim()) {
      setRules([...rules, newRuleInput.trim()]);
      setNewRuleInput('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a community name!');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description for your community!');
      return;
    }

    setIsProcessingPayment(true);

    // Simulate instant secure platform checkout
    setTimeout(() => {
      onCreateCommunity({
        name: name.trim(),
        description: description.trim(),
        iconName: 'Users',
        category: 'Communities',
        avatarUrl,
        creatorId: currentUser.id,
        creatorName: currentUser.nickname,
        rules,
        ageLimit,
        genderPreference,
        isPaid: effectivePrice > 0,
        feeAmount: effectivePrice,
      });

      setIsProcessingPayment(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 900);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-sky-700 to-blue-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base">Create a Community / Room</h2>
              <p className="text-xs text-indigo-100">
                Launch your own branded chat room with custom rules & audience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Community Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Community Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={40}
              placeholder="e.g., Chill Gamers Lounge, Techno Beats, Book Club..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Community Profile / Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Community Profile & Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              maxLength={200}
              placeholder="Describe the purpose, topics, and vibe of your room..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Cover Avatar Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Room Avatar Icon
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {PRESET_COMMUNITY_AVATARS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Cover ${i}`}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all shrink-0 ${
                    avatarUrl === url
                      ? 'border-indigo-600 ring-2 ring-indigo-400 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Age Limits & Gender Restrictions (User Requested) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Age Limit</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Restriction</span>
              </label>
              <select
                value={ageLimit}
                onChange={(e) => setAgeLimit(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Ages (13+)</option>
                <option value="18+">18+ Only (Mature Content / Adults)</option>
                <option value="21+">21+ Only (Nightclub / Adult Vibes)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Gender Audience</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Preference</span>
              </label>
              <select
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="any">Any Gender (Everyone Welcome)</option>
                <option value="female_only">Female Only (Safe Haven)</option>
                <option value="male_only">Male Only</option>
                <option value="lgbtq_friendly">LGBTQ+ Friendly Space</option>
              </select>
            </div>
          </div>

          {/* Community Rules (User Requested) */}
          <div className="pt-2">
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Community Rules ({rules.length})</span>
            </label>
            <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
                >
                  <span className="flex-1 pr-2 truncate">
                    {idx + 1}. {rule}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Rule Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom rule (e.g., No spoilers without tags)..."
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Pricing & Checkout Summary (Admin Configured Price) */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-sky-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-700" />
                <span className="font-bold text-slate-800 text-xs">Community Creation Fee</span>
              </div>
              <div className="text-right">
                {isVipFree ? (
                  <div className="flex items-center gap-1">
                    <span className="line-through text-slate-400 text-xs font-semibold">
                      {currency}{creationPrice.toFixed(2)}
                    </span>
                    <span className="text-emerald-600 font-extrabold text-sm flex items-center gap-0.5">
                      <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Free for VIP
                    </span>
                  </div>
                ) : (
                  <span className="font-extrabold text-base text-indigo-900">
                    {currency}{creationPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your community is permanently hosted on the platform. You will be listed as creator and moderator with special badge & room controls.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessingPayment || isSuccess}
              className={`flex-1 py-2.5 font-bold rounded-xl text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500'
              }`}
            >
              {isProcessingPayment ? (
                <span>Setting up room...</span>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Community Created!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {effectivePrice === 0 ? 'Create Free Community' : `Pay ${currency}${effectivePrice.toFixed(2)} & Create`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
