import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Flame,
  Globe2,
  Terminal,
  Clock,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminSettings, SecurityAuditLog } from '../../types';

interface AdminSecurityTabProps {
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({
  adminSettings,
  onUpdateAdminSettings,
}) => {
  // Credentials state
  const [adminUsernameInput, setAdminUsernameInput] = useState(adminSettings.adminUsername || 'admin');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 3FA state
  const [factorTwoPinInput, setFactorTwoPinInput] = useState(adminSettings.factorTwoSecretPin || '849201');
  const [factorThreeKeyInput, setFactorThreeKeyInput] = useState(adminSettings.factorThreeRecoveryKey || 'NX-SEC-9281-7462');
  const [threeFaSuccessMsg, setThreeFaSuccessMsg] = useState<string | null>(null);

  // Secret token state
  const [secretTokenInput, setSecretTokenInput] = useState(adminSettings.adminSecretToken || 'portal');
  const [copiedLink, setCopiedLink] = useState(false);
  const [tokenSuccessMsg, setTokenSuccessMsg] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chatnexu.com';
  const specialAdminLink = `${baseUrl}/?admin=${adminSettings.adminSecretToken || 'portal'}`;

  // Copy Special Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(specialAdminLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Change Admin Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg(null);

    if (currentPasswordInput !== adminSettings.adminPassword) {
      setPasswordStatusMsg({ type: 'error', text: 'Current password is incorrect. Please enter your active admin password.' });
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setPasswordStatusMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordStatusMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    const cleanUsername = adminUsernameInput.trim() || adminSettings.adminUsername || 'admin';

    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      ip: '127.0.0.1 (Authenticated Admin Session)',
      eventType: 'password_changed',
      factorReached: 3,
      detail: `Admin master password changed while logged in. Active user: "${cleanUsername}".`,
    };

    const updated: AdminSettings = {
      ...adminSettings,
      adminUsername: cleanUsername,
      adminPassword: newPasswordInput,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    };

    onUpdateAdminSettings(updated);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordStatusMsg({ type: 'success', text: 'Master admin password has been changed successfully! Your new password is now active.' });
  };

  // Save 3FA Settings
  const handleSave3FA = () => {
    const cleanPin = factorTwoPinInput.trim() || '849201';
    const cleanKey = factorThreeKeyInput.trim() || 'NX-SEC-9281-7462';

    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      ip: '127.0.0.1 (Admin Session)',
      eventType: '3fa_updated',
      factorReached: 3,
      detail: '3-Factor Authentication parameters refreshed and synced.',
    };

    const updated: AdminSettings = {
      ...adminSettings,
      factorTwoSecretPin: cleanPin,
      factorThreeRecoveryKey: cleanKey,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    };

