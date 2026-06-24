import { createClient } from "@supabase/supabase-js";
import { DomainError } from "@/lib/api/errors";

export function hasSupabaseServerConfig() {
  if (process.env.DATA_SOURCE_MODE === "local" || process.env.APP_DATA_SOURCE === "local") {
    return false;
  }

  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new DomainError(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y una clave de servidor o publishable en .env.local.",
      503,
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "cat_01_s01",
    },
  });
}
