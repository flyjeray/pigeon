import { ChatList, ChatWindow } from "../components";
import { useChatStore } from "../state/chats";
import { useSupabase } from "../supabase/hooks";

export const MessagingView = () => {
  const { wrapper } = useSupabase();
  const { currentChattedUser } = useChatStore();

  const handleSignOut = async () => {
    if (!wrapper) return;
    await wrapper.auth.signOut();
  };

  return (
    <div>
      <button onClick={handleSignOut}>Logout</button>
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
    </div>
  );
};
