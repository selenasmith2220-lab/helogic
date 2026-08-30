import React from 'react';
import {
  X,
  UserCheck,
  UserX,
  UserPlus,
  MessageCircle,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { FriendRequest } from '../types';

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onAccept: (request: FriendRequest) => void;
  onDecline: (request: FriendRequest) => void;
}

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const formatTime = (ts: number) => {
    const diffMin = Math.floor((Date.now() - ts) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Friend Requests</h2>
              <p className="text-[11px] text-emerald-100">
                Accept requests to start private 1-on-1 conversations
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

        {/* Requests List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-600 text-sm">No Pending Requests</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                When someone wants to chat privately with you, their request will show up here for you to accept.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={req.fromUser.avatar}
                      alt={req.fromUser.nickname}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <span>{req.fromUser.nickname}</span>
                        <span>{req.fromUser.flag}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {req.fromUser.age} y/o &bull; {req.fromUser.country}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(req.createdAt)}</span>
                  </div>
                </div>

                {req.introMessage && (
                  <p className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] leading-relaxed italic">
                    &ldquo;{req.introMessage}&rdquo;
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onAccept(req)}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Accept & Chat</span>
                  </button>
                  <button
                    onClick={() => onDecline(req)}
                    className="py-1.5 px-3 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-500">
            Mutual friendship protects user privacy and stops spam conversations.
          </p>
        </div>
      </div>
    </div>
  );
};
