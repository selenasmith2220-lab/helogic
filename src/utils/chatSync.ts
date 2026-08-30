import { ChatMessage, User } from '../types';
import { INITIAL_ONLINE_USERS } from '../data/initialData';
import { getStoredAdminSettings } from './storage';

export type SyncEvent =
  | { type: 'PEER_PRESENCE'; user: User }
  | { type: 'PEER_LEAVE'; userId: string }
  | { type: 'PEER_MESSAGE'; message: ChatMessage }
  | { type: 'PEER_TYPING'; userId: string; nickname: string; roomId: string }
  | { type: 'ADMIN_ANNOUNCEMENT'; text: string }
  | { type: 'ADMIN_KICK'; userId: string };

let channel: BroadcastChannel | null = null;
const listeners = new Set<(event: SyncEvent) => void>();

export function initSyncChannel(currentUser: User | null): () => void {
  if (typeof window === 'undefined') return () => {};

  if (!channel && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel('chatiw_mesh_network');
      channel.onmessage = (e: MessageEvent<SyncEvent>) => {
        listeners.forEach((cb) => cb(e.data));
      };
    } catch {
      // Fallback
    }
  }

  // Cross-tab fallback via storage event
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'chatiw_sync_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as SyncEvent;
        listeners.forEach((cb) => cb(parsed));
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // If user is logged in, announce presence
  if (currentUser) {
    broadcastSyncEvent({
      type: 'PEER_PRESENCE',
      user: { ...currentUser, isRealPeer: true },
    });
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (currentUser) {
      broadcastSyncEvent({
        type: 'PEER_LEAVE',
        userId: currentUser.id,
      });
    }
  };
}

export function subscribeToSync(cb: (event: SyncEvent) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function broadcastSyncEvent(event: SyncEvent) {
  if (channel) {
    try {
      channel.postMessage(event);
    } catch {}
  }
  try {
    localStorage.setItem(
      'chatiw_sync_event',
      JSON.stringify({ ...event, _ts: Date.now() + Math.random() })
    );
  } catch {}
}

// Censor text using banned words
export function filterBannedWords(text: string): { cleanText: string; hasBannedWord: boolean } {
  const settings = getStoredAdminSettings();
  let cleanText = text;
  let hasBannedWord = false;

  for (const word of settings.bannedWords) {
    if (!word.trim()) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (regex.test(cleanText)) {
      hasBannedWord = true;
      cleanText = cleanText.replace(regex, '****');
    }
  }

  return { cleanText, hasBannedWord };
}

import { getHumanoidSimulatedReply, HumanoidReply } from './humanoidChatEngine';

// Smart humanoid context-aware response for simulated users in 1-on-1 private chat
export function getSimulatedUserReply(
  targetUser: User,
  userMessageText: string,
  chatHistory: ChatMessage[] = []
): HumanoidReply {
  return getHumanoidSimulatedReply(targetUser, userMessageText, chatHistory);
}
