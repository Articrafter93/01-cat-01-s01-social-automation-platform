import { Redis } from "@upstash/redis";

import { hydrateStore, snapshotStore, type StoreSnapshot } from "@/server/repositories/in-memory-store";

/**
 * Serverless-safe persistence for the demo store.
 *
 * The in-memory collections are pinned to `globalThis`, which keeps state
 * consistent within a single long-running process (localhost dev server) but
 * NOT across separate serverless invocations on Vercel — each lambda instance
 * has its own memory, so a task created in one request is invisible to the next.
 *
 * When Upstash Redis credentials are present, every demo read hydrates the
 * collections from a single Redis key and every demo write persists them back,
 * giving the deployed exhibition real cross-request persistence. With no
 * credentials this module is a no-op and the pure in-memory behaviour (used by
 * localhost and unit tests) is preserved unchanged.
 */
const STATE_KEY = "social-automation:demo-state:v1";

let client: Redis | null = null;
let resolved = false;
let seeded = false;

function getClient(): Redis | null {
  if (resolved) {
    return client;
  }

  resolved = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    client = new Redis({ url, token });
  }

  return client;
}

export function isPersistenceEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Hydrate the in-memory collections from Redis. On the very first run against an
 * empty store, the seeded baseline is persisted so the exhibition always opens
 * with demo data.
 */
export async function loadState(): Promise<void> {
  const redis = getClient();
  if (!redis) {
    return;
  }

  const snapshot = await redis.get<StoreSnapshot>(STATE_KEY);
  if (snapshot) {
    hydrateStore(snapshot);
    seeded = true;
    return;
  }

  if (!seeded) {
    await redis.set(STATE_KEY, snapshotStore());
    seeded = true;
  }
}

/** Persist the current in-memory collections to Redis after a mutation. */
export async function saveState(): Promise<void> {
  const redis = getClient();
  if (!redis) {
    return;
  }

  await redis.set(STATE_KEY, snapshotStore());
  seeded = true;
}
