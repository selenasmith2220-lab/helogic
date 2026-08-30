import { AdSlot, AdminSettings, ChatMessage, ChatRoom, CreatorWallet, FriendRequest, ReportedMessage, Story, SubscriptionPlan, User } from '../types';
import { INITIAL_AD_SLOTS, INITIAL_ADMIN_SETTINGS, INITIAL_COMMUNITIES, INITIAL_CREATOR_WALLET, INITIAL_FRIEND_REQUESTS, INITIAL_STORIES, INITIAL_SUBSCRIPTION_PLANS } from '../data/initialData';

const KEYS = {
  CURRENT_USER: 'chatiw_user',
  ADMIN_SETTINGS: 'chatiw_admin_settings',
  AD_SLOTS: 'chatiw_ad_slots',
  REPORTED_MESSAGES: 'chatiw_reports',
  ROOM_MESSAGES: 'chatiw_messages_',
  SAVED_CONVERSATIONS: 'chatiw_conversations',
  SUBSCRIPTION_PLANS: 'nexu_subscription_plans',
  CREATOR_WALLET: 'nexu_creator_wallet',
  STORIES: 'nexu_stories',
  FRIEND_REQUESTS: 'nexu_friend_requests',
  FRIEND_IDS: 'nexu_friend_ids',
  COMMUNITIES: 'nexu_custom_communities',
};

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: User | null) {
  try {
    if (!user) {
      localStorage.removeItem(KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    }
  } catch {}
}

export function getStoredAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(KEYS.ADMIN_SETTINGS);
    if (!raw) return INITIAL_ADMIN_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_ADMIN_SETTINGS,
      ...parsed,
      adminUsername: parsed.adminUsername || 'admin',
      adminPassword: parsed.adminPassword || 'admin123',
      activeBotsEnabled: parsed.activeBotsEnabled !== undefined ? parsed.activeBotsEnabled : true,
      activeBotsCount: typeof parsed.activeBotsCount === 'number' ? parsed.activeBotsCount : 12,
      botChatFrequency: parsed.botChatFrequency || 'normal',
      botRealismTone: parsed.botRealismTone || 'pleasing',
      communityCreationPrice: typeof parsed.communityCreationPrice === 'number' ? parsed.communityCreationPrice : 4.99,
      communityCreationCurrency: parsed.communityCreationCurrency || '$',
      communityCreationFreeForVip: parsed.communityCreationFreeForVip !== undefined ? parsed.communityCreationFreeForVip : true,
    };
  } catch {
    return INITIAL_ADMIN_SETTINGS;
  }
}

export function saveStoredAdminSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function getStoredAdSlots(): AdSlot[] {
  try {
    const raw = localStorage.getItem(KEYS.AD_SLOTS);
    if (!raw) return INITIAL_AD_SLOTS;
    const parsed = JSON.parse(raw) as AdSlot[];
    // Merge with defaults in case new slots are added
    return INITIAL_AD_SLOTS.map((defSlot) => {
      const existing = parsed.find((p) => p.id === defSlot.id);
      const slot = existing ? { ...defSlot, ...existing } : { ...defSlot };
      if (slot.demoTitle && slot.demoTitle.includes('Chatiw')) {
        slot.demoTitle = slot.demoTitle.replace(/Chatiw/gi, 'Chat Nexu');
      }
      if (slot.demoSubtitle && slot.demoSubtitle.includes('Chatiw')) {
        slot.demoSubtitle = slot.demoSubtitle.replace(/Chatiw/gi, 'Chat Nexu');
      }
      return slot;
    });
  } catch {
    return INITIAL_AD_SLOTS;
  }
}

export function saveStoredAdSlots(slots: AdSlot[]) {
  try {
    localStorage.setItem(KEYS.AD_SLOTS, JSON.stringify(slots));
  } catch {}
}

export function incrementAdMetric(slotId: string, metric: 'impressions' | 'clicks') {
  try {
    const slots = getStoredAdSlots();
    const target = slots.find((s) => s.id === slotId);
    if (target) {
      target[metric] = (target[metric] || 0) + 1;
      saveStoredAdSlots(slots);
    }
  } catch {}
}

