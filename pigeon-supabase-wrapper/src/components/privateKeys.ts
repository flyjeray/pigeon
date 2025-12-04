import { SupabaseClient } from "@supabase/supabase-js";
import type { CryptoRecipe } from "pigeon-clientside-encryption";

export class PigeonSupabasePrivateKeysDB {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async storePrivateKey(key: string, recipe: CryptoRecipe) {
    const { data, error } = await this.client
      .from("private_keys")
      .insert({ encoded_key: key, recipe });

    if (error) {
      throw new Error(`Failed to store private key: ${error.message}`);
    }

    return data;
  }

  async getPrivateKey(
    userId: string
  ): Promise<{ encoded_key: string; recipe: CryptoRecipe } | null> {
    const { data, error } = await this.client
      .from("private_keys")
      .select("encoded_key, recipe")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to retrieve private key: ${error.message}`);
    }

    return data;
  }
}
