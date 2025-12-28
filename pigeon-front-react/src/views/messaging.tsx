import {
  Button,
  CenteredColumn,
  CenteredPage,
  ChatList,
  ChatWindow,
} from "../components";
import { useChatStore } from "../state/chats";
import { useSupabase } from "../supabase/hooks";

export const MessagingView = () => {
  const { user, wrapper } = useSupabase();
  const { currentChattedUser } = useChatStore();

  const handleSignOut = async () => {
    if (!wrapper) return;
    await wrapper.auth.signOut();
  };

  return (
    <CenteredPage
      desktopRow
      bottom={
        <CenteredColumn>
          <p style={{ margin: 0 }}>Logged in as {user ? user.email : "..."}</p>
          <Button alt onClick={handleSignOut}>
            Logout
          </Button>
        </CenteredColumn>
      }
    >
      <ChatList />
      {currentChattedUser && <ChatWindow id={currentChattedUser} />}
    </CenteredPage>
  );
};
