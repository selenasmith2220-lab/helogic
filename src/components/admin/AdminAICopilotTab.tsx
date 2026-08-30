import React, { useState } from 'react';
import { Bot, Sparkles, Send, Copy, Check, Megaphone, TrendingUp, Shield, Lightbulb } from 'lucide-react';
import { AdminSettings } from '../../types';

interface AdminAICopilotTabProps {
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
}

interface CopilotMessage {
  id: string;
  sender: 'ai' | 'admin';
  text: string;
  timestamp: number;
}

export const AdminAICopilotTab: React.FC<AdminAICopilotTabProps> = ({
  adminSettings,
  onUpdateAdminSettings,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init_copilot',
      sender: 'ai',
      text: `Hello Admin! 👑 I am your Chat Nexu AI Copilot. I analyze your community metrics, advise on VIP subscription pricing, suggest high-performing ad placement strategies, and draft broadcast announcements. How can I help maximize your platform's growth and revenue today?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [announcementApplied, setAnnouncementApplied] = useState(false);

  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMsg: CopilotMessage = {
      id: 'msg_' + Date.now(),
      sender: 'admin',
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
          role: 'admin',
          mode: 'copilot',
          prompt,
          context: `Admin settings: announcement=${adminSettings.siteAnnouncement}, CPM=${adminSettings.cpmRate}, CPC=${adminSettings.cpcRate}`,
        }),
      });

      const data = await res.json();
      const aiReply: CopilotMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.response || 'Here is your strategic recommendation for Chat Nexu.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      const fallback: CopilotMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: '💡 Strategic Recommendation: Keep your 2-minute video chat preview active to drive curiosity. Offer a limited-time 24-hour pass for $1.99 as an impulse purchase, and promote the $14.99 Monthly VIP for loyal users.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyAsAnnouncement = (text: string) => {
    // Strip markdown formatting if any
    const cleanText = text.replace(/[*#_`]/g, '').slice(0, 250);
    const updated = {
      ...adminSettings,
      siteAnnouncement: cleanText,
      announcementEnabled: true,
    };
    onUpdateAdminSettings(updated);
    setAnnouncementApplied(true);
    setTimeout(() => setAnnouncementApplied(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base">Nexu AI Admin Copilot &amp; Active Bot Engine</h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                Active 24/7
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Live automated community bot chatters, revenue strategy, and dynamic pricing optimization
            </p>
          </div>
        </div>
      </div>

      {/* 24/7 Active Bot Chatting Engine Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="font-bold text-sm text-slate-800">24/7 Active Bot Chatting Engine</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Lively Community Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated international members continuously post lively messages, ask questions, share scenery photos, and react to keep all rooms active all time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextState = !adminSettings.activeBotsEnabled;
                onUpdateAdminSettings({
                  ...adminSettings,
                  activeBotsEnabled: nextState,
                });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminSettings.activeBotsEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <span>{adminSettings.activeBotsEnabled ? '🟢 Engine Active' : '⚪ Engine Paused'}</span>
            </button>
          </div>
        </div>

        {/* Speed / Frequency Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Chatter Speed
            </label>
            <div className="flex items-center gap-1">
              {(['fast', 'normal', 'relaxed'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() =>
                    onUpdateAdminSettings({
                      ...adminSettings,
                      botChatFrequency: freq,
                    })
                  }
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    adminSettings.botChatFrequency === freq
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Active Bot Personas
            </label>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <span className="text-emerald-600 font-extrabold">9 Personas</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-[11px] text-slate-500 truncate">Sarah, Alex, Elena, Mateo, Yuki, Priya...</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
            <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
              <span>⚡ Human Typing Delay:</span>
              <span className="font-bold text-slate-800">1.6s - 2.8s</span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
              <span>💬 Emoji Reactions:</span>
              <span className="font-bold text-slate-800">Auto Active</span>
            </div>
          </div>
        </div>
      </div>

      {announcementApplied && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>New site announcement broadcasted to all active rooms successfully!</span>
        </div>
      )}

      {/* Suggested Strategy Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <button
          type="button"
          onClick={() =>
            handleSendPrompt(
              'How should I price my Daily, Weekly, and Monthly VIP subscription plans to maximize revenue?'
            )
          }
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="font-bold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Pricing Strategy</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Optimal price points for 2-min video chat conversions
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            handleSendPrompt(
              'Draft an exciting 1-sentence site announcement celebrating our new Video Roulette and VIP Pass launch.'
            )
          }
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="font-bold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5 mb-1">
            <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>Draft Announcement</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Write a viral notice to convert free visitors to VIP
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            handleSendPrompt(
              'What are the best payout practices for African Mobile Money (M-Pesa, MTN) vs International Bank SWIFT?'
            )
          }
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="font-bold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5 mb-1">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Payout Optimization</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Mobile money transfer speed & low fee best practices
          </p>
        </button>
      </div>

      {/* Main Conversation Screen */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[460px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  msg.sender === 'admin'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="text-[10px] font-bold opacity-60 mb-1">
                  {msg.sender === 'admin' ? 'You (Admin)' : 'Nexu Copilot'}
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {msg.sender === 'ai' && (
                <div className="flex items-center gap-3 mt-1.5 ml-1 text-[11px] text-slate-400">
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleApplyAsAnnouncement(msg.text)}
                    className="flex items-center gap-1 hover:text-emerald-600 text-slate-500 font-semibold cursor-pointer"
                    title="Set this text as your public site announcement banner"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Set as Announcement</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold p-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <span>Analyzing platform data & generating insights...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI Copilot for revenue advice, pricing models, announcement drafts..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
