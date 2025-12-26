import {
  Button,
  CenteredColumn,
  CenteredPage,
  ChatList,
  ChatWindow,
  Row,
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
      bottom={
        <CenteredColumn>
          <p style={{ margin: 0 }}>Logged in as {user ? user.email : "..."}</p>
          <Button alt onClick={handleSignOut}>
            Logout
          </Button>
        </CenteredColumn>
      }
    >
      <Row>
        <ChatList />
        {currentChattedUser && <ChatWindow id={currentChattedUser} />}
      </Row>
    </CenteredPage>
  );
};
