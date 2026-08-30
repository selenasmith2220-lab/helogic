import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  FastForward,
  Crown,
  Sparkles,
  Send,
  Flag,
  AlertTriangle,
  Lock,
  Clock,
  Volume2,
  RefreshCw,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { SubscriptionPlan, User } from '../types';
import { playIncomingSound } from '../utils/audio';
import { COUNTRIES } from '../data/initialData';

interface VideoRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  plans: SubscriptionPlan[];
  onOpenSubscribe: () => void;
}

interface VideoStranger {
  id: string;
  name: string;
  age: number;
  country: string;
  flag: string;
  avatar: string;
  videoUrl?: string;
  status: string;
}

const STRANGER_POOL: VideoStranger[] = [
  {
    id: 'st_1',
    name: 'Elena_V',
    age: 22,
    country: 'Spain',
    flag: '🇪🇸',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    status: 'Listening to music in Barcelona 🎧',
  },
  {
    id: 'st_2',
    name: 'Marcus_LA',
    age: 26,
    country: 'United States',
    flag: '🇺🇸',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    status: 'Chilling after gym session 💪',
  },
  {
    id: 'st_3',
    name: 'Aiko_Tokyo',
    age: 23,
    country: 'Japan',
    flag: '🇯🇵',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    status: 'Late night ramen craving 🍜',
  },
  {
    id: 'st_4',
    name: 'David_CapeTown',
    age: 25,
    country: 'South Africa',
    flag: '🇿🇦',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    status: 'Coffee & sunset talks 🌅',
  },
  {
    id: 'st_5',
    name: 'Camila_Rio',
    age: 21,
    country: 'Brazil',
    flag: '🇧🇷',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    status: 'Learning English & Portuguese 👋',
  },
  {
    id: 'st_6',
    name: 'Kofi_Accra',
    age: 24,
    country: 'Ghana',
    flag: '🇬🇭',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    status: 'Afrobeats producer in Accra 🎵',
  },
  {
    id: 'st_7',
    name: 'Amara_Lagos',
    age: 23,
    country: 'Nigeria',
    flag: '🇳🇬',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
    status: 'Fashion designer in Lagos 👗',
  },
  {
    id: 'st_8',
    name: 'Liam_London',
    age: 27,
    country: 'United Kingdom',
    flag: '🇬🇧',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    status: 'Drinking tea in Shoreditch ☕',
  },
  {
    id: 'st_9',
    name: 'Chloe_Paris',
    age: 22,
    country: 'France',
    flag: '🇫🇷',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    status: 'Art student at Montmartre 🎨',
  },
  {
    id: 'st_10',
    name: 'Priya_Mumbai',
    age: 24,
    country: 'India',
    flag: '🇮🇳',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    status: 'Tech explorer & film fan 💻',
  },
  {
    id: 'st_11',
    name: 'Lucas_Berlin',
    age: 25,
    country: 'Germany',
    flag: '🇩🇪',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
    status: 'Electronic music & photography 📷',
  },
  {
    id: 'st_12',
    name: 'Mateo_CDMX',
    age: 23,
    country: 'Mexico',
    flag: '🇲🇽',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&auto=format&fit=crop&q=80',
    status: 'Rooftop cafes & travel stories 🌮',
  },
];

const STRANGER_GREETINGS = [
  'Hey there! How are you doing today?',
  'Hello from across the world! Where are you chatting from?',
  'Hey! Cool room, what time is it over there?',
  'Nice to meet you! Having a good day so far?',
  'Hi! Love the energy, say something cool!',
];

