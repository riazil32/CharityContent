"use client";
/**
 * Demo backend: accounts and data live in this browser's localStorage.
 * It lets the full product be tried with no database. Passwords are hashed
 * with SHA-256 but this is NOT real security; use Supabase for production.
 */
import type { AppUser, ContentItem, Organisation } from "../types";
import type { Backend, SignUpResult } from "./backend";
import { DEMO_EMAIL, DEMO_PASSWORD, demoContent, demoOrganisation } from "../demo-data";

interface StoredUser extends AppUser {
  passwordHash: string;
}

const KEYS = {
  users: "cc:users",
  session: "cc:session",
  org: (userId: string) => `cc:org:${userId}`,
  content: (orgId: string) => `cc:content:${orgId}`,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(`charitycontent:${text}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function publicUser(u: StoredUser): AppUser {
  return { id: u.id, email: u.email, fullName: u.fullName };
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

async function ensureDemoAccount(): Promise<void> {
  const users = read<Record<string, StoredUser>>(KEYS.users, {});
  if (users[DEMO_EMAIL]) return;
  const id = "demo-user";
  users[DEMO_EMAIL] = { id, email: DEMO_EMAIL, fullName: "Sarah Mitchell", passwordHash: await hash(DEMO_PASSWORD) };
  write(KEYS.users, users);
  const org = demoOrganisation("demo-org");
  write(KEYS.org(id), org);
  write(KEYS.content(org.id), demoContent(org));
}

export const demoBackend: Backend & { resetDemo(): Promise<void> } = {
  mode: "demo",

  async getCurrentUser() {
    const id = read<string | null>(KEYS.session, null);
    if (!id) return null;
    const users = read<Record<string, StoredUser>>(KEYS.users, {});
    const u = Object.values(users).find((x) => x.id === id);
    return u ? publicUser(u) : null;
  },

  async getAccessToken() {
    return null;
  },

  async signUp(email, password, fullName): Promise<SignUpResult> {
    await delay();
    const key = email.trim().toLowerCase();
    const users = read<Record<string, StoredUser>>(KEYS.users, {});
    if (users[key]) throw new Error("An account with this email already exists. Try logging in.");
    const user: StoredUser = { id: crypto.randomUUID(), email: key, fullName: fullName.trim(), passwordHash: await hash(password) };
    users[key] = user;
    write(KEYS.users, users);
    write(KEYS.session, user.id);
    return { user: publicUser(user), needsConfirmation: false };
  },

  async signIn(email, password) {
    await delay();
    const key = email.trim().toLowerCase();
    if (key === DEMO_EMAIL) await ensureDemoAccount();
    const users = read<Record<string, StoredUser>>(KEYS.users, {});
    const user = users[key];
    if (!user || user.passwordHash !== (await hash(password))) {
      throw new Error("That email and password don't match. Please try again.");
    }
    write(KEYS.session, user.id);
    return publicUser(user);
  },

  async signOut() {
    window.localStorage.removeItem(KEYS.session);
  },

  async updateAccount(user, changes) {
    const users = read<Record<string, StoredUser>>(KEYS.users, {});
    const stored = users[user.email];
    if (!stored) throw new Error("Account not found");
    if (changes.fullName !== undefined) stored.fullName = changes.fullName.trim();
    if (changes.password) stored.passwordHash = await hash(changes.password);
    write(KEYS.users, users);
    return publicUser(stored);
  },

  async getOrganisation(userId) {
    return read<Organisation | null>(KEYS.org(userId), null);
  },

  async saveOrganisation(userId, org) {
    write(KEYS.org(userId), org);
    return org;
  },

  async listContent(orgId) {
    return read<ContentItem[]>(KEYS.content(orgId), []);
  },

  async upsertContent(items) {
    if (!items.length) return;
    const key = KEYS.content(items[0].orgId);
    const existing = read<ContentItem[]>(key, []);
    const byId = new Map(existing.map((i) => [i.id, i]));
    items.forEach((i) => byId.set(i.id, i));
    write(key, [...byId.values()]);
  },

  async deleteContent(id) {
    // Content ids are unique across orgs, so scan this browser's stores.
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith("cc:content:")) continue;
      const list = read<ContentItem[]>(key, []);
      if (list.some((x) => x.id === id)) write(key, list.filter((x) => x.id !== id));
    }
  },

  /** Restores HopeBridge's original demo data. */
  async resetDemo() {
    const org = demoOrganisation("demo-org");
    write(KEYS.org("demo-user"), org);
    write(KEYS.content(org.id), demoContent(org));
  },
};