export function getStoredReports(): ReportedMessage[] {
  try {
    const raw = localStorage.getItem(KEYS.REPORTED_MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredReports(reports: ReportedMessage[]) {
  try {
    localStorage.setItem(KEYS.REPORTED_MESSAGES, JSON.stringify(reports));
  } catch {}
}

export function addReport(report: Omit<ReportedMessage, 'id' | 'timestamp' | 'status'>) {
  try {
    const reports = getStoredReports();
    const newReport: ReportedMessage = {
      ...report,
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      status: 'pending',
    };
    reports.unshift(newReport);
    saveStoredReports(reports);
    return newReport;
  } catch {
    return null;
  }
}

export function calculateEstimatedRevenue(slots: AdSlot[], settings: AdminSettings): {
  totalImpressions: number;
  totalClicks: number;
  estimatedRevenue: number;
  ctr: number;
} {
  const totalImpressions = slots.reduce((sum, s) => sum + (s.impressions || 0), 0);
  const totalClicks = slots.reduce((sum, s) => sum + (s.clicks || 0), 0);
  const cpmRev = (totalImpressions / 1000) * (settings.cpmRate || 2.5);
  const cpcRev = totalClicks * (settings.cpcRate || 0.35);
  const estimatedRevenue = Number((cpmRev + cpcRev).toFixed(2));
  const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

  return {
    totalImpressions,
    totalClicks,
    estimatedRevenue,
    ctr,
  };
}

export function getStoredSubscriptionPlans(): SubscriptionPlan[] {
  try {
    const raw = localStorage.getItem(KEYS.SUBSCRIPTION_PLANS);
    if (!raw) return INITIAL_SUBSCRIPTION_PLANS;
    const parsed = JSON.parse(raw) as SubscriptionPlan[];
    return parsed && parsed.length > 0 ? parsed : INITIAL_SUBSCRIPTION_PLANS;
  } catch {
    return INITIAL_SUBSCRIPTION_PLANS;
  }
}

export function saveStoredSubscriptionPlans(plans: SubscriptionPlan[]) {
  try {
    localStorage.setItem(KEYS.SUBSCRIPTION_PLANS, JSON.stringify(plans));
  } catch {}
}

export function getStoredCreatorWallet(): CreatorWallet {
  try {
    const raw = localStorage.getItem(KEYS.CREATOR_WALLET);
    if (!raw) return INITIAL_CREATOR_WALLET;
    return { ...INITIAL_CREATOR_WALLET, ...JSON.parse(raw) };
  } catch {
    return INITIAL_CREATOR_WALLET;
  }
}

export function saveStoredCreatorWallet(wallet: CreatorWallet) {
  try {
    localStorage.setItem(KEYS.CREATOR_WALLET, JSON.stringify(wallet));
  } catch {}
}

export const getStoredWallet = getStoredCreatorWallet;
export const saveStoredWallet = saveStoredCreatorWallet;

export function depositToCreatorWallet(amount: number, reason: string): CreatorWallet {
  const wallet = getStoredCreatorWallet();
  wallet.balance = Number((wallet.balance + amount).toFixed(2));
  wallet.totalEarned = Number((wallet.totalEarned + amount).toFixed(2));
  saveStoredCreatorWallet(wallet);
  return wallet;
}

// ---------------- STORIES STORAGE ---------------- //

export function getStoredStories(): Story[] {
  try {
    const raw = localStorage.getItem(KEYS.STORIES);
    if (!raw) return INITIAL_STORIES;
    const parsed = JSON.parse(raw) as Story[];
    // Filter out expired stories (older than 24h) unless none exist
    const active = parsed.filter((s) => s.expiresAt > Date.now());
    return active.length > 0 ? active : INITIAL_STORIES;
  } catch {
    return INITIAL_STORIES;
  }
}

export function saveStoredStories(stories: Story[]) {
  try {
    localStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
  } catch {}
}

export function addStory(story: Omit<Story, 'id' | 'createdAt' | 'expiresAt' | 'viewsCount' | 'viewers' | 'likesCount' | 'likedBy'>): Story {
  const stories = getStoredStories();
  const newStory: Story = {
    ...story,
    id: 'story_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    viewsCount: 0,
    viewers: [],
    likesCount: 0,
    likedBy: [],
  };
  const updated = [newStory, ...stories];
  saveStoredStories(updated);
  return newStory;
}

export function recordStoryView(storyId: string, viewer: { userId: string; userName: string; userAvatar: string }): Story[] {
  const stories = getStoredStories();
  const updated = stories.map((s) => {
    if (s.id === storyId) {
      const alreadyViewed = s.viewers.some((v) => v.userId === viewer.userId);
      if (!alreadyViewed && viewer.userId !== s.userId) {
        return {
          ...s,
          viewsCount: s.viewsCount + 1,
          viewers: [
            ...s.viewers,
            {
              userId: viewer.userId,
              userName: viewer.userName,
              userAvatar: viewer.userAvatar,
              timestamp: Date.now(),
            },
          ],
        };
      }
    }
    return s;
  });
  saveStoredStories(updated);
  return updated;
}

export function toggleLikeStory(storyId: string, userId: string): Story[] {
  const stories = getStoredStories();
  const updated = stories.map((s) => {
    if (s.id === storyId) {
      const isLiked = s.likedBy.includes(userId);
      const newLikedBy = isLiked
        ? s.likedBy.filter((id) => id !== userId)
        : [...s.likedBy, userId];
      return {
        ...s,
        likesCount: newLikedBy.length,
        likedBy: newLikedBy,
      };
    }
    return s;
  });
  saveStoredStories(updated);
  return updated;
}

// ---------------- FRIENDSHIPS & FRIEND REQUESTS ---------------- //

export function getStoredFriendIds(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.FRIEND_IDS);
    if (!raw) return ['usr_sarah']; // Sarah is friend by default
    return JSON.parse(raw);
  } catch {
    return ['usr_sarah'];
  }
}

export function saveStoredFriendIds(friendIds: string[]) {
  try {
    localStorage.setItem(KEYS.FRIEND_IDS, JSON.stringify(friendIds));
  } catch {}
}

export function isUserFriend(userId: string): boolean {
  const friends = getStoredFriendIds();
  return friends.includes(userId);
}

export function addFriend(userId: string) {
  const friends = getStoredFriendIds();
  if (!friends.includes(userId)) {
    friends.push(userId);
    saveStoredFriendIds(friends);
  }
}

export function removeFriend(userId: string) {
  const friends = getStoredFriendIds().filter((id) => id !== userId);
  saveStoredFriendIds(friends);
}

export function getStoredFriendRequests(): FriendRequest[] {
  try {
    const raw = localStorage.getItem(KEYS.FRIEND_REQUESTS);
    if (!raw) return INITIAL_FRIEND_REQUESTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_FRIEND_REQUESTS;
  }
}

export function saveStoredFriendRequests(requests: FriendRequest[]) {
  try {
    localStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  } catch {}
}

export function sendFriendRequest(fromUser: User, toUserId: string, introMessage?: string): FriendRequest {
  const requests = getStoredFriendRequests();
  const newReq: FriendRequest = {
    id: 'freq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    fromUser,
    toUserId,
    status: 'pending',
    createdAt: Date.now(),
    introMessage,
  };
  requests.unshift(newReq);
  saveStoredFriendRequests(requests);
  return newReq;
}

export function acceptFriendRequest(requestId: string): FriendRequest | null {
  const requests = getStoredFriendRequests();
  let acceptedTarget: FriendRequest | null = null;
  const updated = requests.map((r) => {
    if (r.id === requestId) {
      acceptedTarget = { ...r, status: 'accepted' };
      addFriend(r.fromUser.id);
      return acceptedTarget;
    }
    return r;
  });
  saveStoredFriendRequests(updated);
  return acceptedTarget;
}

export function declineFriendRequest(requestId: string): void {
  const requests = getStoredFriendRequests().filter((r) => r.id !== requestId);
  saveStoredFriendRequests(requests);
}

// ---------------- CUSTOM COMMUNITIES / ROOMS ---------------- //

export function getStoredCustomCommunities(): ChatRoom[] {
  try {
    const raw = localStorage.getItem(KEYS.COMMUNITIES);
    if (!raw) return INITIAL_COMMUNITIES;
    const parsed = JSON.parse(raw) as ChatRoom[];
    return parsed.length > 0 ? parsed : INITIAL_COMMUNITIES;
  } catch {
    return INITIAL_COMMUNITIES;
  }
}

export function saveStoredCustomCommunities(communities: ChatRoom[]) {
  try {
    localStorage.setItem(KEYS.COMMUNITIES, JSON.stringify(communities));
  } catch {}
}

export function addCustomCommunity(community: Omit<ChatRoom, 'id' | 'userCount' | 'isCustomCommunity' | 'createdAt'>): ChatRoom {
  const communities = getStoredCustomCommunities();
  const newCommunity: ChatRoom = {
    ...community,
    id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userCount: 1,
    isCustomCommunity: true,
    createdAt: Date.now(),
  };
  const updated = [newCommunity, ...communities];
  saveStoredCustomCommunities(updated);
  return newCommunity;
}

