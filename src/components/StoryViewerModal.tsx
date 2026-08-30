import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Globe,
  Users,
  Send,
  Sparkles,
} from 'lucide-react';
import { Story, User } from '../types';

interface StoryViewerModalProps {
  stories: Story[];
  initialStoryIndex: number;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onLikeStory: (storyId: string) => void;
  onRecordView: (storyId: string) => void;
  onReplyToStory: (story: Story, replyText: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStoryIndex,
  currentUser,
  isOpen,
  onClose,
  onLikeStory,
  onRecordView,
  onReplyToStory,
}) => {
  if (!isOpen || stories.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(stories.length - 1, initialStoryIndex))
  );
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showViewersList, setShowViewersList] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];
  const isLikedByMe = currentStory?.likedBy?.includes(currentUser.id);
  const isOwnStory = currentStory?.userId === currentUser.id;

  // Record view on story mount or index change
  useEffect(() => {
    if (currentStory) {
      onRecordView(currentStory.id);
      setProgress(0);
    }
  }, [currentIndex, currentStory?.id]);

  // Story Auto-progress timer (5 seconds per story)
  useEffect(() => {
    if (isPaused || showViewersList) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // ~5 seconds for 100%
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, isPaused, showViewersList, onClose]);

  // Keyboard navigation (Escape, Left Arrow, Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < stories.length - 1) {
        setCurrentIndex((i) => i + 1);
        setProgress(0);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setProgress(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplyToStory(currentStory, replyText.trim());
    setReplyText('');
    alert(`Replied to ${currentStory.userName}'s story! Check your private chat tab.`);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffHours = Math.floor((Date.now() - timestamp) / 3600000);
    if (diffHours <= 0) return 'Just now';
    if (diffHours === 1) return '1h ago';
    return `${diffHours}h ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in select-none">
      {/* Viewer Container */}
      <div
        className="relative w-full max-w-md h-[88vh] max-h-[780px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Progress Segmented Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 p-3 pt-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex gap-1 mb-2.5">
            {stories.map((s, idx) => {
              let fillWidth = 0;
              if (idx < currentIndex) fillWidth = 100;
              else if (idx === currentIndex) fillWidth = progress;

              return (
                <div
                  key={s.id}
                  className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${fillWidth}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.userName}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/80 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-bold text-xs">{currentStory.userName}</span>
                  <span className="text-xs">{currentStory.userFlag}</span>
                  <span className="text-[10px] text-white/70">
                    &bull; {formatTimeAgo(currentStory.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/75 mt-0.5">
                  {currentStory.privacy === 'global' ? (
                    <span className="flex items-center gap-0.5 text-sky-300">
                      <Globe className="w-2.5 h-2.5" />
                      <span>Global Story</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-emerald-300 font-semibold">
                      <Users className="w-2.5 h-2.5" />
                      <span>Friends Only</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Content Area */}
        <div className="relative flex-1 flex items-center justify-center w-full h-full overflow-hidden">
          {currentStory.mediaUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={currentStory.mediaUrl}
                alt="Story content"
                className="w-full h-full object-cover"
              />
              {currentStory.caption && (
                <div className="absolute bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs sm:text-sm font-medium text-center">
                  <p className="drop-shadow-md">{currentStory.caption}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`w-full h-full p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br ${
                currentStory.backgroundGradient || 'from-purple-900 via-indigo-900 to-slate-900'
              } text-white`}
            >
              <Sparkles className="w-8 h-8 text-amber-300 mb-4 opacity-80" />
              <p className="font-extrabold text-base sm:text-lg leading-relaxed drop-shadow-md max-w-[85%]">
                {currentStory.text}
              </p>
              {currentStory.caption && (
                <span className="mt-4 text-xs text-white/80 bg-black/30 px-3 py-1 rounded-full backdrop-blur-xs font-semibold">
                  {currentStory.caption}
                </span>
              )}
            </div>
          )}

          {/* Left/Right Navigation Taps */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-16 w-1/3 z-10 cursor-pointer flex items-center pl-2 group"
          >
            {currentIndex > 0 && (
              <div className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft className="w-5 h-5" />
              </div>
            )}
          </div>

          <div
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-16 w-1/3 z-10 cursor-pointer flex items-center justify-end pr-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Story Bottom Controls */}
        <div className="relative z-20 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {/* Viewers counter (clicking reveals viewers modal) */}
            <button
              onClick={() => setShowViewersList(!showViewersList)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
              title="Click to see who viewed this story"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentStory.viewsCount || 0} views</span>
            </button>

            {/* Like / Heart Button */}
            <button
              onClick={() => onLikeStory(currentStory.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xs transition-all cursor-pointer ${
                isLikedByMe
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-white/15 hover:bg-white/25 text-white font-semibold'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-current text-white scale-110' : ''}`}
              />
              <span className="text-xs">{currentStory.likesCount || 0}</span>
            </button>
          </div>

          {/* Quick Reply Form (only for stories not authored by currentUser) */}
          {!isOwnStory && (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Reply to ${currentStory.userName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-white/15 border border-white/20 rounded-full text-white placeholder-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 backdrop-blur-xs"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-xs transition-colors shrink-0 cursor-pointer"
                title="Send reply"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Viewers Drawer / Popover */}
        {showViewersList && (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-slate-900/95 border-t border-slate-700 rounded-t-2xl p-4 max-h-64 overflow-y-auto text-white animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Story Viewers ({currentStory.viewers?.length || 0})</span>
              </div>
              <button
                onClick={() => setShowViewersList(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(!currentStory.viewers || currentStory.viewers.length === 0) ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No recorded views yet. You are among the first!
              </p>
            ) : (
              <div className="space-y-2">
                {currentStory.viewers.map((viewer, vIdx) => (
                  <div
                    key={vIdx}
                    className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={viewer.userAvatar}
                        alt={viewer.userName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold">{viewer.userName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatTimeAgo(viewer.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
