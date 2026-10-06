"use client";
/**
 * Supabase backend: real auth (email + password) and Postgres storage with
 * row-level security. Schema lives in supabase/schema.sql.
 */
import type { AppUser, ContentItem, Organisation } from "../types";
import type { Backend } from "./backend";
import { getSupabaseBrowserClient } from "../supabase/client";
import { DEFAULT_AI_PREFERENCES } from "../demo-data";
import { currentPeriod } from "../plans";
import type { User } from "@supabase/supabase-js";

const sb = () => getSupabaseBrowserClient();

function toUser(u: User): AppUser {
  return { id: u.id, email: u.email ?? "", fullName: (u.user_metadata?.full_name as string) ?? "" };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function orgFromRow(r: any): Organisation {
  return {
    id: r.id,
    name: r.name,
    type: r.org_type ?? "",
    description: r.description ?? "",
    audience: r.audience ?? "",
    website: r.website ?? "",
    platforms: r.platforms ?? [],
    tone: r.tone ?? "friendly",
    toneNotes: r.tone_notes ?? "",
    causes: r.causes ?? [],
    campaigns: r.campaigns ?? [],
    keyDates: r.key_dates ?? [],
    aiPreferences: { ...DEFAULT_AI_PREFERENCES, ...(r.ai_preferences ?? {}) },
    plan: r.plan ?? "free",
    generationsPeriod: r.generations_period ?? currentPeriod(),
    generationsUsed: r.generations_used ?? 0,
    createdAt: r.created_at,
  };
}

/** Plan and usage columns are deliberately excluded: only the server may change them. */
function orgToRow(userId: string, o: Organisation) {
  return {
    id: o.id,
    owner_id: userId,
    name: o.name,
    org_type: o.type,
    description: o.description,
    audience: o.audience,
    website: o.website,
    platforms: o.platforms,
    tone: o.tone,
    tone_notes: o.toneNotes,
    causes: o.causes,
    campaigns: o.campaigns,
    key_dates: o.keyDates,
    ai_preferences: o.aiPreferences,
  };
}

function itemFromRow(r: any): ContentItem {
  return {
    id: r.id,
    orgId: r.org_id,
    campaignId: r.campaign_id,
    platform: r.platform,
    contentType: r.content_type,
    tone: r.tone,
    headline: r.headline,
    caption: r.caption,
    cta: r.cta,
    hashtags: r.hashtags ?? [],
    imageIdea: r.image_idea ?? "",
    scheduledFor: r.scheduled_for,
    favourite: r.favourite,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function itemToRow(i: ContentItem) {
  return {
    id: i.id,
    org_id: i.orgId,
    campaign_id: i.campaignId,
    platform: i.platform,
    content_type: i.contentType,
    tone: i.tone,
    headline: i.headline,
    caption: i.caption,
    cta: i.cta,
    hashtags: i.hashtags,
    image_idea: i.imageIdea,
    scheduled_for: i.scheduledFor,
    favourite: i.favourite,
    updated_at: new Date().toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export const supabaseBackend: Backend = {
  mode: "supabase",

  async getCurrentUser() {
    const { data } = await sb().auth.getSession();
    return data.session?.user ? toUser(data.session.user) : null;
  },

  async getAccessToken() {
    const { data } = await sb().auth.getSession();
    return data.session?.access_token ?? null;
  },

  async signUp(email, password, fullName) {
    const { data, error } = await sb().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/onboarding` : undefined,
      },
    });
    fail(error);
    return { user: data.session && data.user ? toUser(data.user) : null, needsConfirmation: !data.session };
  },

  async signIn(email, password) {
    const { data, error } = await sb().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === "Invalid login credentials" ? "That email and password don't match. Please try again." : error.message);
    return toUser(data.user);
  },

  async signOut() {
    await sb().auth.signOut();
  },

  async updateAccount(_user, changes) {
    const { data, error } = await sb().auth.updateUser({
      ...(changes.password ? { password: changes.password } : {}),
      ...(changes.fullName !== undefined ? { data: { full_name: changes.fullName } } : {}),
    });
    fail(error);
    return toUser(data.user!);
  },

  async getOrganisation(userId) {
    const { data, error } = await sb().from("organisations").select("*").eq("owner_id", userId).maybeSingle();
    fail(error);
    return data ? orgFromRow(data) : null;
  },

  async saveOrganisation(userId, org) {
    // Insert and update are separate because users may not update id/owner_id.
    const row = orgToRow(userId, org);
    const existing = await sb().from("organisations").select("id").eq("id", org.id).maybeSingle();
    fail(existing.error);
    if (!existing.data) {
      const { data, error } = await sb().from("organisations").insert(row).select("*").single();
      fail(error);
      return orgFromRow(data);
    }
    const { id: _id, owner_id: _owner, ...changes } = row;
    const { data, error } = await sb()
      .from("organisations")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", org.id)
      .select("*")
      .single();
    fail(error);
    return orgFromRow(data);
  },

  async listContent(orgId) {
    const { data, error } = await sb()
      .from("content_items")
      .select("*")
      .eq("org_id", orgId)
      .order("scheduled_for", { ascending: true, nullsFirst: false });
    fail(error);
    return (data ?? []).map(itemFromRow);
  },

  async upsertContent(items) {
    if (!items.length) return;
    const { error } = await sb().from("content_items").upsert(items.map(itemToRow));
    fail(error);
  },

  async deleteContent(id) {
    const { error } = await sb().from("content_items").delete().eq("id", id);
    fail(error);
  },
};
