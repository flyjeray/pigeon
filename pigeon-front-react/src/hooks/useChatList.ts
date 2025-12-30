import { useEffect, useState } from "react";
import { useSupabase } from "../supabase/hooks";
import { useChatStore } from "../state/chats";
import type { ConversationEntry } from "pigeon-supabase-wrapper/dist/components/conversations";

export const useChatList = () => {
  const { wrapper, user } = useSupabase();
  const { chats, addChat } = useChatStore((state) => state);

  const [error, setError] = useState<string | null>(null);

  /**
   * Adds a new chat to the chat list by recipient email.
   *
   * @param recipientEmail - The email of the recipient to add as a chat.
   */
  const add = async (recipientEmail: string) => {
    if (!wrapper) return;

    setError(null);

    try {
      // get user ID by email
      const id = await wrapper.db.users.getIDByEmail(recipientEmail);

      // edge case check, not expected to occur
      if (!id || chats[id]) return;

      // get public key for the user
      const publicKey = await wrapper.db.publicKeys.getPublicKey(id);

      // edge case check, not expected to occur
      if (!publicKey) return;

      // add chat data to store
      addChat(id, { email: recipientEmail, publicKey });
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      return;
    }
  };

  const parseConversationData = async (convo: ConversationEntry) => {
    if (!wrapper) return;

    let otherUserID: string | null = null;

    // find the other user in the conversation
    if (convo.user_one !== user?.id) otherUserID = convo.user_one;
    else if (convo.user_two !== user?.id) otherUserID = convo.user_two;

    // edge case check, not expected to occur
    if (!otherUserID || chats[otherUserID]) return;

    // fetch email and public key for the other user
    const email = await wrapper.db.users.getEmailByID(otherUserID);
    const publicKey = await wrapper.db.publicKeys.getPublicKey(otherUserID);

    // edge case check, not expected to occur
    if (!email || !publicKey) return;

    // add chat data to store
    addChat(otherUserID, { email, publicKey, conversationId: convo.id });
  };

  /**
   * Fetches list of user's conversations and updates the chat store.
   */
  const getList = async () => {
    if (!wrapper) return;

    // get conversations where current user is present as one of chatters
    const conversations = await wrapper.db.conversations.getMyConversations();

    for (const c of conversations) {
      parseConversationData(c);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    if (!wrapper || !user) return;

    // subscribe to realtime messages
    const unsubscribe = wrapper.db.conversations.subscribeToNewConversations(
      user.id,
      (conversation) => {
        parseConversationData(conversation);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [wrapper, chats, user]);

  return {
    add,
    chats,
    error,
  };
};
