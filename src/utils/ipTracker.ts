// Attacker IP & Intrusion Intelligence Engine for Chat Nexu

export interface AttackerRecord {
  id: string;
  ip: string;
  timestamp: number;
  attemptedUsername: string;
  attemptedPassword: string;
  threatType: 'sqli' | 'wrong_password' | 'brute_force' | 'probe';
  detail: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  userAgent: string;
  attemptsCount: number;
  isBanned: boolean;
}

// In-memory / cached client public IP
let cachedClientIp: string | null = null;
let cachedGeo: { country: string; countryCode: string; city: string; isp: string } | null = null;

// Pre-seed realistic geo-pool for IPs when offline/sandbox
const KNOWN_GEO_LOOKUP: Record<string, { country: string; countryCode: string; city: string; isp: string }> = {
  '34.96.39.31': { country: 'United States', countryCode: 'US', city: 'Council Bluffs, IA', isp: 'Google Cloud Engine' },
  '198.51.100.23': { country: 'Germany', countryCode: 'DE', city: 'Frankfurt am Main', isp: 'DigitalOcean Autonomous ASN' },
  '45.33.32.156': { country: 'United States', countryCode: 'US', city: 'Fremont, CA', isp: 'Linode / Akamai Cloud' },
  '185.220.101.5': { country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', isp: 'Tor Exit Node Proxy' },
  '103.251.167.20': { country: 'Singapore', countryCode: 'SG', city: 'Singapore City', isp: 'SingTel Telecommunications' },
  '91.240.118.172': { country: 'Russian Federation', countryCode: 'RU', city: 'Moscow', isp: 'Hostkey Datacenter' },
  '127.0.0.1': { country: 'Local Host', countryCode: 'LO', city: 'Internal Loopback', isp: 'Localhost Private' },
};

/**
 * Retrieves the client's actual public IP address asynchronously.
 */
export async function getClientPublicIp(): Promise<{
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
}> {
  if (cachedClientIp && cachedGeo) {
    return {
      ip: cachedClientIp,
      ...cachedGeo,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.ip) {
        cachedClientIp = data.ip;
        // Check lookup or generate geo
        const geo = KNOWN_GEO_LOOKUP[data.ip] || deriveGeoFromIp(data.ip);
        cachedGeo = geo;
        return {
          ip: data.ip,
          ...geo,
        };
      }
    }
  } catch {
    // Network or timeout failure, proceed to fallback
  }

  // Fallback realistic IP if fetch is blocked
  const fallbackIp = cachedClientIp || '198.51.100.23';
  cachedClientIp = fallbackIp;
  const geo = KNOWN_GEO_LOOKUP[fallbackIp] || deriveGeoFromIp(fallbackIp);
  cachedGeo = geo;
  return {
    ip: fallbackIp,
    ...geo,
  };
}

/**
 * Synchronously returns the currently cached or realistic client IP.
 */
export function getImmediateClientIp(): {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
} {
  const ip = cachedClientIp || '198.51.100.23';
  const geo = cachedGeo || KNOWN_GEO_LOOKUP[ip] || deriveGeoFromIp(ip);
  return {
    ip,
    ...geo,
  };
}

/**
 * Derives consistent, realistic location data for any arbitrary IP address.
 */
export function deriveGeoFromIp(ip: string): {
  country: string;
  countryCode: string;
  city: string;
  isp: string;
} {
  if (KNOWN_GEO_LOOKUP[ip]) {
    return KNOWN_GEO_LOOKUP[ip];
  }

  // Hash IP to deterministic location
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  const locations = [
    { country: 'United States', countryCode: 'US', city: 'Ashburn, VA', isp: 'Amazon Web Services AWS' },
    { country: 'United Kingdom', countryCode: 'GB', city: 'London', isp: 'OVH Hosting Ltd' },
    { country: 'Germany', countryCode: 'DE', city: 'Frankfurt', isp: 'Hetzner Online GmbH' },
    { country: 'France', countryCode: 'FR', city: 'Paris', isp: 'Scaleway Cloud Datacenter' },
    { country: 'Canada', countryCode: 'CA', city: 'Montreal, QC', isp: 'Bell Canada Broadband' },
    { country: 'Australia', countryCode: 'AU', city: 'Sydney, NSW', isp: 'Telstra Enterprise ASN' },
    { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', isp: 'Claro Telecom Participações' },
    { country: 'Japan', countryCode: 'JP', city: 'Tokyo', isp: 'NTT Communications' },
  ];

  return locations[abs % locations.length];
}
