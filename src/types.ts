export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  nickname: string;
  gender: Gender;
  age: number;
  country: string;
  countryCode: string;
  flag: string;
  avatar: string;
  isOnline: boolean;
  isMuted?: boolean;
  isBanned?: boolean;
  warningCount?: number;
  ipAddress: string;
  joinedAt: number;
  bio?: string;
  statusMessage?: string;
  isRealPeer?: boolean;
  currentRoom: string;
  lastActive: number;
  isGoogleUser?: boolean;
  email?: string;
  subscriptionTier?: 'free' | 'daily' | 'weekly' | 'monthly';
  subscriptionExpiresAt?: number | null;
  isVip?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderGender: Gender;
  senderCountry: string;
  senderFlag: string;
  senderAvatar: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  isSystem?: boolean;
  isPrivate?: boolean;
  targetUserId?: string;
  reactions?: Record<string, number>;
  reported?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: string;
  userCount: number;
  isCustomCommunity?: boolean;
  creatorId?: string;
  creatorName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  rules?: string[];
  ageLimit?: 'all' | '18+' | '21+';
  genderPreference?: 'any' | 'female_only' | 'male_only' | 'lgbtq_friendly';
  isPaid?: boolean;
  feeAmount?: number;
  createdAt?: number;
}

export interface StoryViewer {
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userGender?: Gender;
  userCountry?: string;
  userFlag?: string;
  mediaUrl?: string;
  backgroundGradient?: string;
  text?: string;
  caption?: string;
  createdAt: number;
  expiresAt: number;
  privacy: 'global' | 'friends_only';
  viewsCount: number;
  viewers: StoryViewer[];
  likesCount: number;
  likedBy: string[];
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface FriendRequest {
  id: string;
  fromUser: User;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  introMessage?: string;
}

export type AdPlacementType =
  | 'header_top'
  | 'sidebar_right'
  | 'in_chat'
  | 'bottom_anchor'
  | 'interstitial';

export interface AdSlot {
  id: string;
  placement: AdPlacementType;
  title: string;
  isEnabled: boolean;
  mode: 'custom_script' | 'demo_banner';
  scriptCode: string;
  impressions: number;
  clicks: number;
  demoTitle: string;
  demoSubtitle: string;
  demoCta: string;
  demoUrl: string;
  demoBadge: string;
  demoBgGradient: string;
}

export interface ReportedMessage {
  id: string;
  messageId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  reportedBy: string;
  reason: string;
  timestamp: number;
  status: 'pending' | 'reviewed' | 'banned';
}

export interface AttackIncidentReport {
  id: string; // e.g. "INC-2026-SQLI-4921"
  timestamp: number;
  threatType: 'sqli' | 'xss' | 'path_traversal' | 'rce' | 'dir_fuzzing' | 'scanner_probe' | 'brute_force' | 'ssti' | 'header_injection' | 'wrong_password';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number; // e.g. 9.8
  owaspCategory: string; // e.g. "OWASP A03:2021 - Injection"
  cweId: string; // e.g. "CWE-89: SQL Injection"
  mitreAttackTechnique: string; // e.g. "T1190: Exploit Public-Facing Application"
  methodName: string; // e.g. "Boolean-Based Blind Tautology Bypass"
  targetEndpoint: string; // e.g. "/api/v1/auth/admin-login"
  rawPayload: string;
  source: 'login_probe' | 'pretesting_simulation' | 'chat_injection' | 'url_parameter' | 'api_scanner';
  payloadAnalysis: {
    vectorDescription: string;
    syntaxBreakdown: string;
    attackerIntent: string;
    potentialImpactIfUnprotected: string;
  };
  networkAttribution: {
    ip: string;
    isp: string;
    country: string;
    city: string;
    reverseDns?: string;
    userAgent: string;
  };
  containmentStatus: 'BLOCKED_BY_WAF' | 'TRAPPED_IN_HONEYPOT_SANDBOX' | 'QUARANTINED';
  mitigationAdvice: string[];
}

export interface SecurityAuditLog {
  id: string;
  timestamp: number;
  ip: string;
  eventType: 'login_success' | 'login_failed' | 'password_changed' | '3fa_updated' | 'cyber_attack_blocked' | 'secret_token_updated' | 'suspicious_activity';
  factorReached: number;
  detail: string;
  attemptedUsername?: string;
  attemptedPassword?: string;
  threatType?: 'sqli' | 'wrong_password' | 'brute_force' | 'probe' | 'xss' | 'path_traversal' | 'rce' | 'dir_fuzzing' | 'scanner_probe' | 'ssti' | 'header_injection';
  country?: string;
  city?: string;
  isp?: string;
  userAgent?: string;
  incidentReport?: AttackIncidentReport;
}

export interface AdminSettings {
  adminUsername: string; // e.g. 'admin'
  adminPassword: string;
  adminSecretToken: string; // Secret URL slug e.g. 'portal' -> /?admin=portal
  threeFactorEnabled: boolean;
  factorTwoSecretPin: string; // 6-digit TOTP / Authenticator PIN e.g. '849201'
  factorThreeRecoveryKey: string; // Cryptographic Security Recovery Key e.g. 'NX-SEC-9281-7462'
  adminEmail: string;
  failedLoginAttempts: number;
  lockoutUntil: number;
  auditLogs: SecurityAuditLog[];
  bannedWords: string[];
  bannedIps: string[];
  mutedUserIds: string[];
  siteAnnouncement: string;
  announcementEnabled: boolean;
  cpmRate: number; // e.g. $2.50 per 1000 impressions
  cpcRate: number; // e.g. $0.35 per click
  activeBotsEnabled: boolean;
  activeBotsCount: number; // Slider/counter to scale bot population (0 to 50+)
  botChatFrequency: 'fast' | 'normal' | 'relaxed';
  botRealismTone?: 'pleasing' | 'casual' | 'supportive';
  communityCreationPrice: number; // Price to create a custom community/room
  communityCreationCurrency: string; // e.g. '$', '€', etc.
  communityCreationFreeForVip: boolean;
}

export interface ConversationTab {
  id: string; // 'global' or userId
  type: 'room' | 'private';
  title: string;
  user?: User;
  unreadCount: number;
}

export type PlanDuration = 'daily' | 'weekly' | 'monthly';

export interface SubscriptionPlan {
  id: PlanDuration;
  name: string;
  durationDays: number;
  price: number;
  currency: string;
  features: string[];
  badge?: string;
  isEnabled: boolean;
  description: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode: string;
  routingNumber?: string;
  country: string;
}

export interface MobileMoneyDetails {
  provider: string; // e.g. 'M-Pesa', 'MTN Mobile Money', 'Airtel Money', 'Orange Money', 'Wave', 'MoMo'
  phoneNumber: string;
  registeredName: string;
  country: string;
}

export interface PayoutTransaction {
  id: string;
  reference: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: 'bank' | 'mobile_money';
  destinationSummary: string;
  timestamp: number;
  status: 'completed' | 'processing';
}

export interface CreatorWallet {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingPayouts: number;
  currency: string;
  bankDetails: BankDetails;
  mobileMoneyDetails: MobileMoneyDetails;
  transactions: PayoutTransaction[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

