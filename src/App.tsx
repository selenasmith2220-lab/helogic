import React, { useEffect, useState, useMemo } from 'react';
import {
  AdSlot,
  AdminSettings,
  ChatMessage,
  ConversationTab,
  CreatorWallet,
  ReportedMessage,
  SubscriptionPlan,
  User,
} from './types';
import { INITIAL_ONLINE_USERS } from './data/initialData';
import {
  addReport,
  getStoredAdminSettings,
  getStoredAdSlots,
  getStoredReports,
  getStoredSubscriptionPlans,
  getStoredUser,
  getStoredWallet,
  saveStoredAdminSettings,
  saveStoredAdSlots,
  saveStoredReports,
  saveStoredSubscriptionPlans,
  saveStoredUser,
  saveStoredWallet,
} from './utils/storage';
import {
  broadcastSyncEvent,
  filterBannedWords,
  getSimulatedUserReply,
  initSyncChannel,
  subscribeToSync,
} from './utils/chatSync';
import { isSoundEnabled, playIncomingSound, playPrivateAlertSound, setSoundEnabled } from './utils/audio';
import { useActiveBotEngine } from './utils/activeBotEngine';

import { LandingScreen } from './components/LandingScreen';
import { Header } from './components/Header';
import { UserList } from './components/UserList';
import { ChatArea } from './components/ChatArea';
import { SidebarRight } from './components/SidebarRight';
import { AdminDashboard } from './components/AdminDashboard';
import { AdPlacement } from './components/AdPlacement';
import { ReportModal } from './components/ReportModal';
import { ImageModal } from './components/ImageModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { VideoRouletteModal } from './components/VideoRouletteModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const INITIAL_GLOBAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_init_1',
    roomId: 'global',
    senderId: 'usr_sarah',
    senderName: 'Sarah_99',
    senderGender: 'female',
    senderCountry: 'United States',
    senderFlag: '🇺🇸',
    senderAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    text: 'Hey everyone! Welcome to Chat Nexu 👋 Hope everyone is having a chill weekend.',
    timestamp: Date.now() - 600000,
    reactions: { '❤️': 3, '👍': 5 },
  },
  {
    id: 'msg_init_2',
    roomId: 'global',
    senderId: 'usr_alex',
    senderName: 'Alex_London',
    senderGender: 'male',
    senderCountry: 'United Kingdom',
    senderFlag: '🇬🇧',
    senderAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'Hello from London! The weather is surprisingly sunny today ☀️ Anyone watching the football match tonight?',
    timestamp: Date.now() - 420000,
    reactions: { '🔥': 2 },
  },
  {
    id: 'msg_init_3',
    roomId: 'global',
    senderId: 'usr_yuki',
    senderName: 'Yuki_Tokyo',
    senderGender: 'female',
    senderCountry: 'Japan',
    senderFlag: '🇯🇵',
    senderAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    text: 'Konnichiwa! 🌸 Late night here in Tokyo. Having some matcha green tea while chatting.',
    timestamp: Date.now() - 180000,
    reactions: { '✨': 4 },
  },
];

