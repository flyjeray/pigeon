import { useChatStore } from "../../state/chats";
import { useChatList } from "../../hooks/useChatList";

export const ChatList = () => {
  const { selectChattedUser: setCurrentChatID } = useChatStore(
    (state) => state
  );
  const { add, chats } = useChatList();

  const handleNewChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const recipientEmail = formData.get("recipientEmail") as string;
    await add(recipientEmail);
  };

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
      {Object.entries(chats).map(([user_id, chat]) => (
        <button
          onClick={() => setCurrentChatID(user_id)}
          key={`chat-${user_id}`}
        >
          {chat.email}
        </button>
      ))}
    </div>
  );
};
