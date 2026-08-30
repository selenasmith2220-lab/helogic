import React, { useState } from 'react';
import {
  Terminal,
  Database,
  Cpu,
  Coins,
  LogOut,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  UserX,
  Layers,
  Lock,
  Unlock,
  Bug,
  Code,
  Skull,
  Send,
  Trash2,
  Copy,
  Check,
  Shield,
  Server,
  Activity,
  Zap,
} from 'lucide-react';

interface FakeAdminHoneypotDashboardProps {
  onExit: () => void;
  interceptedPayload: string;
}

interface DecoyUser {
  id: string;
  username: string;
  role: string;
  status: 'active' | 'banned' | 'quarantined';
  lastIp: string;
  messagesSent: number;
}

const INITIAL_DECOY_USERS: DecoyUser[] = [
  {
    id: 'usr_001',
    username: 'neo_anderson',
    role: 'Root Admin (Simulated)',
    status: 'active',
    lastIp: '10.0.0.42 (Virtual)',
    messagesSent: 420,
  },
  {
    id: 'usr_002',
    username: 'agent_smith',
    role: 'Security Bot',
    status: 'active',
    lastIp: '127.0.0.99 (Sandbox)',
    messagesSent: 1337,
  },
  {
    id: 'usr_003',
    username: 'hacker_zero',
    role: 'Script Tester',
    status: 'quarantined',
    lastIp: '198.51.100.14',
    messagesSent: 69,
  },
  {
    id: 'usr_004',
    username: 'alice_wonderland',
    role: 'Decoy User',
    status: 'active',
    lastIp: '172.16.0.5',
    messagesSent: 88,
  },
  {
    id: 'usr_005',
    username: 'cipher_99',
    role: 'Shadow Observer',
    status: 'banned',
    lastIp: '203.0.113.88',
    messagesSent: 12,
  },
];

