"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
