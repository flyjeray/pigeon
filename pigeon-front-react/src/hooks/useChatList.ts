import { useEffect } from "react";
import { useSupabase } from "../supabase/hooks";
import { useChatStore } from "../state/chats";

export const useChatList = () => {
  const { wrapper, user } = useSupabase();
  const { chats, addChat } = useChatStore((state) => state);

  const add = async (recipientEmail: string) => {
    if (!wrapper) return;

    const id = await wrapper.db.users.getIDByEmail(recipientEmail);

    if (!id || chats[id]) return;

    const publicKey = await wrapper.db.publicKeys.getPublicKey(id);

    if (!publicKey) return;

    addChat(id, { email: recipientEmail, publicKey });
  };

  const getList = async () => {
    if (!wrapper) return;

    const conversations = await wrapper.db.conversations.getMyConversations();

    for (const convo of conversations) {
      let otherUserID: string | null = null;

      if (convo.user_one !== user?.id) otherUserID = convo.user_one;
      else if (convo.user_two !== user?.id) otherUserID = convo.user_two;

      if (!otherUserID) continue;

      if (chats[otherUserID]) continue;

      const email = await wrapper.db.users.getEmailByID(otherUserID);
      const publicKey = await wrapper.db.publicKeys.getPublicKey(otherUserID);

      if (!email || !publicKey) continue;

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
