import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Info, X } from 'lucide-react';
import { AdSlot } from '../types';
import { incrementAdMetric } from '../utils/storage';

interface AdPlacementProps {
  slot: AdSlot;
  className?: string;
  onDismiss?: () => void;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({
  slot,
  className = '',
  onDismiss,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  // Track impression once visible
  useEffect(() => {
    if (!slot.isEnabled || hasTrackedImpression) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          incrementAdMetric(slot.id, 'impressions');
          setHasTrackedImpression(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [slot.id, slot.isEnabled, hasTrackedImpression]);

  // Execute custom HTML / JavaScript ad scripts inside isolated iframe
  useEffect(() => {
    if (!slot.isEnabled || slot.mode !== 'custom_script' || !iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <base target="_blank">
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; font-family: system-ui, sans-serif; }
              </style>
            </head>
            <body>
              ${slot.scriptCode || '<div style="padding:10px;font-size:12px;color:#94a3b8;">No custom ad script code provided. Configure in Admin Dashboard.</div>'}
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn('Error loading custom ad script:', err);
    }
  }, [slot.scriptCode, slot.mode, slot.isEnabled]);

  if (!slot.isEnabled) return null;

  const handleAdClick = () => {
    incrementAdMetric(slot.id, 'clicks');
  };

  // Header Top Banner
  if (slot.placement === 'header_top') {
    return (
      <div
        ref={containerRef}
        className={`w-full max-w-5xl mx-auto px-2 py-1 ${className}`}
        id={`ad-placement-${slot.id}`}
      >
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          {/* Ad Label */}
          <div className="flex items-center justify-between px-3 py-1 bg-slate-50/90 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              {slot.demoBadge || 'ADVERTISEMENT'}
            </span>
          </div>

          {slot.mode === 'custom_script' ? (
            <div className="flex justify-center items-center py-2 min-h-[90px] bg-slate-50">
              <iframe
                ref={iframeRef}
                title={slot.title}
                className="w-full min-h-[90px] border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          ) : (
            <a
              href={slot.demoUrl || '#'}
              onClick={handleAdClick}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gradient-to-r hover:opacity-95 transition-all text-white"
              style={{
                background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
              }}
            >
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 text-xl shadow-inner">
                  👑
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
                    {slot.demoTitle}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Popular
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                    {slot.demoSubtitle}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-sm hover:from-sky-400 hover:to-blue-500 transition-all shrink-0">
                {slot.demoCta}
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Sidebar Rectangle (300x250)
  if (slot.placement === 'sidebar_right') {
    return (
      <div
        ref={containerRef}
        className={`w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs ${className}`}
        id={`ad-placement-${slot.id}`}
      >
        <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          <span>{slot.demoBadge || 'SPONSORED'}</span>
        </div>

        {slot.mode === 'custom_script' ? (
          <div className="flex justify-center items-center p-2 min-h-[250px] bg-slate-50">
            <iframe
              ref={iframeRef}
              title={slot.title}
              className="w-full min-h-[250px] border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        ) : (
          <a
            href={slot.demoUrl || '#'}
            onClick={handleAdClick}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 text-white hover:opacity-95 transition-opacity"
          >
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
              {slot.demoTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {slot.demoSubtitle}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="text-[11px] text-sky-300 font-medium">
                Verified Sponsor
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-sky-600 px-3 py-1 rounded-md shadow-xs">
                {slot.demoCta}
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        )}
      </div>
    );
  }

  // In-Chat Native Message Card
  if (slot.placement === 'in_chat') {
    return (
      <div
        ref={containerRef}
        className={`my-3 p-3 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50/80 to-indigo-50/60 shadow-xs ${className}`}
        id={`ad-placement-${slot.id}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100/90 text-sky-800 font-bold text-[10px] uppercase tracking-wider">
            ⭐ {slot.demoBadge || 'COMMUNITY SPONSOR'}
          </span>
        </div>

        {slot.mode === 'custom_script' ? (
          <div className="flex justify-center items-center py-2 bg-white rounded-lg border border-slate-100">
            <iframe
              ref={iframeRef}
              title={slot.title}
              className="w-full min-h-[100px] border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 p-3 rounded-lg border border-sky-100">
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                {slot.demoTitle}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                {slot.demoSubtitle}
              </p>
            </div>
            <a
              href={slot.demoUrl || '#'}
              onClick={handleAdClick}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors shrink-0 shadow-xs"
            >
              {slot.demoCta}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // Sticky Bottom Anchor Banner
  if (slot.placement === 'bottom_anchor') {
    return (
      <div
        ref={containerRef}
        className={`fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 text-white backdrop-blur-md border-t border-slate-800 shadow-2xl px-4 py-2 ${className}`}
        id={`ad-placement-${slot.id}`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Ad
            </span>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">
              {slot.demoTitle} &bull; {slot.demoSubtitle}
            </span>
            <span className="text-xs font-medium text-slate-200 sm:hidden line-clamp-1">
              {slot.demoTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={slot.demoUrl || '#'}
              onClick={handleAdClick}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
            >
              {slot.demoCta}
              <ExternalLink className="w-3 h-3" />
            </a>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Close banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
