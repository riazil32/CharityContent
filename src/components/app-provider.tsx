"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { backend, demoBackend } from "@/lib/data";
import type { BackendMode } from "@/lib/data/backend";
import { DEMO_EMAIL, DEMO_PASSWORD, DEFAULT_AI_PREFERENCES } from "@/lib/demo-data";
import { currentPeriod, generationsRemaining } from "@/lib/plans";
import type {
  AppUser,
  ContentDraft,
  ContentItem,
  ContentType,
  Organisation,
  OrgContext,
  Platform,
  Refinement,
  Tone,
} from "@/lib/types";

export type GenerationSource = "openai" | "demo";

export class LimitReachedError extends Error {
  constructor() {
    super("You've used all your AI generations for this month. Upgrade your plan to keep going.");
  }
}

interface GenerateOptions {
  platform: Platform;
  contentType: ContentType;
  tone: Tone;
  campaignId: string | null;
  brief?: string;
  count?: 1 | 3;
}

interface AppState {
  mode: BackendMode;
  status: "loading" | "ready";
  user: AppUser | null;
  org: Organisation | null;
  items: ContentItem[];
  remaining: number | null;
  signUp(email: string, password: string, fullName: string): Promise<{ needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  signInDemo(): Promise<void>;
  signOut(): Promise<void>;
  updateAccount(changes: { fullName?: string; password?: string }): Promise<void>;
  saveOrganisation(changes: Partial<Organisation>): Promise<Organisation>;
  generate(opts: GenerateOptions): Promise<{ drafts: ContentDraft[]; source: GenerationSource; warning?: string }>;
  generateMonth(year: number, month: number): Promise<{ count: number; source: GenerationSource }>;
  refine(draft: ContentDraft, refinement: Refinement, platform: Platform): Promise<ContentDraft>;
  createItem(draft: ContentDraft, meta: Omit<ContentItem, keyof ContentDraft | "id" | "orgId" | "createdAt" | "updatedAt" | "favourite">): Promise<ContentItem>;
  saveItem(item: ContentItem): Promise<void>;
  deleteItem(id: string): Promise<void>;
  toggleFavourite(id: string): Promise<void>;
  resetDemo(): Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

function toContext(org: Organisation): OrgContext {
  const { name, type, description, audience, website, tone, toneNotes, causes, campaigns, keyDates, aiPreferences, platforms } = org;
  return { name, type, description, audience, website, tone, toneNotes, causes, campaigns, keyDates, aiPreferences, platforms };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [user, setUser] = useState<AppUser | null>(null);
  const [org, setOrg] = useState<Organisation | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);

  const load = useCallback(async (u: AppUser | null) => {
    setUser(u);
    if (!u) {
      setOrg(null);
      setItems([]);
      return;
    }
    const o = await backend.getOrganisation(u.id);
    setOrg(o);
    setItems(o ? await backend.listContent(o.id) : []);
  }, []);

  useEffect(() => {
    backend
      .getCurrentUser()
      .then(load)
      .catch(() => load(null))
      .finally(() => setStatus("ready"));
  }, [load]);

  const api = useCallback(async <T,>(payload: object): Promise<T> => {
    const token = await backend.getAccessToken();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 402) throw new LimitReachedError();
    if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
    return json as T;
  }, []);

  const remaining = org ? generationsRemaining(org.plan, org.generationsPeriod, org.generationsUsed) : null;

  /** Records one used generation locally (the server has already counted it when using Supabase). */
  const countGeneration = useCallback(
    async (o: Organisation) => {
      const period = currentPeriod();
      const next: Organisation = {
        ...o,
        generationsPeriod: period,
        generationsUsed: (o.generationsPeriod === period ? o.generationsUsed : 0) + 1,
      };
      setOrg(next);
      if (backend.mode === "demo" && user) await backend.saveOrganisation(user.id, next);
    },
    [user],
  );

  const requireOrg = useCallback(() => {
    if (!org || !user) throw new Error("Please finish setting up your organisation first.");
    return org;
  }, [org, user]);

