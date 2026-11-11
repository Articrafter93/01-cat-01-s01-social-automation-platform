// Whether a Supabase backend is configured (real data) or the app runs on the local demo store.
// Kept free of the Supabase client so edge-safe code (auth.config.ts) can import it.
export function hasSupabaseServerConfig() {
  if (process.env.DATA_SOURCE_MODE === "local" || process.env.APP_DATA_SOURCE === "local") {
    return false;
  }

  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}
