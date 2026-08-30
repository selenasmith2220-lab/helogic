import React from 'react';
import {
  Compass,
  ShieldCheck,
  Crown,
  Sparkles,
  Users,
  MessageSquare,
  Globe2,
} from 'lucide-react';
import { AdSlot, ChatRoom } from '../types';
import { CHAT_ROOMS } from '../data/initialData';
import { AdPlacement } from './AdPlacement';

interface SidebarRightProps {
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  sidebarAd?: AdSlot;
  onlineCount: number;
  totalMessagesCount: number;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  currentRoomId,
  onSelectRoom,
  sidebarAd,
  onlineCount,
  totalMessagesCount,
}) => {
  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-y-auto p-3 space-y-4">
      {/* Sidebar Ad Placement (300x250) */}
      {sidebarAd && (
        <AdPlacement slot={sidebarAd} />
      )}

      {/* Room Directory */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-700 mb-2.5">
          <Compass className="w-3.5 h-3.5 text-sky-600" />
          <span>Active Chat Rooms</span>
        </div>

        <div className="space-y-1">
          {CHAT_ROOMS.map((room) => {
            const isSelected = room.id === currentRoomId;
            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`w-full p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div>
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {room.category}
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  {room.userCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIP / Monetization Upgrade Box */}
      <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white p-3.5 shadow-2xs">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-xs text-amber-900">
            Chat Nexu VIP Gold
          </span>
          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-800 uppercase">
            $2.99/mo
          </span>
        </div>
        <p className="text-[11px] text-amber-800/80 leading-relaxed mb-2.5">
          Support the website, browse 100% ad-free, get a glowing VIP badge, and unlimited direct media sharing!
        </p>
        <button
          onClick={() =>
            alert(
              'VIP membership checkout demo! In production, link this to your Stripe/PayPal or BuyMeACoffee payment button.'
            )
          }
          className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Get VIP Ad-Free</span>
        </button>
      </div>

      {/* Live Community Stats */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
        <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-2">
          Realtime Metrics
        </div>
        <div className="space-y-1.5 text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px]">
              <Users className="w-3 h-3 text-slate-400" />
              Online Users
            </span>
            <span className="font-bold text-slate-800">
              {onlineCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              Messages Exchanged
            </span>
            <span className="font-bold text-slate-800">
              {totalMessagesCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px]">
              <Globe2 className="w-3 h-3 text-slate-400" />
              Active Countries
            </span>
            <span className="font-bold text-slate-800">38</span>
          </div>
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700 uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Community Rules</span>
        </div>
        <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside leading-relaxed">
          <li>Must be 18+ to use this chat service.</li>
          <li>Never share personal phone numbers or bank details.</li>
          <li>Spamming or sending unsolicited ads is prohibited.</li>
          <li>Offensive language is filtered by automated rules.</li>
        </ul>
      </div>
    </div>
  );
};
