import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, Copy, Check, MessageSquare, Zap, Heart, Globe, Lightbulb } from 'lucide-react';
import { User } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onInsertToChat?: (text: string) => void;
}

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onInsertToChat,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai_welcome',
      sender: 'ai',
      text: `Hey ${currentUser.nickname}! 👋 I'm your Nexu AI Wingman. Need a killer icebreaker, translation help, or fun topics for video roulette? Choose a prompt below or ask me anything!`,
      timestamp: Date.now(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMsg: AIMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          mode: 'wingman',
          prompt,
          context: `User: ${currentUser.nickname}, gender: ${currentUser.gender}, age: ${currentUser.age}, room: ${currentUser.currentRoom}`,
        }),
      });

      const data = await res.json();
      const aiReply: AIMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.response || 'Here is an icebreaker: "If you could trade lives with any fictional character for 24 hours, who is it?"',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      const fallbackReply: AIMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: '🔥 Try this icebreaker: "Hey! Quick question: What is the most spontaneous thing you\'ve done this year?"',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden flex flex-col h-[85vh] max-h-[620px]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">Nexu AI Wingman</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-white/25 rounded-full">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] text-indigo-100">Icebreakers, witty replies & conversation coaching</p>
            </div>
          </div>
          <button
            id="ai-assistant-close-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Pills */}
        <div className="p-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => handleSendPrompt('Give me 3 witty, charming icebreakers for text chat')}
            className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>✨ 3 Witty Icebreakers</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendPrompt('Give me a fun question to ask someone on video roulette')}
            className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Lightbulb className="w-3 h-3 text-purple-500" />
            <span>📹 Video Question</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendPrompt('Give me a sweet, polite compliment to break the ice')}
            className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Heart className="w-3 h-3 text-rose-500" />
            <span>💖 Sweet Compliment</span>
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 rounded-2xl max-w-[88%] text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {/* Action buttons for AI messages */}
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-2 mt-1 ml-1 text-[10px] text-slate-400">
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onInsertToChat && (
                    <button
                      onClick={() => {
                        onInsertToChat(msg.text);
                        onClose();
                      }}
                      className="flex items-center gap-1 hover:text-sky-600 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Use in Chat</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Nexu AI is crafting the perfect message...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask for icebreakers, pickup lines, translation..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
