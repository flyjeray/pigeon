import { useChatStore } from "../../state/chats";
import { useChatList } from "../../hooks/useChatList";
import { Container } from "../Container";
import { Button } from "../Button";
import { HorizontalDivider } from "../HorizontalDivider";
import { Input } from "../Input";
import { Row } from "../Row";

export const ChatList = () => {
  const { currentChattedUser, selectChattedUser: setCurrentChatID } =
    useChatStore((state) => state);
  const { add, chats } = useChatList();

  const handleNewChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const recipientEmail = formData.get("recipientEmail") as string;
    await add(recipientEmail);
  };

  return (
    <Container>
      <form onSubmit={handleNewChatSubmit}>
        <Row>
          <Input
            type="email"
            name="recipientEmail"
            placeholder="New Recipient Email"
            required
          />
          <Button style={{ flex: 1 }} type="submit">
            Add chatter
          </Button>
        </Row>
      </form>

      <HorizontalDivider />

      {Object.entries(chats).map(([user_id, chat]) => (
        <Button
          onClick={() => setCurrentChatID(user_id)}
          key={`chat-${user_id}`}
          disabled={currentChattedUser === user_id}
        >
          {chat.email}
        </Button>
      ))}
    </Container>
  );
};
