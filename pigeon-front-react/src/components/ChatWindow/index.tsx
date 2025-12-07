import { useChatStore } from "../../state/chats";
import { useChatMessages } from "../../hooks/useChatMessages";

type Props = {
  id: string;
};

export const ChatWindow = ({ id }: Props) => {
  const { chats } = useChatStore((state) => state);
  const { messages, decrypted, send } = useChatMessages(
    id,
    chats[id].publicKey
  );

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    await send(message);
    e.currentTarget.reset();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid yellow",
      }}
    >
      <p>{chats[id].email}</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflowY: "auto",
          justifyContent: "end",
          alignItems: "flex-start",
        }}
      >
        {messages.map((msg) => (
          <div key={`msg-${msg.id}`} style={{ margin: 4 }}>
            <p>{decrypted[msg.id] || "Decrypting..."}</p>
          </div>
        ))}
      </div>
      <form
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 8,
        }}
        onSubmit={handleSendMessage}
      >
        <input type="text" name="message" placeholder="Type a message" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
