import { SupabaseClient } from "@supabase/supabase-js";

export type ConversationEntry = {
  id: string;
  created_at: string;
  user_one: string;
  user_two: string;
};

export class PigeonSupabaseConversationsDB {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getMyConversations(): Promise<ConversationEntry[]> {
    const { data, error } = await this.client
      .from("conversations")
      .select("id, created_at, user_one, user_two");

    if (error) {
      throw new Error(`Failed to retrieve conversations: ${error.message}`);
    }

    return data || [];
  }

  async getMyConversationWithUser(id: string): Promise<ConversationEntry> {
    const { data, error } = await this.client
      .from("conversations")
      .select("id, created_at, user_one, user_two")
      .or(`user_one.eq.${id},user_two.eq.${id}`)
      .single();

    if (error) {
      throw new Error(`Failed to retrieve conversation: ${error.message}`);
    }

    if (!data) throw new Error(`Conversation with user ${id} not found`);

    return data;
  }

  async createConversation(id: string): Promise<ConversationEntry> {
    const { data, error } = await this.client
      .from("conversations")
      .insert({ user_two: id })
      .select("id, created_at, user_one, user_two");

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data[0] as ConversationEntry;
  }
}
