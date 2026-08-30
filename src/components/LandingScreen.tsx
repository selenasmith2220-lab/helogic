import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  Lock,
  Globe,
  Dices,
  ArrowRight,
} from 'lucide-react';
import { COUNTRIES, CHAT_ROOMS } from '../data/initialData';
import { AdSlot, Gender, User } from '../types';
import { AdPlacement } from './AdPlacement';
import { ChatNexuLogo } from './ChatNexuLogo';

interface LandingScreenProps {
  onJoin: (user: User) => void;
  adSlots: AdSlot[];
  onOpenGoogleAuth?: () => void;
  onOpenAdmin?: () => void;
}

const RANDOM_NAMES = [
  'SkyWalker',
  'BlueOcean',
  'StarGazer',
  'Nova_Spark',
  'QuietThinker',
  'SunnyVibe',
  'MidnightDreamer',
  'Luna_Rose',
  'EchoChamber',
  'CoffeeNomad',
];

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onJoin,
  adSlots,
  onOpenGoogleAuth,
  onOpenAdmin,
}) => {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(23);
  const [countryCode, setCountryCode] = useState<string>('US');
  const [selectedRoom, setSelectedRoom] = useState<string>('global');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const handleRandomName = () => {
    const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const num = Math.floor(10 + Math.random() * 89);
    setNickname(`${name}_${num}`);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim();
    if (!cleanNick) {
      setErrorMsg('Please enter a chat nickname to continue.');
      return;
    }
    if (cleanNick.length < 3) {
      setErrorMsg('Nickname must be at least 3 characters.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the 18+ terms & chat guidelines.');
      return;
    }

    const defaultAvatars = {
      male: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      female: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      other: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      nickname: cleanNick,
      gender,
      age: Number(age) || 22,
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      flag: selectedCountry.flag,
      avatar: defaultAvatars[gender],
      isOnline: true,
      ipAddress: '192.168.' + Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254),
      joinedAt: Date.now(),
      bio: 'New Chat Nexu visitor! Say hello 👋',
      statusMessage: 'Available to chat',
      currentRoom: selectedRoom,
      lastActive: Date.now(),
    };

    onJoin(newUser);
  };

  const topAd = adSlots.find((s) => s.placement === 'header_top');
  const bottomAd = adSlots.find((s) => s.placement === 'bottom_anchor');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-slate-800">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white/95 border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <ChatNexuLogo size="md" showTagline={true} />

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>14,920 Online Worldwide</span>
            </div>

            {onOpenAdmin && (
              <button
                id="landing-header-admin-btn"
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Staff Portal Login"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Staff Access</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Top Header Ad Placement */}
      {topAd && (
        <div className="pt-3 pb-1">
          <AdPlacement slot={topAd} />
        </div>
      )}

      {/* Main Hero & Guest Entry Card */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-6 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            No registration &bull; 100% Anonymous &bull; Meet new friends
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Start Chatting Anonymously
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Connect with thousands of people worldwide in open chat rooms or private 1-on-1 conversations.
          </p>
        </div>

        {/* Entrance Box */}
        <div id="entrance-guest-card" className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">Guest Quick Entrance</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
              Instant Access
            </span>
          </div>

          <form id="guest-entrance-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Nickname */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="nickname-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nickname / Screen Name
                </label>
                <button
                  id="random-name-button"
                  type="button"
                  onClick={handleRandomName}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  Random
                </button>
              </div>
              <div className="relative">
                <input
                  id="nickname-input"
                  type="text"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. Alex_99 or BlueOcean"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="gender-male-btn"
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-400/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">👨</span> Male
                </button>
                <button
                  id="gender-female-btn"
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">👩</span> Female
                </button>
                <button
                  id="gender-other-btn"
                  type="button"
                  onClick={() => setGender('other')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'other'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-400/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">✨</span> Other
                </button>
              </div>
            </div>

            {/* Age & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="age-range-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Age: <span className="text-sky-600 font-extrabold">{age}</span>
                </label>
                <input
                  id="age-range-input"
                  type="range"
                  min="18"
                  max="75"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>18</span>
                  <span>45</span>
                  <span>75+</span>
                </div>
              </div>

              <div>
                <label htmlFor="country-select-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <select
                  id="country-select-input"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Starting Room */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Chat Room
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CHAT_ROOMS.slice(0, 4).map((room) => (
                  <button
                    key={room.id}
                    id={`room-select-${room.id}`}
                    type="button"
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedRoom === room.id
                        ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>{room.name}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {room.userCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  id="terms-agree-checkbox"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>
                  I confirm that I am at least 18 years old and agree to adhere to safe, respectful community chat standards.
                </span>
              </label>
            </div>

            {/* Start Button */}
            <button
              id="start-chat-btn"
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99]"
            >
              <span>Start Chatting as Guest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google Sign Up Alternative */}
            {onOpenGoogleAuth && (
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Or Sign In for VIP Access
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  id="landing-google-auth-btn"
                  type="button"
                  onClick={onOpenGoogleAuth}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>
              </div>
            )}

          </form>

          {/* Guarantees */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 text-center text-[11px] text-slate-500">
            <div className="flex flex-col items-center gap-1">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>100% Anonymous</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Zero Registration</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Globe className="w-4 h-4 text-sky-600" />
              <span>Worldwide Peers</span>
            </div>
          </div>
        </div>

        {/* Community Info Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-center">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-xl mb-1">💬</div>
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Instant 1-on-1 Chat
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Click any online visitor to open a secure private direct messaging tab.
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-xl mb-1">🛡️</div>
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Safety & Moderation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Automated profanity filters & report tools keep the conversation clean.
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-xl mb-1">🌐</div>
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Host on GitHub Pages
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pure client-side static design with ad script integration for earnings.
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Anchor Ad */}
      {bottomAd && (
        <AdPlacement slot={bottomAd} />
      )}
    </div>
  );
};
