import { createHash } from "node:crypto";

export function buildPublishIdempotencyKey(input: {
  normalizedUrl: string;
  canonicalDate: string;
  channel: string;
  accountId: string;
  approvedRevision: number;
}) {
  const raw = [
    input.normalizedUrl,
    input.canonicalDate,
    input.channel,
    input.accountId,
    String(input.approvedRevision),
  ].join(":");

  return createHash("sha256").update(raw).digest("hex");
}
