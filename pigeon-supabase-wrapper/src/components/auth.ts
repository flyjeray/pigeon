import { SupabaseClient } from "@supabase/supabase-js";

export class PigeonSupabaseAuth {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async signIn(email: string, password: string) {
    return await this.client.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string) {
    return await this.client.auth.signUp({ email, password });
  }

  async signOut() {
    return await this.client.auth.signOut();
  }

  async getCurrentUser() {
    return await this.client.auth.getUser();
  }
}