export const FakeAdminHoneypotDashboard: React.FC<FakeAdminHoneypotDashboardProps> = ({
  onExit,
  interceptedPayload,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'overview' | 'users' | 'vault' | 'explain'>('terminal');
  const [sqlInput, setSqlInput] = useState("SELECT * FROM admin_credentials;");
  const [sqlHistory, setSqlHistory] = useState<
    Array<{
      query: string;
      time: string;
      type: 'table' | 'error' | 'message';
      columns?: string[];
      rows?: (string | number)[][];
      message?: string;
    }>
  >([
    {
      query: `-- INITIAL SYSTEM TELEMETRY`,
      time: new Date().toLocaleTimeString(),
      type: 'message',
      message: `[HONEYPOT INITIALIZED] Connection redirected to sandbox container. SQL injection tautology detected: "${interceptedPayload}". Mock PostgreSQL database initialized.`,
    },
    {
      query: 'SELECT * FROM admin_credentials;',
      time: new Date().toLocaleTimeString(),
      type: 'table',
      columns: ['id', 'username', 'password_hash', 'access_level', 'storage_engine'],
      rows: [
        ['1', 'admin_decoy', '$2a$12$N0tARe4lP4ssw0rdFakeHash1337Bait', 'full_superuser', 'sqlite_memory'],
        ['2', 'sys_root', '$2a$12$H0n3yp0tT4rg3tD3c0yAcc0unt404', 'kernel_admin', 'sqlite_memory'],
        ['3', 'decoy_agent', '$2a$12$S4ndb0xEmu14t10nK3y8842', 'read_all', 'sqlite_memory'],
      ],
    },
  ]);

  const [decoyUsers, setDecoyUsers] = useState<DecoyUser[]>(INITIAL_DECOY_USERS);
  const [userActionToast, setUserActionToast] = useState<string | null>(null);

  // Fake crypto withdrawal state
  const [withdrawAddress, setWithdrawAddress] = useState('0x71C...B42F');
  const [withdrawAmount, setWithdrawAmount] = useState('10.5');
  const [vaultNotice, setVaultNotice] = useState<string | null>(null);

  const [copiedPayload, setCopiedPayload] = useState(false);

  // Handle fake SQL execution
  const handleExecuteSql = (customQuery?: string) => {
    const queryToRun = (customQuery || sqlInput).trim();
    if (!queryToRun) return;

    const lower = queryToRun.toLowerCase();
    const timeStr = new Date().toLocaleTimeString();

    let newEntry: (typeof sqlHistory)[0];

    if (lower.startsWith('select * from admin_credentials') || lower.includes('from admin_credentials')) {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'table',
        columns: ['id', 'username', 'password_hash', 'access_level', 'storage_engine'],
        rows: [
          ['1', 'admin_decoy', '$2a$12$N0tARe4lP4ssw0rdFakeHash1337Bait', 'full_superuser', 'sqlite_memory'],
          ['2', 'sys_root', '$2a$12$H0n3yp0tT4rg3tD3c0yAcc0unt404', 'kernel_admin', 'sqlite_memory'],
          ['3', 'decoy_agent', '$2a$12$S4ndb0xEmu14t10nK3y8842', 'read_all', 'sqlite_memory'],
        ],
      };
    } else if (lower.startsWith('select * from users') || lower.includes('from users')) {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'table',
        columns: ['id', 'username', 'role', 'status', 'ip_address'],
        rows: decoyUsers.map((u) => [u.id, u.username, u.role, u.status, u.lastIp]),
      };
    } else if (lower.includes('secret') || lower.includes('token') || lower.includes('key')) {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'table',
        columns: ['key_id', 'service', 'mock_token', 'environment'],
        rows: [
          ['KEY_01', 'GEMINI_AI_API', 'AIzaSyFakeDecoyGeminiKey_SandboxHoneypot', 'virtual_testnet'],
          ['KEY_02', 'STRIPE_SECRET', 'sk_test_fakeDecoyHoneypotSecretKey9921', 'sandbox_only'],
          ['KEY_03', 'ROOT_JWT_SECRET', 'decoy-jwt-secret-honeypot-42069-matrix', 'emulated_cluster'],
        ],
      };
    } else if (lower.startsWith('drop') || lower.startsWith('delete') || lower.startsWith('truncate')) {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'error',
        message: `[HONEYPOT DEFENSE] Query blocked: Destructive command rejected by Honeypot WAF (sandbox is read-only). Real database remains unharmed. 🛡️`,
      };
    } else if (lower.includes('show tables') || lower === 'tables' || lower === '\\dt') {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'table',
        columns: ['table_name', 'engine', 'simulated_rows'],
        rows: [
          ['admin_credentials', 'HoneypotMemoryEngine', '3'],
          ['users_decoy', 'HoneypotMemoryEngine', '5'],
          ['api_secrets_vault', 'HoneypotMemoryEngine', '3'],
          ['chat_messages_virtual', 'HoneypotMemoryEngine', '13,370'],
          ['audit_telemetry_trap', 'HoneypotMemoryEngine', '42'],
        ],
      };
    } else if (lower.includes('whoami') || lower.includes('current_user')) {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'message',
        message: `CURRENT_USER: root@honeypot-sandbox-cluster-8842 (Privileges: Virtual Decoy Superuser)`,
      };
    } else if (lower.includes('help')) {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'message',
        message: `Available Decoy Commands:\n - SELECT * FROM admin_credentials;\n - SELECT * FROM users;\n - SELECT * FROM api_secrets_vault;\n - SHOW TABLES;\n - WHOAMI;\n - DROP TABLE messages; (Watch the WAF trap block it)`,
      };
    } else {
      newEntry = {
        query: queryToRun,
        time: timeStr,
        type: 'table',
        columns: ['simulated_col_1', 'simulated_col_2', 'status'],
        rows: [
          ['result_row_01', 'sample_val_A', 'MOCK_RECORD_SUCCESS'],
          ['result_row_02', 'sample_val_B', 'MOCK_RECORD_SUCCESS'],
        ],
      };
    }

    setSqlHistory((prev) => [newEntry, ...prev]);
  };

  const handleUserStatusChange = (userId: string, newStatus: DecoyUser['status']) => {
    setDecoyUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    const user = decoyUsers.find((u) => u.id === userId);
    setUserActionToast(`Simulated: User "${user?.username || userId}" set to ${newStatus.toUpperCase()} inside the sandbox.`);
    setTimeout(() => setUserActionToast(null), 4000);
  };

  const handleFakeWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setVaultNotice(
      `💸 Simulated payout of ${withdrawAmount} BTC broadcasted to Sandbox Testnet! TxHash: 0x9f4a...decoy_honeypot_tx. Real cryptocurrency reserves are safely offline.`
    );
    setTimeout(() => setVaultNotice(null), 7000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(interceptedPayload || "' OR '1'='1");
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-text">
      {/* Honeypot Alert Warning Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </div>
          <span className="font-mono text-amber-200">HONEYPOT DECOY SANDBOX ACTIVE</span>
          <span className="hidden sm:inline text-amber-400/70">&bull;</span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">
            SQL Injection payload intercepted: <code className="bg-black/60 px-2 py-0.5 rounded text-emerald-400 font-mono font-bold">{interceptedPayload || "' OR '1'='1"}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Exit sandbox and return to real login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Decoy & Return</span>
          </button>
        </div>
      </div>

      {/* Decoy Navigation Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>SQL Shell &amp; Database</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Server Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Decoy User Table</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'vault'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Virtual Crypto Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('explain')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'explain'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Honeypot Trap Inspector</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>MOCK_PG_CONNECTED: 127.0.0.1:5432</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* TAB 1: SQL TERMINAL & DATABASE */}
        {activeTab === 'terminal' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono text-sm font-bold text-slate-200">
                    Interactive SQL Query Console
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SQLite Memory Sandbox
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Execution Latency: <span className="text-emerald-400">1.4ms</span>
                </div>
              </div>

              {/* Shortcut buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
                <span className="text-slate-400 self-center mr-1 text-xs">Quick Queries:</span>
                {[
                  'SELECT * FROM admin_credentials;',
                  'SELECT * FROM users;',
                  'SELECT * FROM api_secrets_vault;',
                  'SHOW TABLES;',
                  'WHOAMI;',
                  'DROP TABLE chat_messages;',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setSqlInput(q);
                      handleExecuteSql(q);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 rounded font-mono transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* SQL Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteSql();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 font-mono text-emerald-500 select-none">&gt;</span>
                  <input
                    type="text"
                    value={sqlInput}
                    onChange={(e) => setSqlInput(e.target.value)}
                    placeholder="Enter SQL command (e.g. SELECT * FROM admin_credentials;)"
                    className="w-full bg-black/60 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute</span>
                </button>
              </form>
            </div>

            {/* Results Output Console */}
            <div className="bg-black/80 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Query Output Stream</span>
                </span>
                <button
                  onClick={() => setSqlHistory([])}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Clear Output
                </button>
              </div>

              {sqlHistory.map((item, idx) => (
                <div key={idx} className="space-y-2 pb-3 border-b border-slate-900 last:border-b-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-emerald-400 font-bold">&gt; {item.query}</span>
                    <span>{item.time}</span>
                  </div>

                  {item.type === 'table' && item.columns && item.rows && (
                    <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/70 p-2">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                            {item.columns.map((col, cIdx) => (
                              <th key={cIdx} className="py-1 px-2.5 font-bold uppercase tracking-wider">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-200">
                          {item.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/50">
                              {row.map((val, vIdx) => (
                                <td key={vIdx} className="py-1 px-2.5 font-mono text-emerald-300/90 whitespace-nowrap">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="text-[10px] text-slate-500 mt-1 px-2">
                        {item.rows.length} simulated rows returned in 1.4ms
                      </div>
                    </div>
                  )}

                  {item.type === 'error' && (
                    <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-xs">
                      {item.message}
                    </div>
                  )}

                  {item.type === 'message' && (
                    <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded text-slate-300 whitespace-pre-wrap">
                      {item.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW & TELEMETRY */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Simulated CPU Load</span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400">92.4%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[92%] animate-pulse" />
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Decoy Records</span>
                  <Database className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-mono font-black text-sky-400">1,337,420</div>
                <span className="text-[10px] text-slate-500 font-mono">SQLite In-Memory Virtual</span>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Decoy Vault</span>
                  <Coins className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-mono font-black text-yellow-400">$99,420,000</div>
                <span className="text-[10px] text-slate-500 font-mono">420.69 BTC Emulated</span>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Trap Vector</span>
                  <Bug className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm font-mono font-black text-amber-400 truncate">
                  {interceptedPayload || "' OR '1'='1"}
                </div>
                <span className="text-[10px] text-amber-500/80 font-mono">SQLi Tautology Caught</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>Synthetic Audit &amp; Event Stream</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  REAL-TIME EMULATION
                </span>
              </div>

              <div className="font-mono text-xs space-y-1.5 text-slate-300">
                <div className="text-emerald-400">
                  [02:15:20] INBOUND INJECTION DETECTED: Payload: "{interceptedPayload || "' OR '1'='1"}"
                </div>
                <div className="text-slate-400">
                  [02:15:21] FIREWALL ROUTE: Connection quarantined to virtual decoy sandbox #HN-9921
                </div>
                <div className="text-slate-400">
                  [02:15:21] SANDBOX: Initialized simulated shadow schema (5 virtual tables, 13,370 dummy logs)
                </div>
                <div className="text-amber-300">
                  [02:15:22] ACCESS GRANTED: Virtual root shell provisioned. (Host system isolation: 100%)
                </div>
                <div className="text-slate-400">
                  [02:15:23] HONEYPOT DAEMON: Keystrokes &amp; simulated queries recorded to honeypot telemetry.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DECOY USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {userActionToast && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{userActionToast}</span>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-mono text-sm font-bold text-slate-200">
                    Decoy User Management
                  </h4>
                  <p className="text-xs text-slate-400">
                    Simulated user accounts generated for the sandbox environment.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Showing {decoyUsers.length} simulated accounts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
                      <th className="py-2.5 px-4 font-bold">User</th>
                      <th className="py-2.5 px-4 font-bold">Role</th>
                      <th className="py-2.5 px-4 font-bold">Simulated IP</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {decoyUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-200">
                          {u.username}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            {u.id} &bull; {u.messagesSent} fake messages
                          </span>
                        </td>
                        <td className="py-3 px-4 text-emerald-400">{u.role}</td>
                        <td className="py-3 px-4 text-slate-400">{u.lastIp}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                : u.status === 'banned'
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                                : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {u.status !== 'banned' ? (
                            <button
                              onClick={() => handleUserStatusChange(u.id, 'banned')}
                              className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-[11px] transition-colors cursor-pointer"
                            >
                              Ban User
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserStatusChange(u.id, 'active')}
                              className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[11px] transition-colors cursor-pointer"
                            >
                              Unban User
                            </button>
                          )}
                          <button
                            onClick={() => handleUserStatusChange(u.id, 'quarantined')}
                            className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-[11px] transition-colors cursor-pointer"
                          >
                            Quarantine
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

        {/* TAB 4: VIRTUAL CRYPTO VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-slate-200">
                    Decoy Hot Wallet &amp; Treasury
                  </h4>
                  <p className="text-xs text-slate-400">
                    Simulated cryptographic assets generated for the honeypot container.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-black/60 rounded-xl border border-slate-800 font-mono">
                  <span className="text-xs text-slate-400">Simulated Bitcoin Balance</span>
                  <div className="text-2xl font-black text-yellow-400 mt-1">420.69 BTC</div>
                  <span className="text-[11px] text-slate-500">~$25,241,400.00 USD (Virtual)</span>
                </div>
                <div className="p-4 bg-black/60 rounded-xl border border-slate-800 font-mono">
                  <span className="text-xs text-slate-400">Simulated Ethereum Vault</span>
                  <div className="text-2xl font-black text-sky-400 mt-1">1,337.00 ETH</div>
                  <span className="text-[11px] text-slate-500">~$4,679,500.00 USD (Virtual)</span>
                </div>
              </div>

              {vaultNotice && (
                <div className="p-3 mb-4 rounded-lg bg-yellow-950/80 border border-yellow-500/50 text-yellow-300 text-xs font-mono">
                  {vaultNotice}
                </div>
              )}

              <form onSubmit={handleFakeWithdraw} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Destination Wallet Address (Testnet)
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Withdrawal Amount (BTC)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Simulated Withdrawal</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: HONEYPOT INSPECTOR & EXPLAINER */}
        {activeTab === 'explain' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-slate-200">
                    Why Did This Fake Dashboard Open?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cybersecurity Deception &amp; SQL Injection Honeypot Architecture
                  </p>
                </div>
              </div>

              <div className="p-4 bg-black/60 border border-purple-900/60 rounded-xl space-y-2 text-xs text-slate-300 leading-relaxed font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">INTERCEPTED ATTACK VECTOR:</span>
                  <button
                    onClick={handleCopyPayload}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
                  </button>
                </div>
                <code className="block bg-slate-950 p-2.5 rounded text-amber-300 border border-slate-800 text-xs">
                  {interceptedPayload || "' OR '1'='1"}
                </code>
                <p className="text-[11px] text-slate-400 pt-1">
                  This command or password is a classic <strong>SQL Injection Tautology attack</strong>. In vulnerable databases, appending <code className="text-amber-300">' OR '1'='1</code> turns a query condition like <code className="text-slate-400">WHERE password = '$input'</code> into <code className="text-slate-400">WHERE password = '' OR '1'='1'</code> (which evaluates to TRUE for all rows), attempting unauthorized authentication bypass.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <strong className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    How Our Defense Works
                  </strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Rather than leaking database stack traces or generic 401 errors that inform attackers, our system automatically routes injection payloads into this <strong>isolated Honeypot Decoy Sandbox</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <strong className="text-sky-400 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-sky-500" />
                    Real System Status
                  </strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The real database, user messages, and administrator credentials remain <strong>100% secure and untouched</strong>. A security audit log has been filed for the administrator.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Ready to return to the real login screen?
                </span>
                <button
                  onClick={onExit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Return to Real Admin Login</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
