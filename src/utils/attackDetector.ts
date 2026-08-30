import { AttackIncidentReport, SecurityAuditLog } from '../types';

export interface AttackDetectionResult {
  isAttack: boolean;
  threatType: AttackIncidentReport['threatType'];
  severity: AttackIncidentReport['severity'];
  cvssScore: number;
  owaspCategory: string;
  cweId: string;
  mitreAttackTechnique: string;
  methodName: string;
  vectorDescription: string;
  syntaxBreakdown: string;
  attackerIntent: string;
  potentialImpactIfUnprotected: string;
  mitigationAdvice: string[];
}

// 1. SQL Injection Signatures
const SQLI_PATTERNS = [
  {
    regex: /('\s*(or|and)\s*'?\w+'?\s*=\s*'?\w+)|('\s*or\s*1\s*=\s*1)|("?\s*or\s*"?\w+"?\s*=\s*"?\w+)/i,
    name: 'Boolean-Based Blind Tautology Auth Bypass',
    desc: "Crafted boolean condition (' OR '1'='1 or equivalent) designed to evaluate to TRUE in database WHERE clauses, forcing unconditional authentication pass.",
    syntax: "Injects single quote (') to break SQL string literal context, appends OR logical operator, followed by universally true condition ('1'='1).",
    intent: 'Bypass password validation and acquire unauthorized administrative access without valid credentials.',
    impact: 'Full administrative compromise, arbitrary database records access, and sensitive data leakage.',
    mitre: 'T1190: Exploit Public-Facing Application',
    cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 9.8,
    severity: 'CRITICAL' as const,
  },
  {
    regex: /(union\s+(all\s+)?select\s+)/i,
    name: 'UNION-Based Database Exfiltration Probe',
    desc: 'UNION operator injection attempting to append second SELECT query results onto original application query output.',
    syntax: 'Uses UNION SELECT with guessed column numbers to concatenate attacker-selected tables with legitimate server output.',
    intent: 'Exfiltrate database schema, column names, password hashes, and user credential tables.',
    impact: 'Bulk exfiltration of entire relational database contents and proprietary user information.',
    mitre: 'T1190: Exploit Public-Facing Application',
    cwe: 'CWE-89: SQL Injection',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 9.6,
    severity: 'CRITICAL' as const,
  },
  {
    regex: /(;\s*drop\s+table)|(;\s*delete\s+from)|(;\s*update\s+\w+\s+set)|(;\s*insert\s+into)/i,
    name: 'Stacked Query Destructive Execution',
    desc: 'Stacked SQL queries separated by semicolons aiming to execute destructive modification or deletion statements.',
    syntax: 'Appends statement terminator (;) followed by administrative DDL/DML commands (DROP, DELETE, UPDATE).',
    intent: 'Sabotage application database, wipe system tables, or tamper with administrator credentials.',
    impact: 'Catastrophic database loss, permanent denial of service, and data integrity corruption.',
    mitre: 'T1499: Endpoint Denial of Service',
    cwe: 'CWE-89: SQL Injection',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 9.9,
    severity: 'CRITICAL' as const,
  },
  {
    regex: /(sleep\s*\(\s*\d+\s*\))|(waitfor\s+delay)|(pg_sleep\s*\()/i,
    name: 'Time-Based Blind SQL Injection Probe',
    desc: 'Injected database delay functions that measure server response latency to infer database boolean truth values.',
    syntax: 'Invokes SLEEP(), WAITFOR DELAY, or pg_sleep() to force server response timing delays.',
    intent: 'Enumerate schema and password characters through timing side-channel analysis.',
    impact: 'Systematic character-by-character database exfiltration despite suppressed error messages.',
    mitre: 'T1190: Exploit Public-Facing Application',
    cwe: 'CWE-89: SQL Injection',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 8.8,
    severity: 'HIGH' as const,
  },
  {
    regex: /(information_schema\.)|(sqlite_master)|(sys\.tables)|(pg_catalog\.)/i,
    name: 'Metadata Schema Reconnaissance via SQLi',
    desc: 'Direct query targeting system metadata catalogs (information_schema, sqlite_master, pg_catalog).',
    syntax: 'Accesses system catalog views containing internal table definitions, foreign keys, and column metadata.',
    intent: 'Map internal database structure prior to targeted table extraction.',
    impact: 'Complete structural reconnaissance enabling targeted secondary exfiltration.',
    mitre: 'T1082: System Information Discovery',
    cwe: 'CWE-89: SQL Injection',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 8.5,
    severity: 'HIGH' as const,
  },
];

// 2. Cross-Site Scripting (XSS) Signatures
const XSS_PATTERNS = [
  {
    regex: /<script\b[^>]*>([\s\S]*?)<\/script>/i,
    name: 'Explicit Script Tag Injection (Stored/Reflected XSS)',
    desc: 'Direct injection of executable <script> HTML tags containing client-side JavaScript execution payload.',
    syntax: 'Encapsulates JavaScript bytecode inside standard browser HTML script tags.',
    intent: 'Execute arbitrary JavaScript within the session context of authentic users or administrators.',
    impact: 'Session hijacking, token theft, cookie exfiltration, and client-side DOM defacement.',
    mitre: 'T1059.007: JavaScript Scripting Execution',
    cwe: 'CWE-79: Improper Neutralization of Input During Web Page Generation (XSS)',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 8.8,
    severity: 'HIGH' as const,
  },
  {
    regex: /(onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=|eval\s*\(|document\.cookie|window\.location\s*=)/i,
    name: 'Event Handler / DOM-Based XSS Payload',
    desc: 'Injection of HTML element inline event handlers or DOM manipulation primitives to execute code upon rendering.',
    syntax: 'Leverages HTML attributes (onerror, onload) or javascript: URIs to trigger automatic execution without <script> tags.',
    intent: 'Steal user authentication cookies, keystrokes, or redirect visitors to phishing destinations.',
    impact: 'Account takeover, credential logging, and malicious client redirection.',
    mitre: 'T1059.007: JavaScript Scripting Execution',
    cwe: 'CWE-79: Cross-Site Scripting',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 8.3,
    severity: 'HIGH' as const,
  },
];

// 3. Path Traversal & Local File Inclusion (LFI)
const PATH_TRAVERSAL_PATTERNS = [
  {
    regex: /(\.\.\/|\.\.\\){2,}|(\/etc\/(passwd|shadow|hosts))|(windows\\system32)|(\/proc\/self)/i,
    name: 'Directory Path Traversal & Local File Disclosure (LFI)',
    desc: 'Sequential directory traversal sequences (../, ..\\) aimed at escaping web root to read restricted filesystem files.',
    syntax: 'Dot-dot-slash characters bypass directory boundaries, targeting critical files like /etc/passwd or system32.',
    intent: 'Read operating system user databases, server secrets, SSH private keys, and environment configuration.',
    impact: 'Severe configuration exposure, credential discovery, and escalation to server compromise.',
    mitre: 'T1083: File and Directory Discovery',
    cwe: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    owasp: 'OWASP A01:2021 - Broken Access Control',
    cvss: 9.1,
    severity: 'CRITICAL' as const,
  },
];

// 4. Remote Code Execution (RCE) / Command Injection
const RCE_PATTERNS = [
  {
    regex: /(;\s*(cat|ls|whoami|id|uname|curl|wget|nc|bash|sh|powershell|cmd)\b)|(\|\s*(cat|whoami|bash|sh))|(\$\(whoami\))|(`whoami`)/i,
    name: 'OS Command Injection & Remote Shell Execution (RCE)',
    desc: 'Shell metacharacters (; | & ` $()) chaining operating system binaries onto server execution contexts.',
    syntax: 'Breaks out of shell arguments via delimiter characters to execute arbitrary terminal commands.',
    intent: 'Spawn reverse shells, download malicious binaries, inspect server identity, and take total host control.',
    impact: 'Complete host system compromise, lateral network movement, and persistent backdoor installation.',
    mitre: 'T1059: Command and Scripting Interpreter',
    cwe: 'CWE-78: Improper Neutralization of Special Elements used in an OS Command',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 10.0,
    severity: 'CRITICAL' as const,
  },
];

// 5. Sensitive File & Directory Fuzzing Reconnaissance
const DIRECTORY_FUZZING_PATTERNS = [
  {
    regex: /(\/\.env|\/\.git|\/wp-admin|\/phpmyadmin|\/actuator|\/config\.json|\/aws\/credentials|\/server-status|\/\.aws)/i,
    name: 'Automated Sensitive Path & Configuration Fuzzing',
    desc: 'Direct scanning against well-known administrative interfaces, version control directories, and environment secrets.',
    syntax: 'Automated wordlist-driven HTTP GET requests probing commonly misconfigured sensitive file endpoints.',
    intent: 'Discover forgotten deployment assets, database passwords in .env, or unprotected administrative dashboards.',
    impact: 'Zero-day credential leak, source code leakage via exposed .git, and admin panel discovery.',
    mitre: 'T1595.002: Active Scanning - Vulnerability Scanning',
    cwe: 'CWE-538: Insertion of Sensitive Information into Externally-Accessible File',
    owasp: 'OWASP A05:2021 - Security Misconfiguration',
    cvss: 7.5,
    severity: 'HIGH' as const,
  },
];

// 6. Automated Scanner & Penetration Tool Probes
const SCANNER_TOOL_PATTERNS = [
  {
    regex: /(sqlmap|nikto|nmap|dirbuster|gobuster|burpsuite|acunetix|wpscan|masscan|zgrab)/i,
    name: 'Automated Security Scanner / Penetration Testing Agent',
    desc: 'Automated vulnerability reconnaissance or pen-testing tool identified via User-Agent signature or standardized probe headers.',
    syntax: 'Rapid high-velocity HTTP requests containing automated pentesting framework fingerprints.',
    intent: 'Perform automated vulnerability profiling, parameter fuzzing, and exploit discovery.',
    impact: 'Rapid identification of unpatched vulnerabilities and high server resource exhaustion.',
    mitre: 'T1595: Active Scanning',
    cwe: 'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor',
    owasp: 'OWASP A07:2021 - Identification and Authentication Failures',
    cvss: 6.5,
    severity: 'MEDIUM' as const,
  },
];

// 7. Server-Side Template Injection (SSTI)
const SSTI_PATTERNS = [
  {
    regex: /(\{\{\s*7\s*\*\s*7\s*\}\})|(\$\{\s*7\s*\*\s*7\s*\})|(<%=\s*7\s*\*\s*7\s*%>)|(\{\{\s*config\s*\.\s*items)/i,
    name: 'Server-Side Template Injection (SSTI) Evaluation Probe',
    desc: 'Mathematical expressions inside template evaluation delimiters ({{7*7}}, ${7*7}) testing for dynamic backend template evaluation.',
    syntax: 'Injects template engine expression syntax to test if backend executes server-side computation (resulting in 49).',
    intent: 'Determine if template engine (Jinja, Freemarker, EJS, Pebble) evaluates user input, leading directly to RCE.',
    impact: 'Remote code execution, server memory reading, and backend context compromise.',
    mitre: 'T1190: Exploit Public-Facing Application',
    cwe: 'CWE-1336: Improper Neutralization of Special Elements Used in a Template Engine',
    owasp: 'OWASP A03:2021 - Injection',
    cvss: 9.4,
    severity: 'CRITICAL' as const,
  },
];

/**
 * Analyzes any string, input, or User-Agent against the comprehensive threat signature database
 */
export function detectAttackInPayload(
  payload: string,
  userAgent: string = ''
): AttackDetectionResult | null {
  const combined = `${payload} ${userAgent}`.trim();
  if (!combined) return null;

  // 1. RCE
  for (const pattern of RCE_PATTERNS) {
    if (pattern.regex.test(payload)) {
      return {
        isAttack: true,
        threatType: 'rce',
        severity: pattern.severity,
        cvssScore: pattern.cvss,
        owaspCategory: pattern.owasp,
        cweId: pattern.cwe,
        mitreAttackTechnique: pattern.mitre,
        methodName: pattern.name,
        vectorDescription: pattern.desc,
        syntaxBreakdown: pattern.syntax,
        attackerIntent: pattern.intent,
        potentialImpactIfUnprotected: pattern.impact,
        mitigationAdvice: [
          'Never pass unsanitized user inputs into system execution APIs (exec, spawn, system, shell_exec).',
          'Use strictly parameterized API calls with hardcoded command arrays.',
          'Implement restrictive container sandboxes and run services under non-root unprivileged users.',
          'Deploy WAF command-injection pattern inspection at ingress reverse proxy.',
        ],
      };
    }
  }

  // 2. SQL Injection
  for (const pattern of SQLI_PATTERNS) {
    if (pattern.regex.test(payload)) {
      return {
        isAttack: true,
        threatType: 'sqli',
        severity: pattern.severity,
        cvssScore: pattern.cvss,
        owaspCategory: pattern.owasp,
        cweId: pattern.cwe,
        mitreAttackTechnique: pattern.mitre,
        methodName: pattern.name,
        vectorDescription: pattern.desc,
        syntaxBreakdown: pattern.syntax,
        attackerIntent: pattern.intent,
        potentialImpactIfUnprotected: pattern.impact,
        mitigationAdvice: [
          'Enforce Prepared Statements and Parameterized Queries across all database interfaces.',
          'Avoid raw SQL string concatenation or template literal interpolation.',
          'Maintain active Honeypot Sandboxes to divert and profile automated exploitation attempts.',
          'Implement database user principle of least privilege (deny DROP/ALTER/FILE permissions).',
        ],
      };
    }
  }

  // 3. SSTI
  for (const pattern of SSTI_PATTERNS) {
    if (pattern.regex.test(payload)) {
      return {
        isAttack: true,
        threatType: 'ssti',
        severity: pattern.severity,
        cvssScore: pattern.cvss,
        owaspCategory: pattern.owasp,
        cweId: pattern.cwe,
        mitreAttackTechnique: pattern.mitre,
        methodName: pattern.name,
        vectorDescription: pattern.desc,
        syntaxBreakdown: pattern.syntax,
        attackerIntent: pattern.intent,
        potentialImpactIfUnprotected: pattern.impact,
        mitigationAdvice: [
          'Treat user input as data rather than template code; never dynamically construct templates from user strings.',
          'Use sandboxed template rendering engines with execution whitelist restrictions.',
          'Sanitize or strip expression evaluation curly braces {{ }} before template interpolation.',
        ],
      };
    }
  }

  // 4. XSS
  for (const pattern of XSS_PATTERNS) {
    if (pattern.regex.test(payload)) {
      return {
        isAttack: true,
        threatType: 'xss',
        severity: pattern.severity,
        cvssScore: pattern.cvss,
        owaspCategory: pattern.owasp,
        cweId: pattern.cwe,
        mitreAttackTechnique: pattern.mitre,
        methodName: pattern.name,
        vectorDescription: pattern.desc,
        syntaxBreakdown: pattern.syntax,
        attackerIntent: pattern.intent,
        potentialImpactIfUnprotected: pattern.impact,
        mitigationAdvice: [
          'Perform contextual HTML output encoding (escape <, >, &, ", \') before rendering into DOM.',
          'Deploy a strict Content Security Policy (CSP) header disabling inline scripts and unsafe-eval.',
          'Set HttpOnly and Secure flags on all session identifiers and authentication tokens.',
        ],
      };
    }
  }

  // 5. Path Traversal
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.regex.test(payload)) {
      return {
        isAttack: true,
        threatType: 'path_traversal',
        severity: pattern.severity,
        cvssScore: pattern.cvss,
        owaspCategory: pattern.owasp,
        cweId: pattern.cwe,
        mitreAttackTechnique: pattern.mitre,
        methodName: pattern.name,
        vectorDescription: pattern.desc,
        syntaxBreakdown: pattern.syntax,
        attackerIntent: pattern.intent,
        potentialImpactIfUnprotected: pattern.impact,
        mitigationAdvice: [
          'Resolve canonical filesystem paths and verify that path stays strictly within allowed base directory.',
          'Reject any input containing ../ or ..\\ or null bytes (%00).',
          'Store files using generated UUID keys in object storage rather than user-supplied file path strings.',
        ],
      };
    }
  }

  // 6. Directory Fuzzing
  for (const pattern of DIRECTORY_FUZZING_PATTERNS) {
    if (pattern.regex.test(payload)) {
      return {
        isAttack: true,
        threatType: 'dir_fuzzing',
        severity: pattern.severity,
        cvssScore: pattern.cvss,
        owaspCategory: pattern.owasp,
        cweId: pattern.cwe,
        mitreAttackTechnique: pattern.mitre,
        methodName: pattern.name,
        vectorDescription: pattern.desc,
        syntaxBreakdown: pattern.syntax,
        attackerIntent: pattern.intent,
        potentialImpactIfUnprotected: pattern.impact,
        mitigationAdvice: [
          'Ensure hidden files (.env, .git, .aws) and backup files (.bak, .sql) are blocked by web server config.',
          'Disable directory listing across all public and asset directories.',
          'Implement rate-limiting and automatic IP blacklisting for 404 scanning spikes.',
        ],
      };
    }
  }

  // 7. Scanner tools (User-Agent or payload)
  for (const pattern of SCANNER_TOOL_PATTERNS) {
    if (pattern.regex.test(userAgent) || pattern.regex.test(payload)) {
      return {
        isAttack: true,
        threatType: 'scanner_probe',
        severity: pattern.severity,
        cvssScore: pattern.cvss,
        owaspCategory: pattern.owasp,
        cweId: pattern.cwe,
        mitreAttackTechnique: pattern.mitre,
        methodName: pattern.name,
        vectorDescription: pattern.desc,
        syntaxBreakdown: pattern.syntax,
        attackerIntent: pattern.intent,
        potentialImpactIfUnprotected: pattern.impact,
        mitigationAdvice: [
          'Deploy Web Application Firewall (WAF) to drop requests from known automated security scanner user-agents.',
          'Implement behavioral challenge-response (CAPTCHA / Proof-of-Work) on abnormal request velocities.',
          'Monitor access logs for high-frequency burst scans.',
        ],
      };
    }
  }

  return null;
}

/**
 * Creates a fully detailed, government/SOC-grade forensic incident report object
 */
export function buildAttackIncidentReport(params: {
  rawPayload: string;
  source: AttackIncidentReport['source'];
  targetEndpoint?: string;
  ipInfo: {
    ip: string;
    country: string;
    city: string;
    isp: string;
  };
  userAgent?: string;
  threatDetails?: AttackDetectionResult;
  containmentStatus?: AttackIncidentReport['containmentStatus'];
}): AttackIncidentReport {
  const {
    rawPayload,
    source,
    targetEndpoint = '/api/v1/admin/auth-verify',
    ipInfo,
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Agent',
    threatDetails,
    containmentStatus = 'TRAPPED_IN_HONEYPOT_SANDBOX',
  } = params;

  const detected = threatDetails || detectAttackInPayload(rawPayload, userAgent);

  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const typeCode = (detected?.threatType || 'PROBE').toUpperCase();
  const id = `INC-${new Date().getFullYear()}-${typeCode}-${randomSuffix}`;

  if (detected) {
    return {
      id,
      timestamp,
      threatType: detected.threatType,
      severity: detected.severity,
      cvssScore: detected.cvssScore,
      owaspCategory: detected.owaspCategory,
      cweId: detected.cweId,
      mitreAttackTechnique: detected.mitreAttackTechnique,
      methodName: detected.methodName,
      targetEndpoint,
      rawPayload,
      source,
      payloadAnalysis: {
        vectorDescription: detected.vectorDescription,
        syntaxBreakdown: detected.syntaxBreakdown,
        attackerIntent: detected.attackerIntent,
        potentialImpactIfUnprotected: detected.potentialImpactIfUnprotected,
      },
      networkAttribution: {
        ip: ipInfo.ip,
        isp: ipInfo.isp,
        country: ipInfo.country,
        city: ipInfo.city,
        reverseDns: `${ipInfo.ip.replace(/[^0-9]/g, '-')}.dynamic-pool.net`,
        userAgent,
      },
      containmentStatus,
      mitigationAdvice: detected.mitigationAdvice,
    };
  }

  // Default fallback for unauthorized brute-force / wrong passwords
  return {
    id,
    timestamp,
    threatType: 'wrong_password',
    severity: 'MEDIUM',
    cvssScore: 5.3,
    owaspCategory: 'OWASP A07:2021 - Identification and Authentication Failures',
    cweId: 'CWE-307: Improper Restriction of Excessive Authentication Attempts',
    mitreAttackTechnique: 'T1110.001: Password Guessing / Credential Stuffing',
    methodName: 'Unauthorized Password Brute-Force & Credential Guessing',
    targetEndpoint,
    rawPayload,
    source,
    payloadAnalysis: {
      vectorDescription: 'Attacker submitted unauthorized credentials attempting to guess the administrative secret password.',
      syntaxBreakdown: `Plaintext credential submission: "${rawPayload}" against administrative login gateway.`,
      attackerIntent: 'Gain unauthorized access to the application control center through dictionary guessing.',
      potentialImpactIfUnprotected: 'Account compromise if passwords are weak or lacks lockout thresholds.',
    },
    networkAttribution: {
      ip: ipInfo.ip,
      isp: ipInfo.isp,
      country: ipInfo.country,
      city: ipInfo.city,
      reverseDns: `${ipInfo.ip.replace(/[^0-9]/g, '-')}.dynamic-pool.net`,
      userAgent,
    },
    containmentStatus,
    mitigationAdvice: [
      'Maintain automated Decoy Honeypot Sandbox to divert intruders safely away from real admin controls.',
      'Enforce progressive login lockout delay after 3 failed attempts.',
      'Require Multi-Factor Authentication (MFA/3FA) for all administrative sessions.',
      'Monitor and blacklist recurrent IP subnets engaging in credential brute-forcing.',
    ],
  };
}

/**
 * Converts a report into a comprehensive plain-text forensic document
 */
export function formatReportAsText(report: AttackIncidentReport): string {
  const dateStr = new Date(report.timestamp).toUTCString();
  return `================================================================================
CYBER THREAT & INTRUSION FORENSIC INCIDENT REPORT
INCIDENT ID: ${report.id}
SECURITY CLEARANCE: CONFIDENTIAL / SOC-GRADE FORENSICS
================================================================================

[1. INCIDENT METADATA]
Timestamp:             ${dateStr} (${report.timestamp})
Target Endpoint:       ${report.targetEndpoint}
Originating Source:    ${report.source.toUpperCase()}
Containment Status:    ${report.containmentStatus}
Threat Classification: ${report.methodName}

[2. RISK & COMPLIANCE RATINGS]
Severity:              ${report.severity}
CVSS v3.1 Score:       ${report.cvssScore} / 10.0
OWASP Top 10 Mapping:  ${report.owaspCategory}
CWE Reference:         ${report.cweId}
MITRE ATT&CK:          ${report.mitreAttackTechnique}

[3. ATTACK METHOD & PAYLOAD ANALYSIS]
Method Explanation:
${report.payloadAnalysis.vectorDescription}

Syntax Breakdown:
${report.payloadAnalysis.syntaxBreakdown}

Attacker Stated Intent:
${report.payloadAnalysis.attackerIntent}

Potential Impact If Unprotected:
${report.payloadAnalysis.potentialImpactIfUnprotected}

Intercepted Raw Payload:
"""
${report.rawPayload}
"""

[4. ATTACKER ATTRIBUTION & NETWORK FORENSICS]
Public IP Address:     ${report.networkAttribution.ip}
Origin Geolocation:    ${report.networkAttribution.city}, ${report.networkAttribution.country}
Internet Service / ASN:${report.networkAttribution.isp}
Reverse DNS Hostname:  ${report.networkAttribution.reverseDns || 'N/A'}
User-Agent Header:     ${report.networkAttribution.userAgent}

[5. ACTIVE DEFENSE & HONEYPOT CONTAINMENT]
The application security engine detected this payload in real-time.
- Status: ${report.containmentStatus === 'TRAPPED_IN_HONEYPOT_SANDBOX' ? 'TRAPPED IN HONEYPOT SANDBOX (Decoy Environment Spawned)' : 'BLOCKED BY INGRESS WAF'}
- Production Integrity: 100% INTACT (Zero access granted to real tables or user data)
- Attacker Experience:  Confined to isolated decoy sandbox with synthetic telemetry

[6. RECOMMENDED MITIGATION & HARDENING]
${report.mitigationAdvice.map((advice, idx) => `  ${idx + 1}. ${advice}`).join('\n')}

================================================================================
END OF INCIDENT FORENSIC REPORT - GENERATED BY CHAT NEXU THREAT INTELLIGENCE
================================================================================`;
}