export const VideoRouletteModal: React.FC<VideoRouletteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  plans,
  onOpenSubscribe,
}) => {
  // Video Device State
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Matching & Stranger State
  const [isSearching, setIsSearching] = useState(false);
  const [currentStranger, setCurrentStranger] = useState<VideoStranger | null>(null);
  const [locationFilter, setLocationFilter] = useState<'global' | string>('global');
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  // Timer: 120s (2 minutes) free limit for regular users; unlimited countup for VIP
  const isVip = !!currentUser.isVip;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [vipElapsedSeconds, setVipElapsedSeconds] = useState<number>(0);
  const [isFreeLimitReached, setIsFreeLimitReached] = useState<boolean>(false);

  // Video text chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; isMe: boolean }>>([]);
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Initialize Camera on Open
  useEffect(() => {
    if (!isOpen) {
      // Cleanup camera stream
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
        setLocalStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });
        activeStream = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('Camera access not granted or unavailable:', err);
        setCameraError('Camera access not detected or denied. Using simulated avatar video.');
      }
    }

    initCamera();
    findRandomStranger();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  // Connect local video element when stream is ready
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Countdown timer for free users vs VIP timer
  useEffect(() => {
    if (!isOpen || isSearching || isFreeLimitReached) return;

    const interval = setInterval(() => {
      if (isVip) {
        setVipElapsedSeconds((prev) => prev + 1);
      } else {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsFreeLimitReached(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isSearching, isVip, isFreeLimitReached]);

  // Scroll chat messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const findRandomStranger = (targetLocation?: string) => {
    setIsSearching(true);
    setCurrentStranger(null);
    setChatMessages([]);

    const activeLoc = targetLocation !== undefined ? targetLocation : locationFilter;

    setTimeout(() => {
      let candidatePool = STRANGER_POOL;
      if (activeLoc !== 'global') {
        const matching = STRANGER_POOL.filter(
          (s) =>
            s.country.toLowerCase() === activeLoc.toLowerCase() ||
            s.country.toLowerCase().includes(activeLoc.toLowerCase())
        );
        if (matching.length > 0) {
          candidatePool = matching;
        }
      }

      const randomStranger = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      setCurrentStranger(randomStranger);
      setIsSearching(false);

      // Stranger sends opening greeting
      const randomGreeting = STRANGER_GREETINGS[Math.floor(Math.random() * STRANGER_GREETINGS.length)];
      setTimeout(() => {
        playIncomingSound();
        setChatMessages((prev) => [
          ...prev,
          { sender: randomStranger.name, text: randomGreeting, isMe: false },
        ]);
      }, 1400);
    }, 1200);
  };

  const handleNext = () => {
    if (isFreeLimitReached && !isVip) {
      onOpenSubscribe();
      return;
    }
    findRandomStranger();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentStranger) return;

    const userMsg = inputText.trim();
    setChatMessages((prev) => [...prev, { sender: currentUser.nickname, text: userMsg, isMe: true }]);
    setInputText('');

    // Stranger replies
    setTimeout(() => {
      playIncomingSound();
      const replies = [
        'Haha totally! 😄',
        'That is so cool! Tell me more about it.',
        'Same here! Video chat roulette is so much fun.',
        'I love your vibe! Where did you say you were from?',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [...prev, { sender: currentStranger.name, text: reply, isMe: false }]);
    }, 1800);
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoMuted;
      });
    }
    setIsVideoMuted(!isVideoMuted);
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 text-white w-full max-w-5xl h-[92vh] max-h-[820px] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col">
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                Chat Nexu Video Roulette
              </h3>
            </div>

            {/* Timer Badge */}
            {isVip ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>VIP Unlimited: {formatTime(vipElapsedSeconds)}</span>
              </div>
            ) : (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  secondsRemaining <= 30
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse'
                    : 'bg-slate-800 border border-slate-700 text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Free Trial: {formatTime(secondsRemaining)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Global / Location Selector */}
            <div className="relative">
              <button
                id="video-location-btn"
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                title="Connect with anyone globally or pick a country"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="max-w-[110px] truncate">
                  {locationFilter === 'global'
                    ? '🌍 Worldwide'
                    : locationFilter}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLocationMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLocationMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select Video Match Location
                    </div>

                    <button
                      onClick={() => {
                        setLocationFilter('global');
                        setShowLocationMenu(false);
                        findRandomStranger('global');
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                        locationFilter === 'global' ? 'text-sky-400 font-bold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🌍</span> Connect to Anyone Worldwide (Global)
                      </span>
                    </button>

                    <div className="py-1">
                      <div className="px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Specific Countries
                      </div>
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setLocationFilter(c.name);
                            setShowLocationMenu(false);
                            findRandomStranger(c.name);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                            locationFilter === c.name ? 'text-sky-400 font-bold bg-slate-800/60' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{c.flag}</span> {c.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isVip && (
              <button
                id="video-upgrade-vip-btn"
                onClick={onOpenSubscribe}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Get VIP (No Limit)</span>
              </button>
            )}

            <button
              id="video-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Video Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 30-Second Warning Banner */}
        {!isVip && secondsRemaining <= 30 && !isFreeLimitReached && (
          <div className="bg-gradient-to-r from-amber-600 to-rose-600 px-4 py-1.5 text-xs text-white font-bold flex items-center justify-between shrink-0 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Only {secondsRemaining}s left on your free video preview!</span>
            </div>
            <button
              onClick={onOpenSubscribe}
              className="underline font-black hover:text-amber-200 cursor-pointer"
            >
              Upgrade now to stay connected &rarr;
            </button>
          </div>
        )}

        {/* Main Split Stage: Video Displays + Text Chat */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-slate-950 overflow-hidden relative">
          {/* Free Limit Reached Overlay */}
          {isFreeLimitReached && !isVip && (
            <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white">Free 2-Minute Time Limit Reached!</h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2">
                Your 2-minute free connection trial has expired. Subscribe to <strong>Chat Nexu VIP</strong> for unlimited hours of video chatting with zero interruptions!
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  id="unlock-vip-btn"
                  onClick={onOpenSubscribe}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer transform hover:scale-105 transition-all"
                >
                  <Crown className="w-4 h-4" />
                  <span>Unlock Unlimited Video (From $1.99)</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Exit Video Roulette
                </button>
              </div>
            </div>
          )}

          {/* Left / Center: Dual Video Stages */}
          <div className="flex-1 flex flex-col sm:grid sm:grid-cols-2 gap-2 p-2 sm:p-3 min-h-0 bg-slate-900/60">
            {/* Remote Stranger Video */}
            <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[190px]">
              {isSearching ? (
                <div className="text-center p-4 space-y-3">
                  <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-bold text-slate-300">Searching for a live partner...</div>
                  <div className="text-[10px] text-slate-500">Connecting across 190+ countries</div>
                </div>
              ) : currentStranger ? (
                <>
                  <img
                    src={currentStranger.avatar}
                    alt={currentStranger.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Stranger Metadata Overlay */}
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold">
                    <span>{currentStranger.flag}</span>
                    <span>{currentStranger.name}, {currentStranger.age}</span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-slate-300">
                    <span className="truncate">{currentStranger.status}</span>
                    <div className="flex items-center gap-1 shrink-0 text-emerald-400">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Local User Video */}
            <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[190px]">
              {localStream && !isVideoMuted ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="text-center p-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.nickname}
                    className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-slate-700 mb-2"
                  />
                  <div className="text-xs font-bold text-slate-300">{currentUser.nickname} (You)</div>
                  <div className="text-[10px] text-slate-500">
                    {isVideoMuted ? 'Camera Muted' : cameraError || 'Live Audio Active'}
                  </div>
                </div>
              )}

              {/* Local Tag */}
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold">
                <span>{currentUser.flag}</span>
                <span>You ({currentUser.nickname})</span>
                {isVip && <Crown className="w-3.5 h-3.5 text-amber-400" />}
              </div>

              {/* Local Video & Audio Toggle Controls */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-lg backdrop-blur-md text-white transition-colors cursor-pointer ${
                    isMicMuted ? 'bg-rose-600/80' : 'bg-black/60 hover:bg-black/80'
                  }`}
                  title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2 rounded-lg backdrop-blur-md text-white transition-colors cursor-pointer ${
                    isVideoMuted ? 'bg-rose-600/80' : 'bg-black/60 hover:bg-black/80'
                  }`}
                  title={isVideoMuted ? 'Enable camera' : 'Disable camera'}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: In-Video Text Chat Overlay */}
          <div className="w-full md:w-80 h-48 md:h-full bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0">
            <div className="p-2.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Live Video Chat</span>
              <span className="text-[10px] text-slate-500">1-on-1 encrypted</span>
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs italic">
                  Say hello to your video match! 👋
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl max-w-[85%] break-words ${
                      msg.isMe
                        ? 'ml-auto bg-sky-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-70 mb-0.5">{msg.sender}</div>
                    <div>{msg.text}</div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Type a message to stranger..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={200}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Roulette Actions Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2">
            <button
              id="video-skip-next-btn"
              onClick={handleNext}
              disabled={isSearching}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
            >
              <FastForward className="w-4 h-4" />
              <span>Next Stranger (Esc)</span>
            </button>

            <button
              onClick={() => {
                if (currentStranger) {
                  alert(`Report submitted for ${currentStranger.name}. Moderation review in progress.`);
                  findRandomStranger();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Report Stranger for inappropriate behavior"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Report</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isVip && (
              <button
                onClick={onOpenSubscribe}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Remove 2-Min Cap</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Stop & Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