  const value = useMemo<AppState>(
    () => ({
      mode: backend.mode,
      status,
      user,
      org,
      items,
      remaining,

      async signUp(email, password, fullName) {
        const res = await backend.signUp(email, password, fullName);
        if (res.user) await load(res.user);
        return { needsConfirmation: res.needsConfirmation };
      },
      async signIn(email, password) {
        await load(await backend.signIn(email, password));
      },
      async signInDemo() {
        // The demo account only exists in demo mode (browser storage).
        await load(await demoBackend.signIn(DEMO_EMAIL, DEMO_PASSWORD));
      },
      async signOut() {
        await backend.signOut();
        await load(null);
      },
      async updateAccount(changes) {
        if (!user) return;
        setUser(await backend.updateAccount(user, changes));
      },

      async saveOrganisation(changes) {
        if (!user) throw new Error("Not signed in");
        const base: Organisation = org ?? {
          id: crypto.randomUUID(),
          name: "",
          type: "",
          description: "",
          audience: "",
          website: "",
          platforms: [],
          tone: "friendly",
          toneNotes: "",
          causes: [],
          campaigns: [],
          keyDates: [],
          aiPreferences: { ...DEFAULT_AI_PREFERENCES },
          plan: "free",
          generationsPeriod: currentPeriod(),
          generationsUsed: 0,
          createdAt: new Date().toISOString(),
        };
        const saved = await backend.saveOrganisation(user.id, { ...base, ...changes });
        setOrg(saved);
        return saved;
      },

      async generate(opts) {
        const o = requireOrg();
        if (remaining === 0) throw new LimitReachedError();
        const res = await api<{ data: ContentDraft[]; source: GenerationSource; warning?: string }>({
          action: "generate",
          org: toContext(o),
          ...opts,
        });
        await countGeneration(o);
        return { drafts: res.data, source: res.source, warning: res.warning };
      },

      async generateMonth(year, month) {
        const o = requireOrg();
        if (remaining === 0) throw new LimitReachedError();
        const now = new Date();
        const isCurrent = now.getFullYear() === year && now.getMonth() + 1 === month;
        const today = `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const res = await api<{
          data: { slot: { date: string; platform: Platform; contentType: ContentType; tone: Tone; campaignId: string | null }; draft: ContentDraft }[];
          source: GenerationSource;
        }>({ action: "month", org: toContext(o), year, month, fromDate: isCurrent ? today : undefined });
        await countGeneration(o);
        const stamp = new Date().toISOString();
        const created: ContentItem[] = res.data.map(({ slot, draft }) => ({
          ...draft,
          id: crypto.randomUUID(),
          orgId: o.id,
          campaignId: slot.campaignId,
          platform: slot.platform,
          contentType: slot.contentType,
          tone: slot.tone,
          scheduledFor: slot.date,
          favourite: false,
          createdAt: stamp,
          updatedAt: stamp,
        }));
        await backend.upsertContent(created);
        setItems((prev) => [...prev, ...created]);
        return { count: created.length, source: res.source };
      },

      async refine(draft, refinement, platform) {
        const o = requireOrg();
        const res = await api<{ data: ContentDraft }>({ action: "refine", org: toContext(o), draft, refinement, platform });
        return res.data;
      },

      async createItem(draft, meta) {
        const o = requireOrg();
        const stamp = new Date().toISOString();
        const item: ContentItem = { ...draft, ...meta, id: crypto.randomUUID(), orgId: o.id, favourite: false, createdAt: stamp, updatedAt: stamp };
        await backend.upsertContent([item]);
        setItems((prev) => [...prev, item]);
        return item;
      },
      async saveItem(item) {
        const next = { ...item, updatedAt: new Date().toISOString() };
        await backend.upsertContent([next]);
        setItems((prev) => prev.map((i) => (i.id === item.id ? next : i)));
      },
      async deleteItem(id) {
        await backend.deleteContent(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      },
      async toggleFavourite(id) {
        const item = items.find((i) => i.id === id);
        if (!item) return;
        const next = { ...item, favourite: !item.favourite };
        setItems((prev) => prev.map((i) => (i.id === id ? next : i)));
        await backend.upsertContent([next]);
      },
      async resetDemo() {
        if (backend.mode !== "demo") return;
        await demoBackend.resetDemo();
        await load(user);
      },
    }),
    [status, user, org, items, remaining, load, api, countGeneration, requireOrg],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
