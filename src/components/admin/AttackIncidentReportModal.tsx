import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Terminal,
  Globe,
  Server,
  AlertTriangle,
  FileText,
  Lock,
  ExternalLink,
  Ban,
  Radio,
  Zap,
} from 'lucide-react';
import { AttackIncidentReport } from '../../types';
import { formatReportAsText } from '../../utils/attackDetector';

interface AttackIncidentReportModalProps {
  report: AttackIncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
  onBanIp?: (ip: string) => void;
  isBanned?: boolean;
}

export const AttackIncidentReportModal: React.FC<AttackIncidentReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onBanIp,
  isBanned = false,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyReport = () => {
    const text = formatReportAsText(report);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(report.rawPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = formatReportAsText(report);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}_Forensic_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: AttackIncidentReport['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/90 text-rose-300 border-rose-700/80',
          dot: 'bg-rose-500 animate-pulse',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-950/90 text-amber-300 border-amber-700/80',
          dot: 'bg-amber-500',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-sky-950/90 text-sky-300 border-sky-700/80',
          dot: 'bg-sky-500',
        };
      default:
        return {
          bg: 'bg-slate-900 text-slate-300 border-slate-700',
          dot: 'bg-slate-500',
        };
    }
  };

  const badgeStyle = getSeverityBadge(report.severity);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-rose-400 font-bold tracking-wider">
                  {report.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeStyle.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                  {report.severity} &bull; CVSS {report.cvssScore}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-700">
                  {report.source.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                {report.methodName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadReport}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
              title="Download full forensic report (.txt)"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
              title="Copy forensic report text"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-white transition-colors border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                OWASP Category
              </span>
              <span className="text-xs font-mono font-bold text-rose-300 mt-1 block truncate">
                {report.owaspCategory}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                CWE Reference
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 mt-1 block truncate">
                {report.cweId}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                MITRE ATT&amp;CK
              </span>
              <span className="text-xs font-mono font-bold text-purple-300 mt-1 block truncate">
                {report.mitreAttackTechnique}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Containment Status
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{report.containmentStatus}</span>
              </span>
            </div>
          </div>

          {/* Section: Attack Method Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Attack Method &amp; Mechanism Breakdown</span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">
                  How the Attack Works (Methodology):
                </span>
                <p className="text-slate-200 mt-0.5 text-xs">
                  {report.payloadAnalysis.vectorDescription}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">
                  Payload Syntax Dissection:
                </span>
                <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-1">
                  {report.payloadAnalysis.syntaxBreakdown}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                  <span className="text-[11px] font-bold text-rose-300 block">
                    🎯 Attacker Objective:
                  </span>
                  <p className="text-[11px] text-rose-200/90 mt-0.5">
                    {report.payloadAnalysis.attackerIntent}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    ⚠️ Impact If Unprotected:
                  </span>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    {report.payloadAnalysis.potentialImpactIfUnprotected}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Intercepted Raw Payload */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Intercepted Raw Request Payload</span>
              </div>
              <button
                onClick={handleCopyPayload}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors border border-slate-700"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-300" />
                    <span>Copy Payload</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-black/90 p-3.5 rounded-lg border border-slate-800 font-mono text-emerald-300 text-xs break-all overflow-x-auto select-all">
              {report.rawPayload || '(Empty probe)'}
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Target Endpoint: <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded font-mono">{report.targetEndpoint}</code></span>
              <span>Timestamp: {new Date(report.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Section: Attacker Network Attribution */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Attacker Network Attribution &amp; Geolocation</span>
              </div>
              {onBanIp && (
                <button
                  onClick={() => onBanIp(report.networkAttribution.ip)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    isBanned
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isBanned ? 'IP Is Banned' : `Ban IP (${report.networkAttribution.ip})`}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Public IP Address
                </span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                  {report.networkAttribution.ip}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Geolocation Origin
                </span>
                <span className="text-xs font-bold text-white mt-0.5 block">
                  {report.networkAttribution.city ? `${report.networkAttribution.city}, ` : ''}
                  {report.networkAttribution.country || 'Unknown'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Autonomous System / ISP
                </span>
                <span className="text-xs font-bold text-white mt-0.5 block truncate">
                  {report.networkAttribution.isp || 'Commercial Broadband Provider'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Client User-Agent Fingerprint
              </span>
              <span className="text-[11px] font-mono text-slate-300 break-all mt-0.5 block">
                {report.networkAttribution.userAgent}
              </span>
            </div>
          </div>

          {/* Section: Honeypot & Containment Report */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/50 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Decoy Honeypot &amp; Sandbox Containment Telemetry</span>
            </div>
            <p className="text-[11px] text-purple-200/90 leading-relaxed">
              When this payload was received, Chat Nexu's <strong>Intrusion Isolation Layer</strong> automatically trapped the connection. Instead of executing against the production database, the attacker was diverted into an isolated synthetic honeypot sandbox with fake SQL terminal telemetry and dummy user records. Real database contents and active sessions remained 100% untouched.
            </p>
          </div>

          {/* Section: Recommended Remediation */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommended Defense Hardening &amp; Remediation</span>
            </div>
            <ul className="space-y-1.5 mt-2">
              {report.mitigationAdvice.map((advice, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            SOC Incident Report &bull; Chat Nexu Cyber Intelligence
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Full Report</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export .TXT File</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
