import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  LogOut,
  ChevronDown,
  Users,
  MessageSquare,
  Compass,
  Video,
  Crown,
  Bot,
  Sparkles,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { ChatRoom, User } from '../types';
import { CHAT_ROOMS, COUNTRIES } from '../data/initialData';
import { ChatNexuLogo } from './ChatNexuLogo';

interface HeaderProps {
  currentUser: User;
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onlineCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
  activeMobileTab: 'users' | 'chat' | 'rooms';
  setActiveMobileTab: (tab: 'users' | 'chat' | 'rooms') => void;
  onOpenVideoChat: () => void;
  onOpenSubscribe: () => void;
  onOpenGoogleAuth: () => void;
  onOpenAIAssistant: () => void;
  locationFilter: string;
  onSelectLocation: (loc: string) => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRoomId,
  onSelectRoom,
  onlineCount,
  soundEnabled,
  onToggleSound,
  onLogout,
  activeMobileTab,
  setActiveMobileTab,
  onOpenVideoChat,
  onOpenSubscribe,
  onOpenGoogleAuth,
  onOpenAIAssistant,
  locationFilter,
  onSelectLocation,
  onOpenAdmin,
}) => {
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const currentRoom = CHAT_ROOMS.find((r) => r.id === currentRoomId) || CHAT_ROOMS[0];

  return (
    <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Brand & Room & Location Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="cursor-pointer select-none"
            onClick={() => onSelectRoom('global')}
          >
            <ChatNexuLogo size="sm" showTagline={true} />
          </div>

          {/* Room Selector Dropdown */}
          <div className="relative">
            <button
              id="header-room-selector-btn"
              onClick={() => setShowRoomDropdown(!showRoomDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <span className="max-w-[85px] sm:max-w-[130px] truncate font-bold">
                #{currentRoom.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showRoomDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoomDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Chat Room
                  </div>
                  {CHAT_ROOMS.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => {
                        onSelectRoom(room.id);
                        setShowRoomDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer ${
                        currentRoomId === room.id
                          ? 'font-bold text-sky-600 bg-sky-50/50'
                          : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{room.name}</div>
                        <div className="text-[10px] text-slate-400">{room.description}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        {room.userCount}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Global / Location Connectivity Filter Dropdown */}
          <div className="relative hidden md:block">
            <button
              id="header-location-filter-btn"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                locationFilter === 'global'
                  ? 'bg-sky-50/70 border-sky-200 text-sky-800 hover:bg-sky-100/70'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
              title="Filter online users: Anyone globally or specific country"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span className="max-w-[120px] truncate font-bold">
                {locationFilter === 'global' ? '🌍 Worldwide' : locationFilter}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLocationDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLocationDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-64 max-h-80 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Connect With People By Location
                  </div>

                  <button
                    onClick={() => {
                      onSelectLocation('global');
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer ${
                      locationFilter === 'global' ? 'font-bold text-sky-600 bg-sky-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">🌍</span>
                      <div>
                        <div className="font-bold">Anyone Worldwide (Global)</div>
                        <div className="text-[10px] text-slate-400">Connect to visitors from all countries</div>
                      </div>
                    </span>
                  </button>

                  <div className="py-1">
                    <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Or Choose Specific Country
                    </div>
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onSelectLocation(c.name);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer ${
                          locationFilter === c.name ? 'font-bold text-sky-600 bg-sky-50/60' : 'text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Live Online Count */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{onlineCount.toLocaleString()} online</span>
          </div>
        </div>

        {/* Center/Right: Feature Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Video Roulette Button */}
          <button
            id="header-video-chat-btn"
            onClick={onOpenVideoChat}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer transform hover:scale-[1.02]"
            title="Open 1-on-1 Video Chatroom (Omegle-style)"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Chat</span>
            <span className="hidden sm:inline-block text-[9px] uppercase px-1.5 py-0.2 bg-white/20 rounded-full">
              {currentUser.isVip ? '👑 VIP' : '2m Free'}
            </span>
          </button>

          {/* VIP Subscription Pass Button */}
          <button
            id="header-vip-btn"
            onClick={onOpenSubscribe}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              currentUser.isVip
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-xs'
            }`}
            title="VIP Membership: Unlimited Video Time"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{currentUser.isVip ? 'VIP Active' : 'VIP Pass'}</span>
          </button>

          {/* AI Wingman button */}
          <button
            id="header-ai-assistant-btn"
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
            title="Open AI Wingman: Icebreakers & Chat Suggestions"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline">AI Wingman</span>
          </button>

          {/* Google Auth Button */}
          {!currentUser.isGoogleUser ? (
            <button
              id="header-google-signup-btn"
              onClick={onOpenGoogleAuth}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Sign in with Google to protect your VIP pass and payments"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline">Google Sign In</span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Google Connected</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            id="header-sound-toggle-btn"
            onClick={onToggleSound}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Admin Dashboard Access */}
          {onOpenAdmin && (
            <button
              id="header-admin-dashboard-btn"
              onClick={onOpenAdmin}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
              title="Open Chat Nexu Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Current User Profile Avatar */}
          <div
            id="header-current-user-badge"
            className="flex items-center gap-1.5 pl-1 border-l border-slate-200"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.nickname}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-300"
              />
              {currentUser.isVip && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
                  <Crown className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>{currentUser.nickname}</span>
                <span className="text-xs">{currentUser.flag}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {currentUser.isVip ? 'VIP Member' : `${currentUser.age} y/o &bull; ${currentUser.gender}`}
              </div>
            </div>
          </div>

          {/* Leave Button */}
          <button
            id="header-logout-btn"
            onClick={onLogout}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
            title="Leave chat"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Leave</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation-bar"
        className="md:hidden flex border-t border-slate-200 bg-slate-50 text-xs font-bold"
      >
        <button
          id="mobile-tab-chat-btn"
          onClick={() => setActiveMobileTab('chat')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeMobileTab === 'chat'
              ? 'text-sky-600 border-b-2 border-sky-600 bg-white'
              : 'text-slate-600'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>
        <button
          id="mobile-tab-users-btn"
          onClick={() => setActiveMobileTab('users')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeMobileTab === 'users'
              ? 'text-sky-600 border-b-2 border-sky-600 bg-white'
              : 'text-slate-600'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users</span>
        </button>
        <button
          id="mobile-tab-rooms-btn"
          onClick={() => setActiveMobileTab('rooms')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${
            activeMobileTab === 'rooms'
              ? 'text-sky-600 border-b-2 border-sky-600 bg-white'
              : 'text-slate-600'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Rooms & Ads</span>
        </button>
      </div>
    </header>
  );
};

