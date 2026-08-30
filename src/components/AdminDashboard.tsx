import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Lock,
  DollarSign,
  TrendingUp,
  Users,
  ShieldAlert,
  Code2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Eye,
  MousePointer,
  HelpCircle,
  Plus,
  Trash2,
  VolumeX,
  UserX,
  Radio,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Crown,
  Wallet,
  Bot,
} from 'lucide-react';
import { AdSlot, AdminSettings, CreatorWallet, ReportedMessage, SecurityAuditLog, SubscriptionPlan, User } from '../types';
import { calculateEstimatedRevenue } from '../utils/storage';
import { AdminWalletTab } from './admin/AdminWalletTab';
import { AdminPricingTab } from './admin/AdminPricingTab';
import { AdminAICopilotTab } from './admin/AdminAICopilotTab';
import { AdminSecurityTab } from './admin/AdminSecurityTab';
import { AdminAttackersTrackerTab } from './admin/AdminAttackersTrackerTab';
import { FakeAdminHoneypotDashboard } from './admin/FakeAdminHoneypotDashboard';
import { getClientPublicIp, getImmediateClientIp } from '../utils/ipTracker';
import { ShieldCheck, KeyRound, EyeOff, Shield, LogOut, Bug } from 'lucide-react';
import { buildAttackIncidentReport, detectAttackInPayload } from '../utils/attackDetector';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onKickUser: (userId: string) => void;
  onMuteUser: (userId: string) => void;
  onBanUser: (userId: string) => void;
  adSlots: AdSlot[];
  onUpdateAdSlot: (updatedSlot: AdSlot) => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
  reports: ReportedMessage[];
  onResolveReport: (reportId: string, action: 'dismiss' | 'ban') => void;
  onBroadcastAnnouncement: (text: string) => void;
  plans: SubscriptionPlan[];
  onUpdatePlans: (newPlans: SubscriptionPlan[]) => void;
  wallet: CreatorWallet;
  onUpdateWallet: (newWallet: CreatorWallet) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  users,
  onKickUser,
  onMuteUser,
  onBanUser,
  adSlots,
  onUpdateAdSlot,
  adminSettings,
  onUpdateAdminSettings,
  reports,
  onResolveReport,
  onBroadcastAnnouncement,
  plans,
  onUpdatePlans,
  wallet,
  onUpdateWallet,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('chatiw_admin_auth') === 'true';
  });
  // Simple Admin Login States
  const [usernameInput, setUsernameInput] = useState(adminSettings.adminUsername || 'admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailInput, setForgotEmailInput] = useState(adminSettings.adminEmail || 'admin@chatnexu.com');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');

  // Overview Tab Quick Credentials Change State
  const [overviewNewUser, setOverviewNewUser] = useState(adminSettings.adminUsername || 'admin');
  const [overviewNewPass, setOverviewNewPass] = useState('');
  const [overviewConfirmPass, setOverviewConfirmPass] = useState('');
  const [overviewCredStatus, setOverviewCredStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dedicated Change Password Modal State (Authenticated Only)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePassCurrent, setChangePassCurrent] = useState('');
  const [changePassNew, setChangePassNew] = useState('');
  const [changePassConfirm, setChangePassConfirm] = useState('');
  const [showChangePassCurrent, setShowChangePassCurrent] = useState(false);
  const [showChangePassNew, setShowChangePassNew] = useState(false);
  const [showChangePassConfirm, setShowChangePassConfirm] = useState(false);
  const [changePassStatus, setChangePassStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'security' | 'attackers' | 'wallet' | 'pricing' | 'ai_copilot' | 'ads' | 'users' | 'moderation' | 'github'
  >('overview');

  // Client Public IP State (for capturing real attacker IP)
  const [currentClientIp, setCurrentClientIp] = useState<{
    ip: string;
    country: string;
    countryCode: string;
    city: string;
    isp: string;
  }>(getImmediateClientIp());

  useEffect(() => {
    getClientPublicIp().then((res) => {
      if (res && res.ip) {
        setCurrentClientIp(res);
      }
    });
  }, []);

  // Total count of attacker intrusions trapped in honeypot
  const attackerLogsCount = useMemo(() => {
    return (adminSettings.auditLogs || []).filter(
      (log) =>
        log.eventType === 'suspicious_activity' ||
        log.eventType === 'cyber_attack_blocked' ||
        log.eventType === 'login_failed' ||
        log.detail.toLowerCase().includes('honeypot') ||
        log.detail.toLowerCase().includes('unauthorized') ||
        log.detail.toLowerCase().includes('sql')
    ).length;
  }, [adminSettings.auditLogs]);

  // New banned word input
  const [newBannedWord, setNewBannedWord] = useState('');
  // Broadcast text input
  const [announcementText, setAnnouncementText] = useState(adminSettings.siteAnnouncement || '');
  // Selected ad slot for editing
  const [selectedSlotId, setSelectedSlotId] = useState<string>(adSlots[0]?.id || 'ad_header_top');
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  // Honeypot Decoy Dashboard state (opened when SQL injection like ' OR '1'='1 or wrong password is entered)
  const [showFakeDashboard, setShowFakeDashboard] = useState(false);
  const [interceptedPayload, setInterceptedPayload] = useState('');

  // Helper to detect SQL injection payloads like ' OR '1'='1, " or 1=1, admin' --, etc.
  const isSqlInjectionAttempt = (input: string): boolean => {
    if (!input) return false;
    const raw = input.trim();
    const lower = raw.toLowerCase();

    const injectionPatterns = [
      /('|\")\s*or\s*('|\")?\d+('|\")?\s*=\s*('|\")?\d+/i,               // ' or '1'='1 or " or 1=1
      /('|\")\s*or\s*('|\")?[a-z0-9]+('|\")?\s*=\s*('|\")?[a-z0-9]+/i, // ' or 'a'='a
      /('|\")\s*or\s*('|\")\s*=\s*('|\")/i,                             // ' or ''='
      /or\s+1\s*=\s*1/i,                                                 // or 1=1
      /or\s+'1'\s*=\s*'1'/i,                                             // or '1'='1
      /or\s+"1"\s*=\s*"1"/i,                                             // or "1"="1
      /('|\")\s*or\s+true/i,                                             // ' or true
      /admin'\s*(--|#|\/\*)/i,                                           // admin' --
      /'\s*(--|#|\/\*)/i,                                                // ' --
      /union\s+(all\s+)?select/i,                                        // union select
      /select\s+.*\s+from/i,                                             // select * from
      /drop\s+table/i,                                                   // drop table
      /;\s*--/i,                                                         // ; --
    ];

    if (injectionPatterns.some((pattern) => pattern.test(raw))) {
      return true;
    }

    const knownPayloads = [
      "' or '1'='1",
      "' or '1' = '1",
      "' or 1=1",
      "' or 1 = 1",
      '" or "1"="1',
      '" or 1=1',
      "' or 'a'='a",
      "' or ''='",
      "or '1'='1",
      "or 1=1",
      "admin' --",
      "admin' #",
      "' or true",
      "1' or '1' = '1",
      "' or '1'='1' --",
      "' or 1=1 --",
      "' or 1=1#",
    ];

    return knownPayloads.some((payload) => lower.includes(payload));
  };

  if (!isOpen) return null;

  // Simple Admin Login: Validate Username & Password
  // If correct: logs into authentic dashboard
  // If wrong password, wrong username, or attacker command: traps into fake dashboard & logs attacker IP!
  const handleSimpleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const targetUsername = (adminSettings.adminUsername || 'admin').trim().toLowerCase();
    const enteredUsername = usernameInput.trim().toLowerCase();
    const targetPassword = adminSettings.adminPassword || 'admin123';

    if (!enteredUsername) {
      setAuthError('Please enter your admin username.');
      return;
    }
    if (!passwordInput) {
      setAuthError('Please enter your admin password.');
      return;
    }

    // 1. Authentic Administrator verification
    if (enteredUsername === targetUsername && passwordInput === targetPassword) {
      const newLog: SecurityAuditLog = {
        id: 'log_' + Date.now(),
        timestamp: Date.now(),
        ip: `${currentClientIp.ip} (Verified Admin Session)`,
        eventType: 'login_success',
        factorReached: 1,
        detail: `Admin logged in successfully with username "${usernameInput.trim()}".`,
      };

      onUpdateAdminSettings({
        ...adminSettings,
        failedLoginAttempts: 0,
        lockoutUntil: 0,
        auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
      });

      setIsAuthenticated(true);
      sessionStorage.setItem('chatiw_admin_auth', 'true');
      sessionStorage.setItem('nexu_admin_auth', 'true');
      setAuthError('');
      return;
    }

    // 2. UNAUTHORIZED ACCESS: Wrong password, wrong username, or attacker command!
    // Trap into fake honeypot dashboard and record attacker IP & credentials
    const isSqli = isSqlInjectionAttempt(usernameInput) || isSqlInjectionAttempt(passwordInput);
    const payloadCaptured = isSqli
      ? (isSqlInjectionAttempt(passwordInput) ? passwordInput : usernameInput).trim()
      : passwordInput.trim();

    const detectedThreat = detectAttackInPayload(payloadCaptured, navigator.userAgent);
    const incidentReport = buildAttackIncidentReport({
      rawPayload: payloadCaptured,
      source: 'login_probe',
      targetEndpoint: '/api/v1/auth/admin-login',
      ipInfo: {
        ip: currentClientIp.ip,
        country: currentClientIp.country,
        city: currentClientIp.city,
        isp: currentClientIp.isp,
      },
      userAgent: navigator.userAgent,
      threatDetails: detectedThreat || undefined,
      containmentStatus: 'TRAPPED_IN_HONEYPOT_SANDBOX',
    });

    const newLog: SecurityAuditLog = {
      id: 'log_atk_' + Date.now(),
      timestamp: Date.now(),
      ip: `${currentClientIp.ip} (Honeypot Sandbox Trap)`,
      eventType: 'suspicious_activity',
      threatType: detectedThreat?.threatType || (isSqli ? 'sqli' : 'wrong_password'),
      attemptedUsername: usernameInput.trim(),
      attemptedPassword: passwordInput.trim(),
      country: currentClientIp.country,
      city: currentClientIp.city,
      isp: currentClientIp.isp,
      userAgent: navigator.userAgent,
      factorReached: 1,
      detail: isSqli
        ? `Honeypot Trap Activated! Inbound SQL injection command "${payloadCaptured}" intercepted from IP ${currentClientIp.ip}. Attacker diverted into isolated Decoy Sandbox.`
        : `Honeypot Trap Activated! Unauthorized login attempt with username "${usernameInput.trim()}" and password "${passwordInput.trim()}" from IP ${currentClientIp.ip}. Attacker diverted into isolated Decoy Sandbox.`,
      incidentReport,
    };

    onUpdateAdminSettings({
      ...adminSettings,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    });

    // Directly open the fake dashboard for the unauthorized user
    setInterceptedPayload(payloadCaptured);
    setShowFakeDashboard(true);
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError('');
  };

  // Sign out of admin session
  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('chatiw_admin_auth');
    sessionStorage.removeItem('nexu_admin_auth');
    setPasswordInput('');
    setAuthError('');
  };

  // Forgotten password simulation (user noted it doesn't work / disabled on server)
  const handleRequestPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSqlInjectionAttempt(forgotEmailInput)) {
      const payload = forgotEmailInput.trim();
      const newLog: SecurityAuditLog = {
        id: 'log_sqli_' + Date.now(),
        timestamp: Date.now(),
        ip: `${currentClientIp.ip} (Honeypot Sandbox Trap)`,
        eventType: 'suspicious_activity',
        threatType: 'sqli',
        attemptedUsername: 'password_reset_probe',
        attemptedPassword: payload,
        country: currentClientIp.country,
        city: currentClientIp.city,
        isp: currentClientIp.isp,
        userAgent: navigator.userAgent,
        factorReached: 1,
        detail: `Honeypot Trap Activated! Inbound SQL injection command "${payload}" intercepted from IP ${currentClientIp.ip} on password recovery. Attacker diverted into isolated Decoy Sandbox.`,
      };

      onUpdateAdminSettings({
        ...adminSettings,
        auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
      });

      setInterceptedPayload(payload);
      setShowFakeDashboard(true);
      setShowForgotPassword(false);
      return;
    }

    setForgotPasswordStatus('error');
  };

  // Save changes to username & password from Overview tab
  const handleOverviewUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setOverviewCredStatus(null);

    const cleanUser = overviewNewUser.trim();
    if (!cleanUser) {
      setOverviewCredStatus({ type: 'error', text: 'Admin username cannot be empty.' });
      return;
    }

    if (overviewNewPass) {
      if (overviewNewPass.length < 4) {
        setOverviewCredStatus({ type: 'error', text: 'New password must be at least 4 characters long.' });
        return;
      }
      if (overviewNewPass !== overviewConfirmPass) {
        setOverviewCredStatus({ type: 'error', text: 'New password and confirmation do not match.' });
        return;
      }
    }

    const finalPass = overviewNewPass ? overviewNewPass : adminSettings.adminPassword;

    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      ip: '127.0.0.1 (Admin Session)',
      eventType: 'password_changed',
      factorReached: 1,
      detail: `Admin credentials changed. Username: "${cleanUser}".`,
    };

    onUpdateAdminSettings({
      ...adminSettings,
      adminUsername: cleanUser,
      adminPassword: finalPass,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    });

    setOverviewNewPass('');
    setOverviewConfirmPass('');
    setOverviewCredStatus({
      type: 'success',
      text: `Admin credentials updated successfully! New username: "${cleanUser}".`,
    });
    setTimeout(() => setOverviewCredStatus(null), 5000);
  };

  // Dedicated Change Admin Password Handler (strictly authenticated only)
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassStatus(null);

    // Enforce authentication condition: can change admin password when logged in only
    if (!isAuthenticated) {
      setChangePassStatus({
        type: 'error',
        text: 'Access Denied: Admin password can only be changed when you are logged into the admin dashboard.',
      });
      return;
    }

    if (changePassCurrent !== adminSettings.adminPassword) {
      setChangePassStatus({
        type: 'error',
        text: 'Current password is incorrect. Please verify and enter your active admin password.',
      });
      return;
    }

    if (!changePassNew || changePassNew.length < 4) {
      setChangePassStatus({
        type: 'error',
        text: 'New password must be at least 4 characters long.',
      });
      return;
    }

    if (changePassNew !== changePassConfirm) {
      setChangePassStatus({
        type: 'error',
        text: 'New password and confirmation do not match.',
      });
      return;
    }

    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      ip: '127.0.0.1 (Authenticated Admin Session)',
      eventType: 'password_changed',
      factorReached: 1,
      detail: `Master admin password updated by logged-in admin ("${adminSettings.adminUsername || 'admin'}").`,
    };

    onUpdateAdminSettings({
      ...adminSettings,
      adminPassword: changePassNew,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    });

    setChangePassCurrent('');
    setChangePassNew('');
    setChangePassConfirm('');
    setChangePassStatus({
      type: 'success',
      text: 'Admin password updated successfully! Your new password is now active for future logins.',
    });
  };

  const currentEditingSlot = adSlots.find((s) => s.id === selectedSlotId) || adSlots[0];

  const { totalImpressions, totalClicks, estimatedRevenue, ctr } =
    calculateEstimatedRevenue(adSlots, adminSettings);

  const handleAddBannedWord = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newBannedWord.trim().toLowerCase();
    if (!clean || adminSettings.bannedWords.includes(clean)) return;

    const updated = {
      ...adminSettings,
      bannedWords: [...adminSettings.bannedWords, clean],
    };
    onUpdateAdminSettings(updated);
    setNewBannedWord('');
  };

  const handleRemoveBannedWord = (word: string) => {
    const updated = {
      ...adminSettings,
      bannedWords: adminSettings.bannedWords.filter((w) => w !== word),
    };
    onUpdateAdminSettings(updated);
  };

  const handleSaveAnnouncement = () => {
    const updated = {
      ...adminSettings,
      siteAnnouncement: announcementText,
      announcementEnabled: true,
    };
    onUpdateAdminSettings(updated);
    onBroadcastAnnouncement(announcementText);
    alert('Announcement broadcasted to all active rooms!');
  };

  const githubWorkflowYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build static site
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-3.5 text-white flex items-center justify-between shrink-0 transition-colors ${
          showFakeDashboard ? 'bg-slate-950 border-b border-amber-500/30' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
              showFakeDashboard ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-sky-500 text-slate-950'
            }`}>
              {showFakeDashboard ? '🪤' : '👑'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
                  {showFakeDashboard ? 'Chat Nexu • Decoy Honeypot Console' : 'Chat Nexu • Admin & Security Center'}
                </h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  showFakeDashboard
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                }`}>
                  {showFakeDashboard ? 'Decoy Sandbox' : 'Control Center'}
                </span>
                {showFakeDashboard && (
                  <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 rounded-full hidden sm:inline">
                    Simulated Root Sandbox
                  </span>
                )}
                {!showFakeDashboard && isAuthenticated && (
                  <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full hidden sm:inline">
                    Admin Authenticated
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {showFakeDashboard
                  ? 'Isolated honeypot container • Synthetic SQLite database • Real system 100% protected'
                  : 'Simple admin portal • Ad scripts monetization • Creator wallet • Community controls'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showFakeDashboard && (
              <button
                type="button"
                onClick={() => {
                  setShowFakeDashboard(false);
                  setIsAuthenticated(false);
                  setPasswordInput('');
                  setAuthError('');
                }}
                className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/40 shadow-xs"
                title="Return to real admin login screen"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Exit Decoy</span>
              </button>
            )}

            {!showFakeDashboard && isAuthenticated && (
              <>
                <button
                  id="admin-header-change-pass-btn"
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(true);
                    setChangePassStatus(null);
                    setChangePassCurrent('');
                    setChangePassNew('');
                    setChangePassConfirm('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/40 shadow-2xs"
                  title="Change Admin Password (Available only when logged in)"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Sign out of admin session"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                if (showFakeDashboard) {
                  setShowFakeDashboard(false);
                }
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {showFakeDashboard ? (
          <FakeAdminHoneypotDashboard
            interceptedPayload={interceptedPayload}
            onExit={() => {
              setShowFakeDashboard(false);
              setIsAuthenticated(false);
              setPasswordInput('');
              setAuthError('');
            }}
          />
        ) : !isAuthenticated ? (
          /* Simple Admin Login Screen */
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50 overflow-y-auto">
            {!showForgotPassword ? (
              <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
                {/* Header Badge */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-500/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-1">
                  Chat Nexu Admin Portal
                </h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Sign in with your administrator username and password to manage ads, users, and settings.
                </p>

                {/* Error Banner */}
                {authError && (
                  <div className="mb-4 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-start gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-semibold">{authError}</span>
                  </div>
                )}

                <form onSubmit={handleSimpleAdminLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Admin Username
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="admin"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50 text-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Admin Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotPasswordStatus(null);
                        }}
                        className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 cursor-pointer hover:underline"
                      >
                        Forgotten password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter admin password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10 bg-slate-50/50 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer transform active:scale-[0.99]"
                  >
                    Log In to Admin Dashboard &rarr;
                  </button>
                </form>

                {/* Discreet Security Footer (No credentials leaked) */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Protected Administrator Gateway &bull; Intrusion Detection Active</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Forgotten Password Screen (user requested: it doesn't work message) */
              <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 text-center animate-in fade-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-1">
                  Admin Password Recovery
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Administrator self-service forgotten password recovery portal.
                </p>

                {/* Clear Notice that automatic reset does not work and password can only be changed when logged in */}
                <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-xl text-xs text-amber-900 text-left mb-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ Password Reset Service Disabled</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    Automatic password reset does not work on this server. By security design, you can <strong>only change the admin password when you are logged into</strong> the administrator session.
                  </p>
                </div>

                {/* Error shown if they submit */}
                {forgotPasswordStatus === 'error' && (
                  <div className="mb-4 p-3 text-xs bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-left space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>❌ Password Reset Failed</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      The automated password reset system does not work on this server (SMTP delivery is offline). Please sign in using your active admin credentials or contact security support at <strong className="text-rose-950 font-mono">{adminSettings.adminEmail || 'selenasmith2220@gmail.com'}</strong>.
                    </p>
                  </div>
                )}

                <form onSubmit={handleRequestPasswordReset} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Administrator Email or Username
                    </label>
                    <input
                      type="text"
                      placeholder="admin@chatnexu.com"
                      value={forgotEmailInput}
                      onChange={(e) => setForgotEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50 text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Send Password Reset Link
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordStatus(null);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    &larr; Back to Simple Login
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Logged In Dashboard with Tabs */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* Tabs Navigation */}
            <div id="admin-tabs-nav" className="bg-white border-b border-slate-200 px-4 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
              <button
                id="admin-tab-overview-btn"
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'overview'
                    ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Revenue &amp; Analytics</span>
              </button>

              <button
                id="admin-tab-security-btn"
                onClick={() => setActiveTab('security')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'security'
                    ? 'border-indigo-600 text-indigo-800 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Security &amp; 3FA</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Stealth
                </span>
              </button>

              <button
                id="admin-tab-attackers-btn"
                onClick={() => setActiveTab('attackers')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'attackers'
                    ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
                title="Inspect captured intruder IP addresses, attempted passwords, and intrusion logs"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>🚨 Attacker IPs &amp; Radar</span>
                {attackerLogsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                    {attackerLogsCount}
                  </span>
                )}
              </button>

              <button
                id="admin-tab-wallet-btn"
                onClick={() => setActiveTab('wallet')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Creator Wallet</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  ${wallet.balance.toFixed(2)}
                </span>
              </button>

              <button
                id="admin-tab-pricing-btn"
                onClick={() => setActiveTab('pricing')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'pricing'
                    ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>VIP Pricing Manager</span>
              </button>

              <button
                id="admin-tab-ai-copilot-btn"
                onClick={() => setActiveTab('ai_copilot')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'ai_copilot'
                    ? 'border-indigo-600 text-indigo-800 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>AI Copilot</span>
              </button>

              <button
                id="admin-tab-ads-btn"
                onClick={() => setActiveTab('ads')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'ads'
                    ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Ad Scripts Integration</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  Monetize
                </span>
              </button>

              <button
                id="admin-tab-users-btn"
                onClick={() => setActiveTab('users')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'users'
                    ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Monitor ({users.length})</span>
              </button>

              <button
                id="admin-tab-moderation-btn"
                onClick={() => setActiveTab('moderation')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'moderation'
                    ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Moderation & Reports ({reports.filter((r) => r.status === 'pending').length})</span>
              </button>

              <button
                id="admin-tab-github-btn"
                onClick={() => setActiveTab('github')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'github'
                    ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Host on GitHub Guide</span>
              </button>
            </div>

            {/* Tab Panes */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Total Ad Revenue
                        </span>
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        ${estimatedRevenue.toFixed(2)}
                      </div>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        Based on ${adminSettings.cpmRate.toFixed(2)} CPM & ${adminSettings.cpcRate.toFixed(2)} CPC
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Ad Impressions
                        </span>
                        <Eye className="w-4 h-4 text-sky-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {totalImpressions.toLocaleString()}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Across 4 ad placement slots
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Ad Clicks (CTR)
                        </span>
                        <MousePointer className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {totalClicks.toLocaleString()}{' '}
                        <span className="text-xs text-slate-500 font-normal">
                          ({ctr}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Healthy industry average ~1.5%
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Active Chatters
                        </span>
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {users.length}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Connected in chat rooms
                      </p>
                    </div>
                  </div>

                  {/* Quick Admin Credentials Management (Username & Password) */}
                  <div className="bg-white rounded-xl border border-sky-200 p-5 shadow-2xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-sky-600" />
                          <span>Admin Login Credentials (Username &amp; Password)</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                            Active User: {adminSettings.adminUsername || 'admin'}
                          </span>
                          <button
                            id="admin-overview-change-pass-btn"
                            type="button"
                            onClick={() => {
                              setShowChangePasswordModal(true);
                              setChangePassStatus(null);
                              setChangePassCurrent('');
                              setChangePassNew('');
                              setChangePassConfirm('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Open dedicated password changer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span>Change Password</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">
                        Update your administrator username and password at any time while logged in. Changes take effect immediately across all login portals.
                      </p>

                      {overviewCredStatus && (
                        <div
                          className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                            overviewCredStatus.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold'
                          }`}
                        >
                          {overviewCredStatus.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{overviewCredStatus.text}</span>
                        </div>
                      )}

                      <form onSubmit={handleOverviewUpdateCredentials} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Admin Username
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="admin"
                            value={overviewNewUser}
                            onChange={(e) => setOverviewNewUser(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/60 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            New Password <span className="text-slate-400 font-normal">(leave blank to keep)</span>
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={overviewNewPass}
                            onChange={(e) => setOverviewNewPass(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/60 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Confirm Password
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={overviewConfirmPass}
                              onChange={(e) => setOverviewConfirmPass(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/60 text-slate-900"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-2xs cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Revenue Projection Tool */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Traffic & Revenue Projection Calculator</span>
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Chat sites like Chat Nexu generate immense revenue because visitors stay engaged for long sessions, generating multiple ad impressions per minute.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase">
                          At 2,000 Daily Visitors:
                        </span>
                        <div className="text-lg font-extrabold text-slate-800 mt-1">
                          ~$300 &ndash; $600 / month
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ~120,000 monthly ad impressions
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase">
                          At 10,000 Daily Visitors:
                        </span>
                        <div className="text-lg font-extrabold text-emerald-700 mt-1">
                          ~$1,500 &ndash; $2,800 / month
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ~600,000 monthly impressions
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase">
                          At 50,000 Daily Visitors:
                        </span>
                        <div className="text-lg font-extrabold text-sky-700 mt-1">
                          ~$7,500 &ndash; $15,000 / month
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ~3M impressions + VIP subscriptions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ad Performance Breakdown */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Ad Unit Performance
                      </h4>
                      <span className="text-xs text-sky-600 font-semibold">
                        4 Active Units
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {adSlots.map((slot) => {
                        const slotRev =
                          ((slot.impressions || 0) / 1000) * adminSettings.cpmRate +
                          (slot.clicks || 0) * adminSettings.cpcRate;
                        return (
                          <div
                            key={slot.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50"
                          >
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-2">
                                <span>{slot.title}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                    slot.isEnabled
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {slot.isEnabled ? 'Active' : 'Disabled'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  [{slot.mode}]
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Placement: {slot.placement}
                              </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                              <div className="text-right">
                                <div className="text-[11px] text-slate-400">
                                  Impressions
                                </div>
                                <div className="font-bold text-slate-700">
                                  {slot.impressions.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[11px] text-slate-400">
                                  Clicks
                                </div>
                                <div className="font-bold text-slate-700">
                                  {slot.clicks.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right min-w-[70px]">
                                <div className="text-[11px] text-slate-400">
                                  Revenue
                                </div>
                                <div className="font-bold text-emerald-600">
                                  ${slotRev.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SECURITY & 3-FACTOR AUTHENTICATION */}
              {activeTab === 'security' && (
                <AdminSecurityTab
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={onUpdateAdminSettings}
                />
              )}

              {/* TAB: ATTACKER IP INTELLIGENCE & INTRUSION RADAR */}
              {activeTab === 'attackers' && (
                <AdminAttackersTrackerTab
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={onUpdateAdminSettings}
                />
              )}

              {/* TAB: CREATOR WALLET & PAYOUTS */}
              {activeTab === 'wallet' && (
                <AdminWalletTab wallet={wallet} onUpdateWallet={onUpdateWallet} />
              )}

              {/* TAB: DYNAMIC PRICING & PLANS MANAGER */}
              {activeTab === 'pricing' && (
                <AdminPricingTab plans={plans} onUpdatePlans={onUpdatePlans} />
              )}

              {/* TAB: AI ADMIN COPILOT */}
              {activeTab === 'ai_copilot' && (
                <AdminAICopilotTab
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={onUpdateAdminSettings}
                />
              )}

              {/* TAB 2: AD SCRIPTS INTEGRATION (CORE USER REQUEST) */}
              {activeTab === 'ads' && (
                <div className="space-y-6">
                  {/* Explanatory Banner */}
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-3">
                    <Code2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm mb-1">
                        Integrate Real Advertisement Scripts For Revenue
                      </h4>
                      <p className="leading-relaxed">
                        You can paste your ad scripts from <strong>Google AdSense</strong>, <strong>Adsterra</strong>, <strong>PropellerAds</strong>, <strong>Ezoic</strong>, or <strong>Amazon Affiliates</strong>. The engine safely renders the code in isolated sandbox containers. If you don&rsquo;t have real ad tags yet, leave &ldquo;Demo Banner&rdquo; enabled to display high-converting affiliate promotions.
                      </p>
                    </div>
                  </div>

                  {/* Slot Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {adSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                          selectedSlotId === slot.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {slot.placement.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Edit Selected Slot */}
                  {currentEditingSlot && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900">
                            {currentEditingSlot.title}
                          </h3>
                          <span className="text-xs text-slate-500">
                            Placement ID: <code className="font-mono text-sky-600">{currentEditingSlot.id}</code>
                          </span>
                        </div>

                        {/* Enable/Disable switch */}
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentEditingSlot.isEnabled}
                              onChange={(e) =>
                                onUpdateAdSlot({
                                  ...currentEditingSlot,
                                  isEnabled: e.target.checked,
                                })
                              }
                              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                            />
                            <span>Enable this Ad Spot</span>
                          </label>
                        </div>
                      </div>

                      {/* Mode selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Display Mode
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAdSlot({
                                ...currentEditingSlot,
                                mode: 'demo_banner',
                              })
                            }
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              currentEditingSlot.mode === 'demo_banner'
                                ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 font-bold text-sky-800'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold text-slate-900">
                              ✨ High-Converting Demo Banner
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 font-normal">
                              Displays attractive VIP / VPN sponsor cards. Great for pre-approval or affiliate links.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAdSlot({
                                ...currentEditingSlot,
                                mode: 'custom_script',
                              })
                            }
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              currentEditingSlot.mode === 'custom_script'
                                ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 font-bold text-sky-800'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold text-slate-900">
                              💻 Custom Ad Network Script (HTML / JS)
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 font-normal">
                              Paste real Google AdSense, Adsterra, or custom HTML tags for direct monetized earnings.
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Script code editor */}
                      {currentEditingSlot.mode === 'custom_script' ? (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              HTML / JavaScript Ad Code Snippet
                            </label>
                            <span className="text-[10px] text-slate-400">
                              Supports &lt;script&gt;, &lt;ins&gt;, &lt;iframe&gt;, and &lt;a&gt; tags
                            </span>
                          </div>
                          <textarea
                            rows={7}
                            value={currentEditingSlot.scriptCode}
                            onChange={(e) =>
                              onUpdateAdSlot({
                                ...currentEditingSlot,
                                scriptCode: e.target.value,
                              })
                            }
                            placeholder="<!-- Paste your AdSense or Adsterra ad code snippet here -->"
                            className="w-full p-3 font-mono text-xs bg-slate-900 text-sky-300 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      ) : (
                        /* Demo banner details editor */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Headline
                            </label>
                            <input
                              type="text"
                              value={currentEditingSlot.demoTitle}
                              onChange={(e) =>
                                onUpdateAdSlot({
                                  ...currentEditingSlot,
                                  demoTitle: e.target.value,
                                })
                              }
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Button CTA
                            </label>
                            <input
                              type="text"
                              value={currentEditingSlot.demoCta}
                              onChange={(e) =>
                                onUpdateAdSlot({
                                  ...currentEditingSlot,
                                  demoCta: e.target.value,
                                })
                              }
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Target Destination URL
                            </label>
                            <input
                              type="text"
                              value={currentEditingSlot.demoUrl}
                              onChange={(e) =>
                                onUpdateAdSlot({
                                  ...currentEditingSlot,
                                  demoUrl: e.target.value,
                                })
                              }
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* Rates configuration */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-slate-500 font-semibold">
                              CPM Rate ($ / 1,000 views):
                            </span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={adminSettings.cpmRate}
                              onChange={(e) =>
                                onUpdateAdminSettings({
                                  ...adminSettings,
                                  cpmRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 ml-2 px-2 py-1 border border-slate-300 rounded-md bg-white font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">
                              CPC Rate ($ / click):
                            </span>
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              value={adminSettings.cpcRate}
                              onChange={(e) =>
                                onUpdateAdminSettings({
                                  ...adminSettings,
                                  cpcRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 ml-2 px-2 py-1 border border-slate-300 rounded-md bg-white font-bold"
                            />
                          </div>
                        </div>

                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Changes auto-saved
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Ad Networks Guide */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                      Recommended Ad Networks For Anonymous Chat Sites
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="font-bold text-slate-900">1. Adsterra</div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Instant approval, high CPMs for chat/entertainment traffic, offers 728x90, 300x250, and native formats.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="font-bold text-slate-900">2. PropellerAds</div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Great global fill-rate, banner ads, and interstitial units that monetize worldwide traffic easily.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="font-bold text-slate-900">3. Google AdSense</div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Highest paying network. Requires domain ownership and adherence to content guidelines.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: USER MONITOR */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Broadcast Banner Tool */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span>Live Site Announcement Broadcast</span>
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type alert message to display to all online users..."
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        onClick={handleSaveAnnouncement}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                      >
                        Broadcast Now
                      </button>
                    </div>
                  </div>

                  {/* Active Users Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Active Connected Visitors
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Live real-time monitoring of all active sessions
                        </p>
                      </div>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {users.length} Online
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-[11px] uppercase font-bold">
                          <tr>
                            <th className="py-2.5 px-4">User</th>
                            <th className="py-2.5 px-3">Location</th>
                            <th className="py-2.5 px-3">Gender / Age</th>
                            <th className="py-2.5 px-3">Simulated IP</th>
                            <th className="py-2.5 px-3">Room</th>
                            <th className="py-2.5 px-3 text-right">Moderation Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                                <img
                                  src={u.avatar}
                                  alt={u.nickname}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                                />
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span>{u.nickname}</span>
                                    {u.isRealPeer && (
                                      <span className="text-[8px] font-black px-1 rounded bg-indigo-100 text-indigo-700">
                                        LIVE PEER
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ID: {u.id.substring(0, 10)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                <span className="mr-1">{u.flag}</span>
                                {u.country}
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                {u.gender} &bull; {u.age} y/o
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                                {u.ipAddress}
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                  #{u.currentRoom}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right space-x-1">
                                <button
                                  onClick={() => onMuteUser(u.id)}
                                  className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-[11px] transition-colors"
                                  title="Mute user for 5 minutes"
                                >
                                  Mute
                                </button>
                                <button
                                  onClick={() => onKickUser(u.id)}
                                  className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] transition-colors"
                                  title="Kick from room"
                                >
                                  Kick
                                </button>
                                <button
                                  onClick={() => onBanUser(u.id)}
                                  className="px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 font-semibold text-[11px] transition-colors"
                                  title="Ban user IP"
                                >
                                  Ban
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MODERATION & BANNED WORDS */}
              {activeTab === 'moderation' && (
                <div className="space-y-6">
                  {/* Reported Messages Queue */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          User Reports Queue
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Messages flagged by chat participants for harassment, spam, or abusive content
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {reports.filter((r) => r.status === 'pending').length} Pending
                      </span>
                    </div>

                    {reports.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        🎉 No active user reports. Community is clean and peaceful.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {reports.map((rep) => (
                          <div
                            key={rep.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-rose-700">
                                  Flagged user: {rep.senderName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  &bull; Reported by {rep.reportedBy}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 font-semibold text-[10px]">
                                  {rep.reason}
                                </span>
                              </div>
                              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 italic">
                                &ldquo;{rep.messageText}&rdquo;
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => onResolveReport(rep.id, 'dismiss')}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => onResolveReport(rep.id, 'ban')}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold"
                              >
                                Ban Offender
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Banned Words Engine */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Automated Word Filter (Anti-Spam & Anti-Abuse)
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Any message containing these words will be automatically censored to &ldquo;****&rdquo; in real-time.
                    </p>

                    <form onSubmit={handleAddBannedWord} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Add word or phrase to block..."
                        value={newBannedWord}
                        onChange={(e) => setNewBannedWord(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Word</span>
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-2">
                      {adminSettings.bannedWords.map((word) => (
                        <span
                          key={word}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                        >
                          <span>{word}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBannedWord(word)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: GITHUB HOSTING GUIDE (CORE USER REQUEST) */}
              {activeTab === 'github' && (
                <div className="space-y-6">
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-md">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                        🚀
                      </div>
                      <h3 className="font-extrabold text-base">
                        How to Host This Chat On GitHub Pages (100% Free)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Because this app was built with a pure client-side SPA architecture, it requires <strong>zero backend servers</strong> or database bills. Everything runs directly in the visitor&rsquo;s browser, with multi-tab peer synchronization and full ad script execution.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs text-slate-700">
                    <h4 className="font-bold text-sm text-slate-900">
                      Step-by-Step Deployment Instructions:
                    </h4>

                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-800 mb-1">
                          Step 1: Download or Push your code to GitHub
                        </div>
                        <p className="text-slate-600">
                          Export your code from the settings menu or initialize a new git repository:
                        </p>
                        <pre className="mt-2 p-2.5 bg-slate-900 text-sky-300 rounded font-mono text-[11px] overflow-x-auto">
{`git init
git add .
git commit -m "Initial Chat Nexu release"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main`}
                        </pre>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-800 mb-1">
                          Step 2: Enable GitHub Pages in Repository Settings
                        </div>
                        <p className="text-slate-600">
                          1. Go to your GitHub repository &rarr; <strong>Settings</strong> &rarr; <strong>Pages</strong>.<br />
                          2. Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong>.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-slate-800">
                            Step 3: Automated GitHub Actions Workflow File
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(githubWorkflowYaml);
                              setCopiedWorkflow(true);
                              setTimeout(() => setCopiedWorkflow(false), 2000);
                            }}
                            className="px-2 py-1 rounded bg-sky-100 text-sky-700 font-bold text-[11px] hover:bg-sky-200 flex items-center gap-1"
                          >
                            {copiedWorkflow ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy Workflow YAML
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-600 mb-2">
                          Create a file at <code className="bg-slate-200 px-1 rounded font-mono">.github/workflows/deploy.yml</code> in your repository:
                        </p>
                        <pre className="p-3 bg-slate-900 text-slate-200 rounded font-mono text-[10px] overflow-x-auto max-h-48">
                          {githubWorkflowYaml}
                        </pre>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                        <div className="font-bold mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Relative Path Compatibility
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          We have already configured <code className="font-mono bg-white px-1 rounded text-emerald-800">base: &apos;./&apos;</code> in your <code className="font-mono bg-white px-1 rounded text-emerald-800">vite.config.ts</code> file. This ensures that whether you host at a custom domain (e.g., <code className="font-mono">mychat.com</code>) or a subpath like <code className="font-mono">username.github.io/my-chat/</code>, all assets, styles, and ad scripts will load with zero errors.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Change Admin Password Modal (Authenticated Admin Only) */}
      {showChangePasswordModal && isAuthenticated && (
        <div
          id="admin-change-password-modal-overlay"
          className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center font-bold">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">Change Admin Password</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Logged In
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Active session for admin: <strong className="text-slate-800 font-mono font-bold">{adminSettings.adminUsername || 'admin'}</strong>
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 mb-4 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Authenticated Admin Access Only</strong>
                <span>You are verified as logged in. You can change your admin password below. The change takes effect immediately for all future logins.</span>
              </div>
            </div>

            {changePassStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-start gap-2 ${
                  changePassStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {changePassStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{changePassStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleChangeAdminPassword} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showChangePassCurrent ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={changePassCurrent}
                    onChange={(e) => setChangePassCurrent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 pr-9 bg-slate-50/50 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangePassCurrent(!showChangePassCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showChangePassCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showChangePassNew ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min. 4 characters)"
                    value={changePassNew}
                    onChange={(e) => setChangePassNew(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 pr-9 bg-slate-50/50 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangePassNew(!showChangePassNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showChangePassNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showChangePassConfirm ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={changePassConfirm}
                    onChange={(e) => setChangePassConfirm(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 pr-9 bg-slate-50/50 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangePassConfirm(!showChangePassConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showChangePassConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
