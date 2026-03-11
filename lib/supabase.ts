import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function getSessionStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    getItem(key: string) {
      return window.sessionStorage.getItem(key);
    },
    setItem(key: string, value: string) {
      window.sessionStorage.setItem(key, value);
    },
    removeItem(key: string) {
      window.sessionStorage.removeItem(key);
    },
  };
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: getSessionStorage(),
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabase);
}
