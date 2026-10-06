import type { AppUser, ContentItem, Organisation } from "../types";

export type BackendMode = "demo" | "supabase";

export interface SignUpResult {
  user: AppUser | null;
  /** True when the auth provider requires the user to confirm their email first. */
  needsConfirmation: boolean;
}

/**
 * Everything the UI needs from auth and storage. There are two
 * implementations: a browser-only demo backend (localStorage) and Supabase.
 */
export interface Backend {
  mode: BackendMode;
  getCurrentUser(): Promise<AppUser | null>;
  getAccessToken(): Promise<string | null>;
  signUp(email: string, password: string, fullName: string): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<AppUser>;
  signOut(): Promise<void>;
  updateAccount(user: AppUser, changes: { fullName?: string; password?: string }): Promise<AppUser>;

  getOrganisation(userId: string): Promise<Organisation | null>;
  saveOrganisation(userId: string, org: Organisation): Promise<Organisation>;

  listContent(orgId: string): Promise<ContentItem[]>;
  upsertContent(items: ContentItem[]): Promise<void>;
  deleteContent(id: string): Promise<void>;
}
