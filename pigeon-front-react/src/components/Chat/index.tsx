import { ChatList } from "../ChatList";
import { useChatStore } from "../../state/chats";
import { ChatWindow } from "../ChatWindow";

export const Chat = () => {
  const { currentChattedUser } = useChatStore();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 16,
        width: "100%",
        border: "1px solid purple",
        padding: 8,
      }}
    >
      <ChatList />
      {currentChattedUser && <ChatWindow id={currentChattedUser} />}
    </div>
  );
};
