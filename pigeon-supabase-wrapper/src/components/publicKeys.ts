import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "pigeon-supabase-types";

export class PigeonSupabasePublicKeysDB {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  async storePublicKey(publicKey: string) {
    const { data, error } = await this.client
      .from("public_keys")
      .insert({ key: publicKey });

    if (error) {
      throw new Error(`Failed to store public key: ${error.message}`);
    }

    return data;
  }

  async getPublicKey(userId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("public_keys")
      .select("key")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to retrieve public key: ${error.message}`);
    }

    return data ? data.key : null;
  }
}
