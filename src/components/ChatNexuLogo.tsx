import React from 'react';

interface ChatNexuLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ChatNexuLogo: React.FC<ChatNexuLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const titleSize =
    size === 'sm'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-2xl sm:text-3xl'
      : 'text-base sm:text-lg';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Visual Logo Mark: Interconnected Nexus Signal Emblem */}
      <div
        className={`${iconSize} rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center shrink-0 relative group`}
      >
        <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-slate-900/30 via-transparent to-black/20 flex items-center justify-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-sky-400/40 rounded-full blur-xs" />
          
          <svg
            className="w-[70%] h-[70%] text-white fill-none stroke-current"
            viewBox="0 0 24 24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Main Chat Bubble Body */}
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            {/* Interconnected Nexus Nodes inside bubble */}
            <circle cx="9" cy="11.5" r="1" fill="currentColor" />
            <circle cx="15" cy="11.5" r="1" fill="currentColor" />
            <path d="M9 11.5h6" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
          </svg>

          {/* Active Status Pulse Dot */}
          <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${titleSize} font-black tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 bg-clip-text text-transparent`}>
            Chat <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Nexu</span>
          </span>
          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200/60 leading-none">
            Live
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-semibold text-slate-400 tracking-wide mt-0.5">
            Global Live &bull; Video &bull; VIP
          </span>
        )}
      </div>
    </div>
  );
};
