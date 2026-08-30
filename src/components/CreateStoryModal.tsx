import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Globe,
  Users,
  Image as ImageIcon,
  Palette,
  Check,
} from 'lucide-react';
import { Story, User } from '../types';

interface CreateStoryModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onPostStory: (storyData: Omit<Story, 'id' | 'createdAt' | 'expiresAt' | 'viewsCount' | 'viewers' | 'likesCount' | 'likedBy'>) => void;
}

const GRADIENT_PRESETS = [
  { name: 'Sunset Glow', class: 'from-rose-500 via-purple-600 to-amber-500' },
  { name: 'Ocean Depths', class: 'from-blue-600 via-cyan-600 to-indigo-900' },
  { name: 'Neon Night', class: 'from-purple-900 via-indigo-900 to-slate-950' },
  { name: 'Emerald Forest', class: 'from-emerald-600 via-teal-700 to-slate-900' },
  { name: 'Berry Twilight', class: 'from-pink-600 via-rose-700 to-indigo-900' },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onPostStory,
}) => {
  if (!isOpen) return null;

  const [storyType, setStoryType] = useState<'photo' | 'text'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].class);
  const [privacy, setPrivacy] = useState<'global' | 'friends_only'>('global');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storyType === 'photo' && !mediaUrl.trim()) {
      alert('Please select or upload a photo for your story!');
      return;
    }
    if (storyType === 'text' && !textContent.trim()) {
      alert('Please write some text for your story!');
      return;
    }

    setIsSubmitting(true);

    onPostStory({
      userId: currentUser.id,
      userName: currentUser.nickname,
      userAvatar: currentUser.avatar,
      userGender: currentUser.gender,
      userCountry: currentUser.country,
      userFlag: currentUser.flag,
      mediaUrl: storyType === 'photo' ? mediaUrl.trim() : undefined,
      backgroundGradient: storyType === 'text' ? selectedGradient : undefined,
      text: storyType === 'text' ? textContent.trim() : undefined,
      caption: caption.trim() || undefined,
      privacy,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Create New Story</h2>
              <p className="text-[11px] text-purple-100">Disappears automatically after 24 hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Format Toggle: Photo vs Text */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setStoryType('photo')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                storyType === 'photo'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photo Story</span>
            </button>
            <button
              type="button"
              onClick={() => setStoryType('text')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                storyType === 'text'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Text / Gradient Story</span>
            </button>
          </div>

          {/* Photo Story Inputs */}
          {storyType === 'photo' ? (
            <div className="space-y-3">
              {mediaUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-[9/12] max-h-64 bg-slate-900 border border-slate-200 flex items-center justify-center">
                  <img
                    src={mediaUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50/40 hover:bg-purple-50/70 transition-colors">
                  <label
                    htmlFor="story-file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800">
                      Upload photo from phone or computer
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Supports JPG, PNG, GIF, or WebP
                    </span>
                  </label>
                  <input
                    id="story-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Or quick photo sample */}
              {!mediaUrl && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Or pick a quick sample photo
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {[
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
                    ].map((sampleUrl, idx) => (
                      <img
                        key={idx}
                        src={sampleUrl}
                        alt="sample"
                        onClick={() => setMediaUrl(sampleUrl)}
                        className="w-14 h-14 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Add a caption to your story..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          ) : (
            /* Text / Gradient Story Inputs */
            <div className="space-y-3">
              {/* Gradient Preview Box */}
              <div
                className={`rounded-xl aspect-[9/12] max-h-60 p-5 bg-gradient-to-br ${selectedGradient} text-white flex flex-col justify-center items-center text-center shadow-md relative overflow-hidden`}
              >
                <p className="font-extrabold text-sm sm:text-base leading-snug drop-shadow-md break-words max-w-[90%]">
                  {textContent || 'Type your message below to preview your story card...'}
                </p>
                {caption && (
                  <span className="absolute bottom-3 text-[11px] text-white/80 font-medium">
                    {caption}
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Story Text
                </label>
                <textarea
                  rows={3}
                  maxLength={180}
                  placeholder="What's on your mind? Share a thought, quote, song or announcement..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pick Background Color
                </label>
                <div className="flex gap-2">
                  {GRADIENT_PRESETS.map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedGradient(g.class)}
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${g.class} transition-transform cursor-pointer flex items-center justify-center ${
                        selectedGradient === g.class ? 'ring-2 ring-purple-600 scale-110' : 'opacity-80'
                      }`}
                      title={g.name}
                    >
                      {selectedGradient === g.class && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIENCE SELECTOR: Global vs Friends Only (User Request Requirement!) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Who can see this story?</span>
              <span className="text-[10px] text-purple-600 font-semibold uppercase">
                Privacy Setting
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPrivacy('global')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  privacy === 'global'
                    ? 'border-purple-500 bg-purple-50/80 text-purple-950 font-bold ring-1 ring-purple-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    privacy === 'global' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Global Users</div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">
                    Anyone on the site can view
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('friends_only')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  privacy === 'friends_only'
                    ? 'border-purple-500 bg-purple-50/80 text-purple-950 font-bold ring-1 ring-purple-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    privacy === 'friends_only' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs">Friends Only</div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">
                    Only accepted friends can view
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Post Story</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