export default function App() {
  // Authentication / Current Guest
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [currentRoomId, setCurrentRoomId] = useState<string>('global');

  // Ad Slots & Admin State
  const [adSlots, setAdSlots] = useState<AdSlot[]>(() => getStoredAdSlots());
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => getStoredAdminSettings());
  const [reports, setReports] = useState<ReportedMessage[]>(() => getStoredReports());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [soundActive, setSoundActive] = useState<boolean>(() => isSoundEnabled());
  const [locationFilter, setLocationFilter] = useState<string>('global');

  // Community & Messages
  const [users, setUsers] = useState<User[]>(INITIAL_ONLINE_USERS);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({
    global: INITIAL_GLOBAL_MESSAGES,
    usa: [],
    singles: [],
    europe: [],
    gaming: [],
  });

  // Dynamic Tabs (Global Room + 1-on-1 private chats)
  const [tabs, setTabs] = useState<ConversationTab[]>([
    { id: 'global', type: 'room', title: 'Global Lounge', unreadCount: 0 },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('global');

  // Mobile navigation
  const [activeMobileTab, setActiveMobileTab] = useState<'users' | 'chat' | 'rooms'>('chat');

  // UI Modals & Popups
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [reportingTarget, setReportingTarget] = useState<{
    user?: User;
    message?: ChatMessage;
  } | null>(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState<string | null>(
    adminSettings.announcementEnabled ? adminSettings.siteAnnouncement : null
  );
  const [isBottomAdDismissed, setIsBottomAdDismissed] = useState(false);

  // VIP Subscriptions & Creator Wallet
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => getStoredSubscriptionPlans());
  const [wallet, setWallet] = useState<CreatorWallet>(() => getStoredWallet());

  // Feature Modals Visibility States
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleUpdatePlans = (newPlans: SubscriptionPlan[]) => {
    setPlans(newPlans);
    saveStoredSubscriptionPlans(newPlans);
  };

  const handleUpdateWallet = (newWallet: CreatorWallet) => {
    setWallet(newWallet);
    saveStoredWallet(newWallet);
  };

  const handleGoogleSuccess = (googleData: Partial<User>) => {
    if (currentUser) {
      const updated: User = {
        ...currentUser,
        isGoogleUser: true,
        email: googleData.email || currentUser.email,
        nickname: googleData.nickname || currentUser.nickname,
        avatar: googleData.avatar || currentUser.avatar,
      };
      setCurrentUser(updated);
      saveStoredUser(updated);
    } else {
      const newUser: User = {
        id: 'usr_g_' + Date.now(),
        nickname: googleData.nickname || 'GoogleUser_' + Math.floor(100 + Math.random() * 899),
        gender: googleData.gender || 'other',
        age: googleData.age || 24,
        country: 'United States',
        countryCode: 'US',
        flag: '🇺🇸',
        avatar:
          googleData.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isOnline: true,
        isGoogleUser: true,
        email: googleData.email,
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 254),
        joinedAt: Date.now(),
        currentRoom: 'global',
        lastActive: Date.now(),
      };
      setCurrentUser(newUser);
      saveStoredUser(newUser);
    }
    setIsGoogleAuthOpen(false);
    showToast('🎉 Google Account successfully linked! VIP pass & settings are synced.');
  };

  const handleSubscriptionSuccess = (plan: SubscriptionPlan) => {
    if (!currentUser) return;
    const expiresAt = Date.now() + plan.durationDays * 24 * 60 * 60 * 1000;
    const updatedUser: User = {
      ...currentUser,
      isVip: true,
      vipExpiresAt: expiresAt,
    };
    setCurrentUser(updatedUser);
    saveStoredUser(updatedUser);

    // Automatically deposit subscriber payment into Creator's wallet
    setWallet((prev) => {
      const updatedWallet: CreatorWallet = {
        ...prev,
        balance: prev.balance + plan.price,
        totalEarnings: prev.totalEarnings + plan.price,
        subscriptionEarnings: prev.subscriptionEarnings + plan.price,
      };
      saveStoredWallet(updatedWallet);
      return updatedWallet;
    });

    setIsSubscribeOpen(false);
    showToast(`👑 Congratulations! You are now a VIP Member (${plan.name}). Enjoy unlimited video chat!`);
  };

  // Sync across tabs via BroadcastChannel
  useEffect(() => {
    const cleanupInit = initSyncChannel(currentUser);

    const unsubscribe = subscribeToSync((event) => {
      if (event.type === 'PEER_PRESENCE') {
        setUsers((prev) => {
          const filtered = prev.filter((u) => u.id !== event.user.id);
          return [event.user, ...filtered];
        });
      } else if (event.type === 'PEER_LEAVE') {
        setUsers((prev) => prev.filter((u) => u.id !== event.userId));
      } else if (event.type === 'PEER_MESSAGE') {
        const msg = event.message;

        // Is message for current user or current room?
        const isForMe =
          msg.roomId === 'global' ||
          msg.roomId === currentRoomId ||
          msg.targetUserId === currentUser?.id ||
          msg.senderId === currentUser?.id;

        if (isForMe) {
          setMessagesByRoom((prev) => {
            const currentList = prev[msg.roomId] || [];
            if (currentList.some((m) => m.id === msg.id)) return prev;
            return {
              ...prev,
              [msg.roomId]: [...currentList, msg],
            };
          });

          // Play notification sound
          if (msg.senderId !== currentUser?.id) {
            if (msg.isPrivate) {
              playPrivateAlertSound();
            } else {
              playIncomingSound();
            }
          }

          // If message is in another tab or room, increment unread badge
          setTabs((prev) =>
            prev.map((t) => {
              if (t.id === msg.roomId && t.id !== activeTabId) {
                return { ...t, unreadCount: t.unreadCount + 1 };
              }
              return t;
            })
          );
        }
      } else if (event.type === 'PEER_TYPING') {
        if (event.roomId === activeTabId && event.userId !== currentUser?.id) {
          setTypingUser(event.nickname);
          setTimeout(() => setTypingUser(null), 3000);
        }
      } else if (event.type === 'ADMIN_ANNOUNCEMENT') {
        setActiveAnnouncement(event.text);
      } else if (event.type === 'ADMIN_KICK') {
        if (currentUser && event.userId === currentUser.id) {
          alert('You have been disconnected by an administrator.');
          handleLogout();
        }
      }
    });

    return () => {
      cleanupInit();
      unsubscribe();
    };
  }, [currentUser, currentRoomId, activeTabId]);

  // Special Hidden Admin Access Link routing (?admin=portal, ?admin=<secretToken>, #admin, or Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminUrl = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const adminParam = searchParams.get('admin');
        const pageParam = searchParams.get('page');
        const hash = window.location.hash;

        const isSecretMatch =
          adminParam === 'portal' ||
          adminParam === 'super' ||
          adminParam === 'root' ||
          (adminSettings.adminSecretToken && adminParam === adminSettings.adminSecretToken) ||
          pageParam === 'admin' ||
          hash === '#admin' ||
          hash === '#admin-portal';

        if (isSecretMatch) {
          setIsAdminOpen(true);
        }
      } catch (err) {
        console.error('Error checking admin URL parameter', err);
      }
    };

    checkAdminUrl();

    window.addEventListener('popstate', checkAdminUrl);
    window.addEventListener('hashchange', checkAdminUrl);

    // Keyboard shortcut fallback for site owner: Ctrl + Shift + A or Cmd + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkAdminUrl);
      window.removeEventListener('hashchange', checkAdminUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adminSettings.adminSecretToken]);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('admin') || url.searchParams.has('page') || url.hash.includes('admin')) {
        url.searchParams.delete('admin');
        url.searchParams.delete('page');
        url.hash = '';
        const cleanUrl = url.pathname + (url.search ? url.search : '');
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch (err) {
      console.error('Error resetting admin URL', err);
    }
  };

  // Handle Join from Landing Screen
  const handleJoin = (user: User) => {
    setCurrentUser(user);
    saveStoredUser(user);
    setCurrentRoomId(user.currentRoom || 'global');

    // Add user to local users list
    setUsers((prev) => [user, ...prev.filter((u) => u.id !== user.id)]);

    // Broadcast presence
    broadcastSyncEvent({
      type: 'PEER_PRESENCE',
      user: { ...user, isRealPeer: true },
    });
  };

  // Handle Logout
  const handleLogout = () => {
    if (currentUser) {
      broadcastSyncEvent({
        type: 'PEER_LEAVE',
        userId: currentUser.id,
      });
    }
    setCurrentUser(null);
    saveStoredUser(null);
    setTabs([{ id: 'global', type: 'room', title: 'Global Lounge', unreadCount: 0 }]);
    setActiveTabId('global');
  };

  // Room Switching
  const handleSelectRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    const roomName =
      roomId === 'global'
        ? 'Global Lounge'
        : roomId === 'usa'
        ? 'USA & Americas'
        : roomId === 'singles'
        ? 'Singles 20s - 30s'
        : roomId === 'europe'
        ? 'Europe Cafe'
        : 'Tech & Gaming';

    // Ensure tab exists
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === roomId);
      if (exists) return prev;
      return [...prev, { id: roomId, type: 'room', title: roomName, unreadCount: 0 }];
    });
    setActiveTabId(roomId);
    setActiveMobileTab('chat');
  };

  // Start 1-on-1 Private Chat
  const handleStartPrivateChat = (targetUser: User) => {
    if (!currentUser) return;
    const conversationId = `private_${[currentUser.id, targetUser.id].sort().join('_')}`;

    // Add tab if not already present
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === conversationId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: conversationId,
          type: 'private',
          title: targetUser.nickname,
          user: targetUser,
          unreadCount: 0,
        },
      ];
    });

    setActiveTabId(conversationId);
    setActiveMobileTab('chat');

    // Initialize messages bucket if needed
    setMessagesByRoom((prev) => {
      if (prev[conversationId]) return prev;
      return {
        ...prev,
        [conversationId]: [
          {
            id: 'sys_' + Date.now(),
            roomId: conversationId,
            senderId: 'system',
            senderName: 'System',
            senderGender: 'other',
            senderCountry: '',
            senderFlag: '🔒',
            senderAvatar: '',
            text: `Started direct private encrypted chat with ${targetUser.nickname} (${targetUser.country}).`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ],
      };
    });
  };

  // Close Conversation Tab
  const handleCloseTab = (tabId: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId);
      if (remaining.length === 0) {
        return [{ id: 'global', type: 'room', title: 'Global Lounge', unreadCount: 0 }];
      }
      return remaining;
    });

    if (activeTabId === tabId) {
      setActiveTabId('global');
    }
  };

  // Select Tab
  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    // Clear unread
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, unreadCount: 0 } : t))
    );
  };

  // Send Message
  const handleSendMessage = (text: string, imageUrl?: string) => {
    if (!currentUser) return;

    // Filter banned words
    const { cleanText, hasBannedWord } = filterBannedWords(text);

    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
    const isPrivate = activeTab.type === 'private';
    const targetUserId = activeTab.user?.id;

    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      roomId: activeTabId,
      senderId: currentUser.id,
      senderName: currentUser.nickname,
      senderGender: currentUser.gender,
      senderCountry: currentUser.country,
      senderFlag: currentUser.flag,
      senderAvatar: currentUser.avatar,
      text: cleanText,
      imageUrl,
      timestamp: Date.now(),
      isPrivate,
      targetUserId,
      reactions: {},
    };

    // Add locally
    setMessagesByRoom((prev) => ({
      ...prev,
      [activeTabId]: [...(prev[activeTabId] || []), newMessage],
    }));

    // Broadcast event across browser tabs
    broadcastSyncEvent({
      type: 'PEER_MESSAGE',
      message: newMessage,
    });

    // If talking to a simulated user in a 1-on-1 private chat, generate contextual reply
    if (isPrivate && activeTab.user && !activeTab.user.isRealPeer) {
      const partner = activeTab.user;
      const history = messagesByRoom[activeTabId] || [];
      const replyData = getSimulatedUserReply(partner, cleanText, history);

      // Trigger initial typing indicator
      setTimeout(() => {
        setTypingUser(partner.nickname);
      }, 400);

      // Trigger first reply message
      setTimeout(() => {
        setTypingUser(null);
        const replyMsg: ChatMessage = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          roomId: activeTabId,
          senderId: partner.id,
          senderName: partner.nickname,
          senderGender: partner.gender,
          senderCountry: partner.country,
          senderFlag: partner.flag,
          senderAvatar: partner.avatar,
          text: replyData.replyText,
          timestamp: Date.now(),
          isPrivate: true,
          targetUserId: currentUser.id,
          reactions: {},
        };

        setMessagesByRoom((prev) => ({
          ...prev,
          [activeTabId]: [...(prev[activeTabId] || []), replyMsg],
        }));

        playPrivateAlertSound();

        // If humanoid engine provided a realistic 2nd message (e.g. quick follow-up or reaction)
        if (replyData.secondMessage) {
          const second = replyData.secondMessage;
          setTimeout(() => {
            setTypingUser(partner.nickname);
          }, 600);

          setTimeout(() => {
            setTypingUser(null);
            const secondReplyMsg: ChatMessage = {
              id: 'msg_' + (Date.now() + 1) + '_' + Math.random().toString(36).substring(2, 6),
              roomId: activeTabId,
              senderId: partner.id,
              senderName: partner.nickname,
              senderGender: partner.gender,
              senderCountry: partner.country,
              senderFlag: partner.flag,
              senderAvatar: partner.avatar,
              text: second.replyText,
              timestamp: Date.now(),
              isPrivate: true,
              targetUserId: currentUser.id,
              reactions: {},
            };

            setMessagesByRoom((prev) => ({
              ...prev,
              [activeTabId]: [...(prev[activeTabId] || []), secondReplyMsg],
            }));

            playPrivateAlertSound();
          }, second.delayMs);
        }
      }, replyData.delayMs);
    }
  };

  // React to message
  const handleReactMessage = (messageId: string, emoji: string, targetRoomId?: string) => {
    setMessagesByRoom((prev) => {
      let foundRoom = targetRoomId || activeTabId;
      if (!targetRoomId && !prev[foundRoom]?.some((m) => m.id === messageId)) {
        for (const [rId, list] of Object.entries(prev)) {
          const chatList = list as ChatMessage[];
          if (Array.isArray(chatList) && chatList.some((m) => m.id === messageId)) {
            foundRoom = rId;
            break;
          }
        }
      }
      const currentList = prev[foundRoom] || [];
      const updated = currentList.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        return { ...m, reactions: currentReactions };
      });
      return { ...prev, [foundRoom]: updated };
    });
  };

  // 24/7 Active Bot Chatting Engine
  useActiveBotEngine({
    enabled: adminSettings.activeBotsEnabled,
    frequency: adminSettings.botChatFrequency || 'normal',
    currentRoomId: currentRoomId,
    currentUser: currentUser,
    users: users,
    soundEnabled: soundActive,
    recentMessages: messagesByRoom[currentRoomId] || [],
    onBotMessage: (newBotMsg) => {
      setMessagesByRoom((prev) => {
        const currentList = prev[newBotMsg.roomId] || [];
        if (currentList.some((m) => m.id === newBotMsg.id)) return prev;
        return {
          ...prev,
          [newBotMsg.roomId]: [...currentList, newBotMsg],
        };
      });

      // Broadcast across tabs
      broadcastSyncEvent({
        type: 'PEER_MESSAGE',
        message: newBotMsg,
      });

      // If message is in another room than active tab, increment badge
      if (newBotMsg.roomId !== activeTabId) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === newBotMsg.roomId
              ? { ...t, unreadCount: (t.unreadCount || 0) + 1 }
              : t
          )
        );
      }
    },
    onBotTyping: (nickname) => {
      setTypingUser(nickname);
    },
    onBotReact: (messageId, emoji) => {
      handleReactMessage(messageId, emoji, currentRoomId);
    },
    playIncomingSound: playIncomingSound,
  });

  // Report handling
  const handleReportUser = (user: User) => {
    setReportingTarget({ user });
  };

  const handleReportMessage = (message: ChatMessage) => {
    setReportingTarget({ message });
  };

  const handleSubmitReport = (reason: string, details: string) => {
    if (!currentUser || !reportingTarget) return;

    const newReport = addReport({
      messageId: reportingTarget.message?.id || 'direct_user_report',
      senderId: reportingTarget.user?.id || reportingTarget.message?.senderId || 'unknown',
      senderName: reportingTarget.user?.nickname || reportingTarget.message?.senderName || 'Unknown',
      messageText: reportingTarget.message?.text || `User profile reported. Details: ${details}`,
      reportedBy: currentUser.nickname,
      reason,
    });

    if (newReport) {
      setReports((prev) => [newReport, ...prev]);
      alert('Thank you. The report has been sent to our administration team for moderation review.');
    }
  };

  // Admin Actions
  const handleKickUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    broadcastSyncEvent({ type: 'ADMIN_KICK', userId });
    alert('User has been kicked from the server.');
  };

  const handleMuteUser = (userId: string) => {
    const updated = {
      ...adminSettings,
      mutedUserIds: [...adminSettings.mutedUserIds, userId],
    };
    setAdminSettings(updated);
    saveStoredAdminSettings(updated);
    alert('User has been muted.');
  };

  const handleBanUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    const target = users.find((u) => u.id === userId);
    const updated = {
      ...adminSettings,
      bannedIps: target?.ipAddress
        ? [...adminSettings.bannedIps, target.ipAddress]
        : adminSettings.bannedIps,
    };
    setAdminSettings(updated);
    saveStoredAdminSettings(updated);
    broadcastSyncEvent({ type: 'ADMIN_KICK', userId });
    alert('User has been banned.');
  };

  const handleUpdateAdSlot = (updatedSlot: AdSlot) => {
    const updated = adSlots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));
    setAdSlots(updated);
    saveStoredAdSlots(updated);
  };

  const handleUpdateAdminSettings = (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    saveStoredAdminSettings(newSettings);
  };

  const handleResolveReport = (reportId: string, action: 'dismiss' | 'ban') => {
    const updated = reports.map((r) => {
      if (r.id !== reportId) return r;
      return { ...r, status: action === 'ban' ? ('banned' as const) : ('reviewed' as const) };
    });
    setReports(updated);
    saveStoredReports(updated);

    if (action === 'ban') {
      const target = reports.find((r) => r.id === reportId);
      if (target?.senderId) {
        handleBanUser(target.senderId);
      }
    }
  };

  const handleBroadcastAnnouncement = (text: string) => {
    setActiveAnnouncement(text);
    broadcastSyncEvent({ type: 'ADMIN_ANNOUNCEMENT', text });
  };

  const handleToggleSound = () => {
    const nextState = !soundActive;
    setSoundActive(nextState);
    setSoundEnabled(nextState);
  };

  // Total messages count across rooms
  const totalMessagesCount = useMemo(() => {
    return Object.values(messagesByRoom).reduce((acc: number, list: ChatMessage[]) => acc + (list ? list.length : 0), 1284);
  }, [messagesByRoom]);

  // Current active conversation tab object
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const currentMessages = messagesByRoom[activeTabId] || [];

  // Individual ad slots
  const headerAd = adSlots.find((s) => s.placement === 'header_top');
  const sidebarAd = adSlots.find((s) => s.placement === 'sidebar_right');
  const inChatAd = adSlots.find((s) => s.placement === 'in_chat');
  const bottomAnchorAd = adSlots.find((s) => s.placement === 'bottom_anchor');

  const isUserMuted = currentUser
    ? adminSettings.mutedUserIds.includes(currentUser.id)
    : false;

  // Render Landing / Guest Entrance if not logged in
  if (!currentUser) {
    return (
      <>
        <LandingScreen
          onJoin={handleJoin}
          adSlots={adSlots}
          onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={handleCloseAdmin}
          users={users}
          onKickUser={handleKickUser}
          onMuteUser={handleMuteUser}
          onBanUser={handleBanUser}
          adSlots={adSlots}
          onUpdateAdSlot={handleUpdateAdSlot}
          adminSettings={adminSettings}
          onUpdateAdminSettings={handleUpdateAdminSettings}
          reports={reports}
          onResolveReport={handleResolveReport}
          onBroadcastAnnouncement={handleBroadcastAnnouncement}
          plans={plans}
          onUpdatePlans={handleUpdatePlans}
          wallet={wallet}
          onUpdateWallet={handleUpdateWallet}
        />
        <GoogleAuthModal
          isOpen={isGoogleAuthOpen}
          onClose={() => setIsGoogleAuthOpen(false)}
          onSuccess={handleGoogleSuccess}
          currentUser={currentUser}
        />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden select-none">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        currentRoomId={currentRoomId}
        onSelectRoom={handleSelectRoom}
        onlineCount={users.length}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        onLogout={handleLogout}
        activeMobileTab={activeMobileTab}
        setActiveMobileTab={setActiveMobileTab}
        onOpenVideoChat={() => setIsVideoChatOpen(true)}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        locationFilter={locationFilter}
        onSelectLocation={setLocationFilter}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Site-wide Broadcast Announcement Banner */}
      {activeAnnouncement && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="truncate">{activeAnnouncement}</span>
          </div>
          <button
            onClick={() => setActiveAnnouncement(null)}
            className="p-0.5 rounded hover:bg-black/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Leaderboard Ad Slot */}
      {headerAd && headerAd.isEnabled && (
        <div className="shrink-0 bg-white border-b border-slate-200/60 hidden sm:block">
          <AdPlacement slot={headerAd} />
        </div>
      )}

      {/* Main Split Layout */}
      <main className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto shadow-sm">
        {/* Left Column: Online Users List (Desktop: always visible, Mobile: toggled) */}
        <div
          className={`w-full md:w-72 lg:w-80 shrink-0 h-full ${
            activeMobileTab === 'users' ? 'block' : 'hidden md:block'
          }`}
        >
          <UserList
            users={users}
            currentUser={currentUser}
            onStartPrivateChat={handleStartPrivateChat}
            onReportUser={handleReportUser}
            locationFilter={locationFilter}
            onSelectLocation={setLocationFilter}
          />
        </div>

        {/* Center Column: Active Chat Area */}
        <div
          className={`flex-1 h-full min-w-0 ${
            activeMobileTab === 'chat' ? 'block' : 'hidden md:block'
          }`}
        >
          <ChatArea
            currentUser={currentUser}
            activeTab={activeTab}
            tabs={tabs}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onReactMessage={handleReactMessage}
            onReportMessage={handleReportMessage}
            inChatAd={inChatAd}
            typingUser={typingUser}
            onImageClick={(url) => setViewingImageUrl(url)}
            isUserMuted={isUserMuted}
          />
        </div>

        {/* Right Column: Rooms Directory, Community Rules & Sidebar Ad (Desktop: always visible, Mobile: toggled) */}
        <div
          className={`w-full md:w-64 lg:w-72 shrink-0 h-full ${
            activeMobileTab === 'rooms' ? 'block' : 'hidden lg:block'
          }`}
        >
          <SidebarRight
            currentRoomId={currentRoomId}
            onSelectRoom={handleSelectRoom}
            sidebarAd={sidebarAd}
            onlineCount={users.length}
            totalMessagesCount={totalMessagesCount}
          />
        </div>
      </main>

      {/* Sticky Bottom Anchor Ad */}
      {bottomAnchorAd && bottomAnchorAd.isEnabled && !isBottomAdDismissed && (
        <AdPlacement
          slot={bottomAnchorAd}
          onDismiss={() => setIsBottomAdDismissed(true)}
        />
      )}

      {/* Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        users={users}
        onKickUser={handleKickUser}
        onMuteUser={handleMuteUser}
        onBanUser={handleBanUser}
        adSlots={adSlots}
        onUpdateAdSlot={handleUpdateAdSlot}
        adminSettings={adminSettings}
        onUpdateAdminSettings={handleUpdateAdminSettings}
        reports={reports}
        onResolveReport={handleResolveReport}
        onBroadcastAnnouncement={handleBroadcastAnnouncement}
        plans={plans}
        onUpdatePlans={handleUpdatePlans}
        wallet={wallet}
        onUpdateWallet={handleUpdateWallet}
      />

      {/* Google Account Linking Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        onSuccess={handleGoogleSuccess}
        currentUser={currentUser}
      />

      {/* VIP Pass & Subscription Upgrade Modal */}
      <SubscriptionModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        plans={plans}
        currentUser={currentUser}
        onSelectPlan={handleSubscriptionSuccess}
      />

      {/* 1-on-1 Video Chatroom (Omegle-style with 2-minute timer & VIP bypass) */}
      <VideoRouletteModal
        isOpen={isVideoChatOpen}
        onClose={() => setIsVideoChatOpen(false)}
        currentUser={currentUser}
        onUpgradeToVip={() => {
          setIsVideoChatOpen(false);
          setIsSubscribeOpen(true);
        }}
      />

      {/* AI Assistant & Wingman Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        currentUser={currentUser}
        activeRoomName={currentRoomId}
        onSendToChat={(txt) => {
          handleSendMessage(txt);
          setIsAIAssistantOpen(false);
        }}
      />

      {/* User / Message Abuse Report Modal */}
      {reportingTarget && (
        <ReportModal
          targetUser={reportingTarget.user}
          targetMessage={reportingTarget.message}
          currentUser={currentUser}
          onClose={() => setReportingTarget(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {/* Image Lightbox Viewer */}
      <ImageModal
        imageUrl={viewingImageUrl}
        onClose={() => setViewingImageUrl(null)}
      />
    </div>
  );
}
