import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PigeonSupabaseAuth } from "./components/auth";
import { PigeonSupabasePublicKeysDB } from "./components/publicKeys";
import { PigeonSupabasePrivateKeysDB } from "./components/privateKeys";
import { PigeonSupabaseConversationsDB } from "./components/conversations";
import { PigeonSupabaseMessagesDB } from "./components/messages";
import { PigeonSupabaseUsersDB } from "./components/users";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

type PigeonSupabaseDB = {
  publicKeys: PigeonSupabasePublicKeysDB;
  privateKeys: PigeonSupabasePrivateKeysDB;
  conversations: PigeonSupabaseConversationsDB;
  messages: PigeonSupabaseMessagesDB;
  users: PigeonSupabaseUsersDB;
};

export class PigeonSupabaseWrapper {
  private static instance: PigeonSupabaseWrapper | null = null;
  private client: SupabaseClient;
  public auth: PigeonSupabaseAuth;

  public db: PigeonSupabaseDB;

  private constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
    this.auth = new PigeonSupabaseAuth(this.client);
    this.db = {
      publicKeys: new PigeonSupabasePublicKeysDB(this.client),
      privateKeys: new PigeonSupabasePrivateKeysDB(this.client),
      conversations: new PigeonSupabaseConversationsDB(this.client),
      messages: new PigeonSupabaseMessagesDB(this.client),
      users: new PigeonSupabaseUsersDB(this.client),
    };
  }

  static getInstance(config?: SupabaseConfig): PigeonSupabaseWrapper {
    if (!PigeonSupabaseWrapper.instance) {
      if (!config) {
        throw new Error("Configuration is required for first initialization");
      }
      PigeonSupabaseWrapper.instance = new PigeonSupabaseWrapper(config);
    }
    return PigeonSupabaseWrapper.instance;
  }

  static resetInstance(): void {
    PigeonSupabaseWrapper.instance = null;
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client.auth.getSession();
      return !error;
    } catch (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
  }
}

export { createClient } from "@supabase/supabase-js";
export type { SupabaseClient } from "@supabase/supabase-js";
