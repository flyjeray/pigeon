import { useEffect } from "react";
import { useSupabase } from "../supabase/hooks";
import { useChatStore } from "../state/chats";

export const useChatList = () => {
  const { wrapper, user } = useSupabase();
  const { chats, addChat } = useChatStore((state) => state);

  /**
   * Adds a new chat to the chat list by recipient email.
   *
   * @param recipientEmail - The email of the recipient to add as a chat.
   */
  const add = async (recipientEmail: string) => {
    if (!wrapper) return;

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
  };

  /**
   * Fetches list of user's conversations and updates the chat store.
   */
  const getList = async () => {
    if (!wrapper) return;

    // get conversations where current user is present as one of chatters
    const conversations = await wrapper.db.conversations.getMyConversations();

    for (const convo of conversations) {
      let otherUserID: string | null = null;

      // find the other user in the conversation
      if (convo.user_one !== user?.id) otherUserID = convo.user_one;
      else if (convo.user_two !== user?.id) otherUserID = convo.user_two;

      // edge case check, not expected to occur
      if (!otherUserID || chats[otherUserID]) continue;

      // fetch email and public key for the other user
      const email = await wrapper.db.users.getEmailByID(otherUserID);
      const publicKey = await wrapper.db.publicKeys.getPublicKey(otherUserID);

      // edge case check, not expected to occur
      if (!email || !publicKey) continue;

      // add chat data to store
      addChat(otherUserID, { email, publicKey, conversationId: convo.id });
    }
  };

  useEffect(() => {
    getList();
  }, []);

  return {
    add,
    chats,
  };
};
