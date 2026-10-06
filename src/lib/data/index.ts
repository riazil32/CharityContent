"use client";
import { isSupabaseConfigured } from "../supabase/config";
import type { Backend } from "./backend";
import { demoBackend } from "./demo-backend";
import { supabaseBackend } from "./supabase-backend";

/** Supabase when its env vars are set, otherwise the in-browser demo backend. */
export const backend: Backend = isSupabaseConfigured ? supabaseBackend : demoBackend;
export { demoBackend };
