import { useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { INITIAL_ONLINE_USERS } from '../data/initialData';

export interface BotDialogue {
  text: string;
  imageUrl?: string;
  roomSpecific?: string; // e.g. 'usa', 'europe', 'singles', 'gaming'
}

// Rich library of natural, humanoid community messages (no bot clichés or promotional phrasing)
const GENERAL_BOT_MESSAGES: BotDialogue[] = [
  { text: "yo what's everyone up to today?" },
  { text: 'anyone else having trouble sleeping tonight or just me lol' },
  { text: 'just made a huge iced coffee ☕ so ready to wake up' },
  { text: "bored at my desk rn haha what's everyone talking about?" },
  { text: 'wait did anyone catch that game yesterday? that ending was wild' },
  { text: 'quick debate: morning person or total night owl?' },
  { text: 'finally done with work for the day, freedom feels amazing 🙌' },
  { text: "what's the weather like where everyone is at? pretty cloudy over here" },
  { text: 'listening to this new playlist on repeat honestly, so good' },
  { text: 'anyone playing anything good on pc or console tonight? need game ideas 🎮' },
  { text: 'food debate: pizza vs burgers, what are you picking tonight? 🍕' },
  { text: 'weekend cannot get here fast enough haha' },
  { text: 'just got back from a walk outside, the fresh air is so nice' },
  { text: 'anyone have good movie or netflix recommendations? running out of things to watch 🎬' },
  { text: 'who else stays up way too late scrolling on their phone? guilty as charged haha 🙋' },
  { text: 'having some green tea and just unwinding 🫖 hope everyone is having a chill day' },
  { text: 'crazy how fast this week went by honestly' },
  { text: 'what is everyone having for dinner tonight? trying to get inspiration haha' },
  { text: 'honestly nothing beats relaxing with good music after a long day' },
  { text: 'random question: what city is at the top of your travel bucket list? ✈️' },

  // Messages with curated scenery / aesthetic photo attachments
  {
    text: 'caught this sunset on my walk earlier! sky looked so unreal today 🌇',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    text: 'my cozy coffee and study spot today ☕ peaceful vibes',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  },
  {
    text: 'went on a trail hike this morning! fresh pine air was so needed 🌲',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
  },
  {
    text: 'look at this cute dog sitting outside the cafe today 🐾 made my day haha',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
  },
];

// Room-specific natural conversational messages
const ROOM_SPECIFIC_MESSAGES: Record<string, BotDialogue[]> = {
  usa: [
    { text: 'anyone from the west coast here? pacific sunset is gorgeous today 🌅' },
    { text: 'east coast traffic was crazy today haha, finally home' },
    { text: 'who is watching football this weekend? ready for the games 🏈' },
    { text: 'planning a road trip this summer! national parks are unreal 🚙' },
    { text: 'ny thin crust vs chicago deep dish, let the eternal debate begin 🍕' },
  ],
  singles: [
    { text: 'honest question for everyone: coffee date or drinks for a first date? ☕' },
    { text: 'what is a random green flag that instantly makes you like someone? 😄' },
    { text: 'why is dating in your 20s so exhausting sometimes haha' },
    { text: 'what do you usually like to talk about first when getting to know someone? 💬' },
    { text: 'hey everyone! just here chilling and hoping to meet some cool people 😊' },
  ],
  europe: [
    { text: 'hello from europe! ☕ how has your week been so far?' },
    { text: 'taking the train across the mountains next week, scenic train trips are unmatched 🚆' },
    { text: 'best budget weekend city trip? prague, budapest, or lisbon?' },
    { text: 'chilling with an espresso on the patio. ciao from italy! 🇮🇹' },
    { text: 'champions league matches tonight are going to be so intense ⚽' },
  ],
  gaming: [
    { text: 'what is everyone playing on steam or console tonight? 🎮' },
    { text: 'who else has a giant steam backlog of games bought on sale that they still havent touched 😂' },
    { text: 'finally beat that one boss after failing 15 times lmao feels so good' },
    { text: 'anybody down for casual games or co-op later?' },
    { text: 'couch gaming on console or desk gaming on pc? what is your preference?' },
  ],
};

// Conversational contextual replies referencing another user naturally
const BOT_INTERACTIONS = [
  (targetName: string) => `@${targetName} haha totally agree with you on that! 😊`,
  (targetName: string) => `@${targetName} wait really? that's so cool haha!`,
  (targetName: string) => `@${targetName} 100% with you on that one! 🙌`,
  (targetName: string) => `@${targetName} love your energy honestly ✨`,
  (targetName: string) => `@${targetName} oh nice!! what kind? tell us more!`,
  (targetName: string) => `@${targetName} haha good point honestly!`,
  (targetName: string) => `@${targetName} hey! hope your day is going great 😊`,
  (targetName: string) => `@${targetName} that made me laugh out loud 😂`,
  (targetName: string) => `@${targetName} so true!! couldn't have said it better 🙌`,
];

const BOT_REACTIONS = ['🔥', '❤️', '😂', '👍', '✨', '👏'];

export interface UseActiveBotEngineOptions {
  enabled: boolean;
  botCount?: number;
  frequency: 'fast' | 'normal' | 'relaxed';
  currentRoomId: string;
  currentUser: User | null;
  users: User[];
  soundEnabled: boolean;
  onBotMessage: (message: ChatMessage) => void;
  onBotTyping: (nickname: string | null) => void;
  onBotReact?: (messageId: string, emoji: string) => void;
  playIncomingSound?: () => void;
  recentMessages?: ChatMessage[];
}

export function useActiveBotEngine({
  enabled,
  botCount = 12,
  frequency,
  currentRoomId,
  currentUser,
  users,
  soundEnabled,
  onBotMessage,
  onBotTyping,
  onBotReact,
  playIncomingSound,
  recentMessages = [],
}: UseActiveBotEngineOptions) {
  const isRunningRef = useRef(false);
  const timeoutIdRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Frequency range in ms
  const getDelayRange = (freq: 'fast' | 'normal' | 'relaxed') => {
    switch (freq) {
      case 'fast':
        return { min: 5000, max: 9000 };
      case 'relaxed':
        return { min: 16000, max: 28000 };
      case 'normal':
      default:
        return { min: 8000, max: 15000 };
    }
  };

  useEffect(() => {
    if (!enabled || botCount <= 0) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onBotTyping(null);
      return;
    }

    let isSubscribed = true;

    const scheduleNextBotChat = () => {
      if (!isSubscribed) return;

      const { min, max } = getDelayRange(frequency);
      const nextDelay = Math.floor(min + Math.random() * (max - min));

      timeoutIdRef.current = setTimeout(() => {
        if (!isSubscribed) return;

        // Choose a bot from online users (excluding current real user), limited by active botCount
        const allCandidateBots = (users.length > 0 ? users : INITIAL_ONLINE_USERS).filter(
          (u) => !currentUser || u.id !== currentUser.id
        );
        const eligibleBots = allCandidateBots.slice(0, Math.max(1, botCount));

        if (eligibleBots.length === 0) {
          scheduleNextBotChat();
          return;
        }

        const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];

        // 80% chance of sending to the room user is currently viewing, 20% to other room
        const roomKeys = ['global', 'usa', 'singles', 'europe', 'gaming'];
        const targetRoom =
          Math.random() < 0.8
            ? currentRoomId
            : roomKeys[Math.floor(Math.random() * roomKeys.length)];

        // Decide message content:
        // 35% chance of conversational bot-interaction if there are recent messages
        let messageText = '';
        let imageUrl: string | undefined = undefined;

        const hasRecentMsgs = recentMessages && recentMessages.length > 0;
        const lastMsg = hasRecentMsgs ? recentMessages[recentMessages.length - 1] : null;

        if (hasRecentMsgs && lastMsg && lastMsg.senderName !== bot.nickname && Math.random() < 0.4) {
          const template = BOT_INTERACTIONS[Math.floor(Math.random() * BOT_INTERACTIONS.length)];
          messageText = template(lastMsg.senderName);
        } else if (ROOM_SPECIFIC_MESSAGES[targetRoom] && Math.random() < 0.45) {
          const list = ROOM_SPECIFIC_MESSAGES[targetRoom];
          const item = list[Math.floor(Math.random() * list.length)];
          messageText = item.text;
          imageUrl = item.imageUrl;
        } else {
          const item = GENERAL_BOT_MESSAGES[Math.floor(Math.random() * GENERAL_BOT_MESSAGES.length)];
          messageText = item.text;
          imageUrl = item.imageUrl;
        }

        // Show typing indicator for bot for realistic duration: 2.2s - 3.8s
        const typingDuration = Math.floor(2200 + Math.random() * 1600);
        if (targetRoom === currentRoomId) {
          onBotTyping(bot.nickname);
        }

        typingTimeoutRef.current = setTimeout(() => {
          if (!isSubscribed) return;

          onBotTyping(null);

          const newBotMsg: ChatMessage = {
            id: 'bot_msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            roomId: targetRoom,
            senderId: bot.id,
            senderName: bot.nickname,
            senderGender: bot.gender,
            senderCountry: bot.country,
            senderFlag: bot.flag,
            senderAvatar: bot.avatar,
            text: messageText,
            imageUrl,
            timestamp: Date.now(),
            isPrivate: false,
            reactions: {},
          };

          onBotMessage(newBotMsg);

          // Trigger soft audio ping if in current room and sound is enabled
          if (targetRoom === currentRoomId && soundEnabled && playIncomingSound) {
            playIncomingSound();
          }

          // 40% chance bot also reacts with an emoji to the previous message
          if (onBotReact && lastMsg && lastMsg.id && Math.random() < 0.4) {
            setTimeout(() => {
              if (!isSubscribed) return;
              const emoji = BOT_REACTIONS[Math.floor(Math.random() * BOT_REACTIONS.length)];
              onBotReact(lastMsg.id, emoji);
            }, 1200);
          }

          // Schedule next bot message
          scheduleNextBotChat();
        }, typingDuration);
      }, nextDelay);
    };

    // Initial bot chat kickstart after a brief 2.5s pause
    const initialDelay = setTimeout(() => {
      scheduleNextBotChat();
    }, 2500);

    return () => {
      isSubscribed = false;
      clearTimeout(initialDelay);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onBotTyping(null);
    };
  }, [
    enabled,
    frequency,
    currentRoomId,
    currentUser,
    users,
    soundEnabled,
  ]);
}
