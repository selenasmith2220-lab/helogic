import React from 'react';
import { Plus, Globe, Users, Sparkles } from 'lucide-react';
import { Story, User } from '../types';

interface StoriesBarProps {
  stories: Story[];
  currentUser: User;
  friendIds: string[];
  onOpenCreateStory: () => void;
  onSelectStory: (index: number) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  friendIds,
  onOpenCreateStory,
  onSelectStory,
}) => {
  // Filter stories:
  // - Global stories are visible to everyone
  // - Friends-only stories are visible if the user is in friendIds OR if it's the currentUser's own story
  const visibleStories = stories.filter((s) => {
    if (s.userId === currentUser.id) return true;
    if (s.privacy === 'global') return true;
    if (s.privacy === 'friends_only') {
      return friendIds.includes(s.userId);
    }
    return true;
  });

  const myActiveStory = stories.find((s) => s.userId === currentUser.id);

  return (
    <div className="bg-white border-b border-slate-200 px-3 py-2.5 overflow-x-auto flex items-center gap-3 select-none no-scrollbar">
      {/* 1. Current User "Add Story" Button / Own Story */}
      <div className="flex flex-col items-center shrink-0 w-16 text-center group">
        <div className="relative">
          {myActiveStory ? (
            <button
              onClick={() => {
                const idx = visibleStories.findIndex((s) => s.id === myActiveStory.id);
                if (idx !== -1) onSelectStory(idx);
              }}
              className="relative p-0.5 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={currentUser.avatar}
                alt="My Story"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            </button>
          ) : (
            <button
              onClick={onOpenCreateStory}
              className="w-13 h-13 rounded-full border-2 border-dashed border-purple-400 bg-purple-50/70 hover:bg-purple-100 flex items-center justify-center text-purple-600 transition-all hover:scale-105 cursor-pointer"
              title="Post a 24h Story"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Plus badge on avatar if already has story */}
          {myActiveStory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateStory();
              }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center border-2 border-white shadow-xs cursor-pointer"
              title="Add another story"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          )}
        </div>
        <span className="text-[11px] font-bold text-slate-800 mt-1 truncate max-w-[62px]">
          {myActiveStory ? 'Your Story' : 'Add Story'}
        </span>
      </div>

      {/* Divider */}
      <div className="h-9 w-px bg-slate-200 shrink-0" />

      {/* 2. List of Community Stories */}
      {visibleStories.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>No active stories yet. Be the first to share one!</span>
        </div>
      ) : (
        visibleStories.map((story, index) => {
          const isViewed = story.viewers.some((v) => v.userId === currentUser.id);
          const isOwn = story.userId === currentUser.id;
          if (isOwn && myActiveStory) return null; // Already rendered in front

          return (
            <button
              key={story.id}
              onClick={() => onSelectStory(index)}
              className="flex flex-col items-center shrink-0 w-16 text-center cursor-pointer group hover:scale-105 transition-transform"
            >
              <div className="relative">
                <div
                  className={`p-0.5 rounded-full ${
                    isViewed
                      ? 'bg-slate-300'
                      : 'bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-400 animate-gradient'
                  }`}
                >
                  <img
                    src={story.userAvatar}
                    alt={story.userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                </div>

                {/* Privacy Badge */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white border-2 border-white shadow-2xs ${
                    story.privacy === 'friends_only' ? 'bg-emerald-600' : 'bg-sky-600'
                  }`}
                  title={story.privacy === 'friends_only' ? 'Friends Only' : 'Global Story'}
                >
                  {story.privacy === 'friends_only' ? (
                    <Users className="w-2.5 h-2.5" />
                  ) : (
                    <Globe className="w-2.5 h-2.5" />
                  )}
                </div>
              </div>

              <span className="text-[11px] font-semibold text-slate-700 mt-1 truncate max-w-[62px]">
                {story.userName}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
};
