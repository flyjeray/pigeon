import { Button, CenteredPage, ChatList, ChatWindow, Row } from "../components";
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
    <CenteredPage
      bottom={
        <Button alt onClick={handleSignOut}>
          Logout
        </Button>
      }
    >
      <Row>
        <ChatList />
        {currentChattedUser && <ChatWindow id={currentChattedUser} />}
      </Row>
    </CenteredPage>
  );
};
