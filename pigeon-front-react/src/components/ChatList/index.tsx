import { useSupabase } from "../../supabase/hooks";
import { useChatStore, type ChatterData } from "../../state/chats";
import { useEffect } from "react";

export const ChatList = () => {
  const { wrapper, user } = useSupabase();
  const {
    chatters,
    addChatter,
    selectChattedUser: setCurrentChatID,
  } = useChatStore((state) => state);

  const handleNewChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!wrapper) return;

    const formData = new FormData(e.currentTarget);
    const recipientEmail = formData.get("recipientEmail") as string;
    const id = await wrapper.db.users.getIDByEmail(recipientEmail);

    if (!id || chatters[id]) return;

    const key = await wrapper.db.publicKeys.getPublicKey(id);

    if (!key) return;

    addChatter(id, { email: recipientEmail, pk: key });
  };

  const getChatterList = async () => {
    if (!wrapper) return;

    const conversations = await wrapper.db.conversations.getMyConversations();

    let chatter: ChatterData | null = null;

    for (const convo of conversations) {
      let otherUserID: string | null = null;

      if (convo.user_one !== user?.id) otherUserID = convo.user_one;
      else if (convo.user_two !== user?.id) otherUserID = convo.user_two;

      if (!otherUserID) continue;

      if (chatters[otherUserID]) continue;

      const email = await wrapper.db.users.getEmailByID(otherUserID);
      const pk = await wrapper.db.publicKeys.getPublicKey(otherUserID);

      if (!email || !pk) continue;

      chatter = { email, pk };
      addChatter(otherUserID, chatter);
    }
  };

  useEffect(() => {
    getChatterList();
  }, []);

  return (
    <div style={{ padding: 8, border: "1px solid green" }}>
      <p>Chats</p>
      <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
        <form onSubmit={handleNewChatSubmit}>
          <input
            type="email"
            name="recipientEmail"
            placeholder="New Recipient Email"
            required
          />
          <button type="submit">Add chatter</button>
        </form>
      </div>
      {Object.entries(chatters).map(([user_id, chatter]) => (
        <button
          onClick={() => setCurrentChatID(user_id)}
          key={`chat-${user_id}`}
        >
          {chatter.email}
        </button>
      ))}
    </div>
  );
};
