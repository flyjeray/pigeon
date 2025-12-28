import { useChatStore } from "../../state/chats";
import { useChatList } from "../../hooks/useChatList";
import { Container } from "../Container";
import { Button } from "../Button";
import { HorizontalDivider } from "../HorizontalDivider";
import { Input } from "../Input";
import { Row } from "../Row";
import styles from "./styles.module.scss";

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
        <Row mobileColumn>
          <Input
            type="email"
            name="recipientEmail"
            placeholder="New Contact Email"
            required
          />
          <Button style={{ flex: 1 }} type="submit">
            Add
          </Button>
        </Row>
      </form>

      {Object.entries(chats).length > 0 && <HorizontalDivider />}

      <div className={styles.contact_list}>
        {Object.entries(chats).map(([user_id, chat]) => (
          <Button
            onClick={() => setCurrentChatID(user_id)}
            key={`chat-${user_id}`}
            disabled={currentChattedUser === user_id}
          >
            {chat.email}
          </Button>
        ))}
      </div>
    </Container>
  );
};
