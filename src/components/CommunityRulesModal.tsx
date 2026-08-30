import React from 'react';
import { X, Shield, Users, AlertCircle, Sparkles } from 'lucide-react';
import { ChatRoom } from '../types';

interface CommunityRulesModalProps {
  room: ChatRoom | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityRulesModal: React.FC<CommunityRulesModalProps> = ({
  room,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {room.avatarUrl ? (
              <img
                src={room.avatarUrl}
                alt={room.name}
                className="w-10 h-10 rounded-xl object-cover border border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-base">
                {room.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="font-bold text-sm leading-snug">{room.name}</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-0.5">
                <span>{room.category}</span>
                {room.creatorName && (
                  <>
                    <span>&bull;</span>
                    <span>Created by @{room.creatorName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Description */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
            {room.description}
          </div>

          {/* Badges / Meta */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Age Requirement
              </span>
              <span className="font-bold text-slate-800">
                {room.ageLimit === '18+' ? '🔞 18+ Only' : room.ageLimit === '21+' ? '🔞 21+ Adults' : '🌍 All Ages (13+)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Audience
              </span>
              <span className="font-bold text-slate-800">
                {room.genderPreference === 'female_only'
                  ? '🌸 Female Only'
                  : room.genderPreference === 'male_only'
                  ? '⚡ Male Only'
                  : room.genderPreference === 'lgbtq_friendly'
                  ? '🏳️‍🌈 LGBTQ+ Friendly'
                  : '👥 Everyone Welcome'}
              </span>
            </div>
          </div>

          {/* Community Rules */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Community Guidelines</span>
            </div>

            {room.rules && room.rules.length > 0 ? (
              <div className="space-y-2">
                {room.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-slate-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-xs">
                Standard platform guidelines apply: be respectful, no hate speech, and keep it safe!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
