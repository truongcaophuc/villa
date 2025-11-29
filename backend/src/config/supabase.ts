import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabaseAdmin = (): SupabaseClient => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("supabase_admin_not_configured");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export const supabaseAnon = (): SupabaseClient => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("supabase_anon_not_configured");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};

export const clientForToken = (token: string): SupabaseClient => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("supabase_token_client_not_configured");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
};