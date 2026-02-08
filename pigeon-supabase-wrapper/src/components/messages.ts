import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "pigeon-supabase-types";

export type MessageEntry = Database["public"]["Tables"]["messages"]["Row"];

type MessagePayload = Pick<MessageEntry, "contents" | "conversation_id">;

export class PigeonSupabaseMessagesDB {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  async getConversationMessages(
    conversationID: string
  ): Promise<MessageEntry[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("id, created_at, sender, contents, conversation_id")
      .eq("conversation_id", conversationID);

    if (error) {
      throw new Error(`Failed to retrieve messages: ${error.message}`);
    }

    return data || [];
  }

  async sendMessage({
    contents,
    conversation_id,
  }: MessagePayload): Promise<MessageEntry> {
    const { data, error } = await this.client
      .from("messages")
      .insert({ contents, conversation_id })
      .select("id, created_at, sender, contents, conversation_id");

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return data[0] as MessageEntry;
  }

  subscribeToConversation(
    conversationID: string,
    onMessage: (message: MessageEntry) => void
  ) {
    const channelName = `conversation:${conversationID}`;

    const channel = this.client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationID}`,
        },
        (payload) => {
          const message = payload.new as MessageEntry;
          onMessage(message);
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}
