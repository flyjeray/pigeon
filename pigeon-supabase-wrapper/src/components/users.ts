import { SupabaseClient } from "@supabase/supabase-js";

export class PigeonSupabaseUsersDB {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getIDByEmail(email: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error) {
      throw new Error(`Failed to retrieve id by email: ${error.message}`);
    }

    return data ? data.id : null;
  }

  async getEmailByID(id: string): Promise<string | null> {
    const { data, error } = await this.client
      .from("users")
      .select("email")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to retrieve id by email: ${error.message}`);
    }

    return data ? data.email : null;
  }
}
