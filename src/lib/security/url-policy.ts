import { DomainError } from "@/lib/api/errors";

const privateHostPatterns = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  // Link-local / cloud metadata endpoint (AWS/GCP/Azure 169.254.169.254).
  /^169\.254\./,
  // Unspecified / "this host" addresses.
  /^0\./,
];

// IPv6 loopback, unspecified, unique-local (fc00::/7) and link-local (fe80::/10).
const privateIpv6Patterns = [
  /^::1$/,
  /^::$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe[89ab][0-9a-f]:/i,
  // IPv4-mapped IPv6 form of the metadata/loopback ranges.
  /^::ffff:(127\.|169\.254\.|10\.|192\.168\.|0\.)/i,
];

function stripIpv6Brackets(hostname: string) {
  return hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
}

// Reject hosts that are numeric IPs expressed in non-dotted-decimal forms
// (decimal, hex, octal), which can smuggle private ranges past dotted checks.
function assertNoObfuscatedIp(hostname: string) {
  // Pure decimal integer (e.g. http://2130706433 == 127.0.0.1).
  if (/^\d+$/.test(hostname)) {
    throw new DomainError("Numeric IP hosts are blocked.");
  }
  // Hex (0x...) or octal (leading 0) encoded octets.
  if (/^(0x[0-9a-f]+|0[0-7]+)(\.|$)/i.test(hostname)) {
    throw new DomainError("Obfuscated IP hosts are blocked.");
  }
}

export function assertSafeSourceUrl(input: string, allowlist: string[] = []) {
  const parsed = new URL(input);
  const hostname = stripIpv6Brackets(parsed.hostname.toLowerCase());

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new DomainError("Only HTTP and HTTPS URLs are allowed.");
  }

  assertNoObfuscatedIp(hostname);

  if (privateHostPatterns.some((pattern) => pattern.test(hostname))) {
    throw new DomainError("Private or loopback hosts are blocked.");
  }

  if (privateIpv6Patterns.some((pattern) => pattern.test(hostname))) {
    throw new DomainError("Private or loopback IPv6 hosts are blocked.");
  }

  if (allowlist.length > 0 && !allowlist.includes(hostname)) {
    throw new DomainError("Source host is outside the configured allowlist.");
  }

  return parsed;
}
