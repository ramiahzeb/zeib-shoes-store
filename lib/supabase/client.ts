import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  // TODO: Add Supabase Auth, products, reviews, wishlist, cart, and order queries here after keys are configured.
  return createBrowserClient(url, anonKey);
}