    onUpdateAdminSettings(updated);
    setThreeFaSuccessMsg('3-Factor Authentication credentials saved!');
    setTimeout(() => setThreeFaSuccessMsg(null), 3500);
  };

  // Generate random 16-character recovery key
  const handleRegenerateKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    const generated = `NX-SEC-${p1}-${p2}`;
    setFactorThreeKeyInput(generated);
  };

  // Generate random 6-digit PIN
  const handleRegeneratePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setFactorTwoPinInput(pin);
  };

  // Save Custom Secret Token for Link
  const handleSaveSecretToken = () => {
    const clean = secretTokenInput.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'portal';
    setSecretTokenInput(clean);

    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now(),
      timestamp: Date.now(),
      ip: '127.0.0.1 (Admin Session)',
      eventType: 'secret_token_updated',
      factorReached: 3,
      detail: `Secret admin access token updated to: ${clean}`,
    };

    const updated: AdminSettings = {
      ...adminSettings,
      adminSecretToken: clean,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    };

    onUpdateAdminSettings(updated);
    setTokenSuccessMsg(`Special link updated! Use: /?admin=${clean}`);
    setTimeout(() => setTokenSuccessMsg(null), 3500);
  };

  // Reset Lockout
  const handleResetLockout = () => {
    const updated: AdminSettings = {
      ...adminSettings,
      failedLoginAttempts: 0,
      lockoutUntil: 0,
    };
    onUpdateAdminSettings(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Hidden Admin & Special Link Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cyber Attack Defense &bull; Stealth Mode Active</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              <span>Secret Admin Link & Access Portal</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              The Admin Dashboard button has been <strong className="text-white">completely removed from all public pages</strong>. Normal visitors cannot see or detect this portal. Bookmark or copy your special link below.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer transform hover:scale-[1.02]"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Special Admin Link'}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              Or shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-200">Ctrl + Shift + A</kbd>
            </span>
          </div>
        </div>

        {/* Special URL Display & Custom Token Editor */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-sky-300 truncate">
            {specialAdminLink}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">URL Token:</span>
            <input
              type="text"
              value={secretTokenInput}
              onChange={(e) => setSecretTokenInput(e.target.value)}
              placeholder="e.g. portal"
              className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <button
              onClick={handleSaveSecretToken}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-colors cursor-pointer"
            >
              Update
            </button>
          </div>
        </div>
        {tokenSuccessMsg && (
          <p className="text-[11px] text-emerald-400 font-bold mt-2 animate-in fade-in">
            ✓ {tokenSuccessMsg}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Change Master Admin Password */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  Change Master Admin Password
                </h4>
                <p className="text-xs text-slate-400">
                  Logged in as <span className="font-mono text-slate-700 font-bold">{adminSettings.adminUsername || 'admin'}</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Authenticated Session
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 mb-3.5 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Session Security Rule</strong>
              <span>Admin passwords can only be changed when you are logged into this dashboard.</span>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            {passwordStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passwordStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {passwordStatusMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordStatusMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                placeholder="admin"
                value={adminUsernameInput}
                onChange={(e) => setAdminUsernameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Admin Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/40"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Admin Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Enter new custom password (min. 4 characters)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/40"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Update Admin Password
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: 3-Factor Authentication (3FA) Setup */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  3-Factor Authentication (3FA)
                </h4>
                <p className="text-xs text-slate-400">
                  Military-grade protection against brute-force attacks
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {threeFaSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{threeFaSuccessMsg}</span>
              </div>
            )}

            {/* Factor 1 Note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                1
              </span>
              <div>
                <span className="font-bold text-slate-800 block">Factor 1: Master Admin Password</span>
                <span className="text-slate-500 text-[11px]">Your secret password required upon portal entrance.</span>
              </div>
            </div>

            {/* Factor 2: 6-Digit Authenticator PIN */}
            <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <span className="font-bold text-slate-800">Factor 2: 6-Digit Security Authenticator PIN</span>
                </div>
                <button
                  type="button"
                  onClick={handleRegeneratePin}
                  className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={factorTwoPinInput}
                onChange={(e) => setFactorTwoPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 font-mono text-center tracking-widest text-base font-extrabold text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Required as the second verification step during login.
              </span>
            </div>

            {/* Factor 3: Emergency Recovery Key */}
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <span className="font-bold text-slate-800">Factor 3: Emergency Cryptographic Key</span>
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Key</span>
                </button>
              </div>
              <input
                type="text"
                value={factorThreeKeyInput}
                onChange={(e) => setFactorThreeKeyInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 font-mono text-center tracking-wider text-xs font-extrabold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Final security challenge barrier before administrative access is authorized.
              </span>
            </div>

            <button
              onClick={handleSave3FA}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Save 3FA Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Cyber-Attack Shield & Audit Logs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">
                Cyber Attack Shield &amp; Intrusion Defense Log
              </h4>
              <p className="text-xs text-slate-400">
                Auto-lockout triggers after 3 consecutive failed attempts &bull; IP rate limiting active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>Honeypot Trap Armed</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shield Active</span>
            </div>
            {adminSettings.failedLoginAttempts > 0 && (
              <button
                onClick={handleResetLockout}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Reset Failed ({adminSettings.failedLoginAttempts})
              </button>
            )}
          </div>
        </div>

        {/* Honeypot Explainer Banner */}
        <div className="mx-5 mb-4 p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs flex items-start gap-3 text-purple-950">
          <div className="p-1.5 rounded-lg bg-purple-200 text-purple-800 shrink-0 mt-0.5">
            🪤
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-purple-900">Stealth Honeypot &amp; Attacker IP Interceptor Active:</span>
              <span className="text-[10px] bg-purple-200/70 text-purple-800 font-mono px-2 py-0.5 rounded-full font-bold">
                Bypass Trapper v4.0
              </span>
            </div>
            <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
              Any unauthorized access probe — including wrong passwords, brute-force attempts, and SQL injection commands (<code className="bg-white/80 px-1 py-0.5 rounded text-purple-950 font-bold font-mono text-[10px]">' OR '1'='1</code>) — is silently diverted into the isolated <strong>Decoy Sandbox Dashboard</strong>. The attacker's real public IP, ISP, geolocation, and keystrokes are recorded in the <strong>Attacker IPs &amp; Radar</strong> tab.
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Factor Reached</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(!adminSettings.auditLogs || adminSettings.auditLogs.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    No security events recorded yet.
                  </td>
                </tr>
              ) : (
                adminSettings.auditLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          log.eventType === 'login_success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.eventType === 'suspicious_activity'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : log.eventType === 'cyber_attack_blocked' || log.eventType === 'login_failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {log.eventType === 'suspicious_activity' ? '🪤 HONEYPOT TRAP' : log.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{log.ip}</td>
                    <td className="py-2.5 px-3 font-bold">
                      Factor {log.factorReached}/3
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} &bull; {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{log.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
