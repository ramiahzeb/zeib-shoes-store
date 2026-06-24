import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseBrowserConfig = {
  supabaseUrl: string;
  rawSupabaseUrl: string;
  supabaseKey: string;
  hasUrl: boolean;
  hasKey: boolean;
  hasAnyConfig: boolean;
  isComplete: boolean;
  keyPrefix: string;
  keySource: "anon" | "publishable" | "missing";
  urlOrigin: string;
  urlWasNormalized: boolean;
  missing: string[];
};

let supabaseBrowserClient: SupabaseClient | null | undefined;

function normalizeSupabaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.endsWith(".supabase.co")) {
      return parsed.origin;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

function getKeyPrefix(value: string) {
  if (!value) return "";
  if (value.startsWith("eyJ")) return "eyJ...";
  if (value.startsWith("sb_publishable_")) return "sb_publishable...";
  return `${value.slice(0, 8)}...`;
}

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const supabaseKey = anonKey || publishableKey;
  const hasUrl = Boolean(supabaseUrl);
  const hasKey = Boolean(supabaseKey);
  const missing = [
    !hasUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
    !hasKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" : ""
  ].filter(Boolean);

  return {
    supabaseUrl,
    rawSupabaseUrl,
    supabaseKey,
    hasUrl,
    hasKey,
    hasAnyConfig: hasUrl || hasKey,
    isComplete: hasUrl && hasKey,
    keyPrefix: getKeyPrefix(supabaseKey),
    keySource: anonKey ? "anon" : publishableKey ? "publishable" : "missing",
    urlOrigin: supabaseUrl,
    urlWasNormalized: Boolean(rawSupabaseUrl && rawSupabaseUrl !== supabaseUrl),
    missing
  };
}

export function hasSupabaseConfig() {
  return getSupabaseBrowserConfig().isComplete;
}

export function shouldUseSupabaseAuth() {
  return getSupabaseBrowserConfig().hasAnyConfig;
}

export function getSupabaseConfigError() {
  const config = getSupabaseBrowserConfig();
  if (config.isComplete || !config.hasAnyConfig) return "";
  return `Supabase authentication is partially configured. Missing: ${config.missing.join(", ")}.`;
}

export function createSupabaseBrowserClient() {
  const config = getSupabaseBrowserConfig();

  if (!config.hasAnyConfig) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[ZEIB Supabase] Public Supabase env vars are missing. Using local demo auth fallback.");
    }
    supabaseBrowserClient = null;
    return null;
  }

  if (!config.isComplete) {
    const message = getSupabaseConfigError();
    if (process.env.NODE_ENV === "development") {
      console.error(`[ZEIB Supabase] ${message}`);
    }
    throw new Error(message);
  }

  if (supabaseBrowserClient !== undefined) {
    return supabaseBrowserClient;
  }

  // TODO: Add Supabase database queries for products, reviews, wishlist, cart, and orders here.
  // TODO: Keep service-role keys server-only in API routes or server actions. Never expose them here.
  supabaseBrowserClient = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        apikey: config.supabaseKey
      }
    }
  });
  return supabaseBrowserClient;
}
