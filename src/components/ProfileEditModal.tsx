import React, { useState } from 'react';
import {
  X,
  Camera,
  Check,
  User as UserIcon,
  Sparkles,
  MapPin,
  Smile,
  FileText,
  Upload,
} from 'lucide-react';
import { Gender, User } from '../types';
import { COUNTRIES } from '../data/initialData';

interface ProfileEditModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updated: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [nickname, setNickname] = useState(currentUser.nickname);
  const [age, setAge] = useState(currentUser.age);
  const [gender, setGender] = useState<Gender>(currentUser.gender);
  const [country, setCountry] = useState(currentUser.country);
  const [flag, setFlag] = useState(currentUser.flag);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [avatarTab, setAvatarTab] = useState<'presets' | 'custom'>('presets');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCountryChange = (selectedCountryName: string) => {
    setCountry(selectedCountryName);
    const matched = COUNTRIES.find((c) => c.name === selectedCountryName);
    if (matched) {
      setFlag(matched.flag);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    const updatedUser: User = {
      ...currentUser,
      nickname: nickname.trim(),
      age: Math.max(13, Math.min(100, Number(age) || 18)),
      gender,
      country,
      flag,
      statusMessage: statusMessage.trim(),
      bio: bio.trim(),
      avatar,
    };

    onSaveProfile(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Edit Your Profile</h2>
              <p className="text-xs text-sky-100">Update your avatar, bio & community details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3 group">
              <img
                src={avatar}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-sky-500"
              />
              <label
                htmlFor="avatar-file-input"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </label>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Avatar Selector Tabs */}
            <div className="w-full">
              <div className="flex border-b border-slate-200 mb-3 justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setAvatarTab('presets')}
                  className={`pb-1.5 font-bold cursor-pointer transition-colors ${
                    avatarTab === 'presets'
                      ? 'border-b-2 border-sky-600 text-sky-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Preset Avatars
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('custom')}
                  className={`pb-1.5 font-bold cursor-pointer transition-colors ${
                    avatarTab === 'custom'
                      ? 'border-b-2 border-sky-600 text-sky-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Custom Photo / URL
                </button>
              </div>

              {avatarTab === 'presets' ? (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 justify-items-center">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAvatar(url)}
                      className={`relative rounded-full overflow-hidden w-10 h-10 border-2 transition-transform cursor-pointer hover:scale-110 ${
                        avatar === url ? 'border-sky-600 ring-2 ring-sky-400' : 'border-transparent opacity-80'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      {avatar === url && (
                        <div className="absolute inset-0 bg-sky-600/40 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image web URL..."
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <label
                    htmlFor="avatar-file-input-manual"
                    className="w-full py-2 px-3 border border-dashed border-sky-300 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 flex items-center justify-center gap-1.5 cursor-pointer font-semibold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Picture from Device</span>
                  </label>
                  <input
                    id="avatar-file-input-manual"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Nickname & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nickname</label>
              <input
                type="text"
                required
                maxLength={24}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min={13}
                max={100}
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Gender & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Non-Binary / Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Country & Flag</span>
                <span className="text-sm">{flag}</span>
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Message */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-sky-600" />
              <span>Status Headline</span>
              <span className="text-slate-400 font-normal ml-auto">(e.g. In coffee mood ☕)</span>
            </label>
            <input
              type="text"
              maxLength={40}
              placeholder="What are you currently up to?"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>About You (Bio)</span>
            </label>
            <textarea
              rows={3}
              maxLength={200}
              placeholder="Share a little bit about your interests, music taste, hobbies..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className={`flex-1 py-2.5 font-bold rounded-xl text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
