import { SupabaseClient } from "@supabase/supabase-js";

export class PigeonSupabasePublicKeysDB {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async storePublicKey(userId: string, publicKey: string) {
    const { data, error } = await this.client
      .from("public_keys")
      .upsert({ user: userId, key: publicKey });

    if (error) {
      throw new Error(`Failed to store public key: ${error.message}`);
    }

    return data;
  }

  async getPublicKey(userId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("public_keys")
      .select("key")
      .eq("user", userId)
      .single();

    if (error) {
      throw new Error(`Failed to retrieve public key: ${error.message}`);
    }

    return data ? data.key : null;
  }
}