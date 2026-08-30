import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Smile,
  Image as ImageIcon,
  ShieldAlert,
  X,
  Lock,
  Flag,
  CornerDownRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { AdSlot, ChatMessage, ConversationTab, Gender, User } from '../types';
import { AdPlacement } from './AdPlacement';
import { playSentSound } from '../utils/audio';

interface ChatAreaProps {
  currentUser: User;
  activeTab: ConversationTab;
  tabs: ConversationTab[];
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, imageUrl?: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onReportMessage: (message: ChatMessage) => void;
  inChatAd?: AdSlot;
  typingUser?: string | null;
  onImageClick: (url: string) => void;
  isUserMuted?: boolean;
}

const COMMON_EMOJIS = [
  '😊', '😂', '❤️', '🔥', '👋', '😍', '😎', '🎉',
  '👍', '🙌', '✨', '☕', '🍕', '🍻', '🌸', '💬',
  '👀', '🤔', '💯', '🌹', '🎶', '🏖️', '🚀', '⭐',
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  currentUser,
  activeTab,
  tabs,
  onSelectTab,
  onCloseTab,
  messages,
  onSendMessage,
  onReactMessage,
  onReportMessage,
  inChatAd,
  typingUser,
  onImageClick,
  isUserMuted,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    if (isUserMuted) return;

    onSendMessage(clean);
    playSentSound();
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSendImage = () => {
    if (!imageUrlInput.trim()) return;
    onSendMessage('Shared a photo', imageUrlInput.trim());
    setImageUrlInput('');
    setShowImageModal(false);
    playSentSound();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to local preview data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSendMessage('Shared a photo', reader.result);
        setShowImageModal(false);
        playSentSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const isPrivate = activeTab.type === 'private';
  const partner = activeTab.user;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Dynamic Conversation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-2 sm:px-3 pt-2 flex items-center gap-1 overflow-x-auto select-none shrink-0 shadow-2xs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer shrink-0 border-t border-x ${
                isActive
                  ? 'bg-slate-50 border-slate-200 text-sky-700 shadow-2xs'
                  : 'bg-slate-100/70 border-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.type === 'room' ? (
                <Globe className="w-3.5 h-3.5 text-sky-600" />
              ) : (
                <div className="relative">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                </div>
              )}

              <span className="max-w-[120px] truncate">{tab.title}</span>

              {tab.unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-bounce">
                  {tab.unreadCount}
                </span>
              )}

              {tab.type === 'private' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded-md hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 ml-1 transition-colors"
                  title="Close conversation"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Conversation Subheader */}
      <div className="bg-white/80 backdrop-blur-xs border-b border-slate-200/80 px-4 py-2 flex items-center justify-between shrink-0">
        {isPrivate && partner ? (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={partner.avatar}
                alt={partner.nickname}
                className="w-8 h-8 rounded-full object-cover border border-sky-400"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">
                  {partner.nickname}
                </span>
                <span className="text-xs">{partner.flag}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                  1-on-1 Private
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {partner.age} y/o &bull; {partner.country} &bull; End-to-end encrypted session
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                {activeTab.title}
              </h3>
              <p className="text-[10px] text-slate-500">
                Public room &bull; Respect others &bull; Keep it friendly
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isPrivate && (
            <button
              onClick={() => onCloseTab(activeTab.id)}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
            >
              End Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {/* Room Welcome Header Notice */}
        <div className="text-center my-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-500 text-[11px] shadow-2xs">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>
              {isPrivate
                ? `You are now in a private 1-on-1 chat with ${partner?.nickname || 'partner'}.`
                : 'Welcome to Chat Nexu public lobby. Messages are visible to everyone in this room.'}
            </span>
          </div>
        </div>

        {/* In-Chat Native Ad Spot at top of feed */}
        {inChatAd && inChatAd.isEnabled && (
          <AdPlacement slot={inChatAd} />
        )}

        {messages.map((msg, index) => {
          const isSelf = msg.senderId === currentUser.id;
          const isFemale = msg.senderGender === 'female';

          if (msg.isSystem) {
            return (
              <div key={msg.id} className="text-center my-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-semibold">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 group ${
                isSelf ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mt-0.5 border ${
                  isFemale ? 'border-rose-300' : 'border-sky-300'
                }`}
              />

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 sm:p-3 shadow-2xs relative ${
                  isSelf
                    ? 'bg-gradient-to-tr from-sky-600 to-blue-700 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {/* Message Header (Sender Info) */}
                <div
                  className={`flex items-center gap-1.5 mb-1 text-[11px] ${
                    isSelf ? 'text-sky-100 justify-end' : 'text-slate-500'
                  }`}
                >
                  <span className="font-bold">{msg.senderName}</span>
                  <span>{msg.senderFlag}</span>
                  <span className="text-[9px] opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Text */}
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.text}
                </p>

                {/* Attached Image */}
                {msg.imageUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-black/10 cursor-pointer max-w-sm">
                    <img
                      src={msg.imageUrl}
                      alt="Shared media"
                      onClick={() => onImageClick(msg.imageUrl!)}
                      className="w-full max-h-60 object-cover hover:scale-102 transition-transform"
                    />
                  </div>
                )}

                {/* Reactions count */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => onReactMessage(msg.id, emoji)}
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          isSelf
                            ? 'bg-sky-700/60 border-sky-400/40 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Hover Quick Actions (Reactions & Report) */}
                <div
                  className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 shadow-md rounded-full px-1.5 py-0.5 z-10 ${
                    isSelf ? 'right-full mr-2' : 'left-full ml-2'
                  }`}
                >
                  {['👍', '❤️', '😂', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReactMessage(msg.id, emoji)}
                      className="hover:scale-125 transition-transform text-xs p-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                  {!isSelf && (
                    <button
                      onClick={() => onReportMessage(msg)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 border-l border-slate-200 ml-0.5"
                      title="Report this message"
                    >
                      <Flag className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-1 italic animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-40 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 max-w-xs w-full animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">Quick Emojis</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5 text-lg">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-lg hover:bg-slate-100 transition-transform active:scale-125 flex items-center justify-center cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Sharing Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>Share a Photo</span>
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload from Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
              </div>

              <div className="text-center text-[10px] text-slate-400 font-bold uppercase">
                &mdash; OR PASTE IMAGE URL &mdash;
              </div>

              {/* Option 2: Image URL */}
              <div>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendImage}
                  disabled={!imageUrlInput.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  Send Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Input Box */}
      <div className="bg-white border-t border-slate-200 p-2 sm:p-3 shrink-0">
        {isUserMuted ? (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-center gap-2">
            <span>⚠️ You have been muted by an administrator. You cannot post messages currently.</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2">
            {/* Emoji Button */}
            <button
              id="chat-emoji-toggle-btn"
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Insert emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Photo Share Button */}
            <button
              id="chat-image-share-btn"
              type="button"
              onClick={() => setShowImageModal(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Share an image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                id="chat-message-input"
                ref={inputRef}
                type="text"
                maxLength={400}
                placeholder={
                  isPrivate
                    ? `Message ${partner?.nickname || 'partner'} privately...`
                    : `Send a message to #${activeTab.title}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>

            {/* Send Button */}
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Send message"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
