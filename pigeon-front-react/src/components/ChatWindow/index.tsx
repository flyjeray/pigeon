import { useChatStore } from "../../state/chats";
import { useChatMessages } from "../../hooks/useChatMessages";
import { Container } from "../Container";
import { ChatMessage } from "../ChatMessage";
import styles from "./styles.module.scss";
import { Row } from "../Row";
import { Input } from "../Input";
import { Button } from "../Button";
import { HorizontalDivider } from "../HorizontalDivider";
import { useEffect, useRef } from "react";

type Props = {
  id: string;
};

export const ChatWindow = ({ id }: Props) => {
  const { chats } = useChatStore((state) => state);
  const { messages, decrypted, send } = useChatMessages(
    id,
    chats[id].publicKey
  );
  const messagesDivRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = formData.get("message") as string;
    await send(message);
    form.reset();
  };

  useEffect(() => {
    if (messagesDivRef.current) {
      messagesDivRef.current.scrollTop =
        messagesDivRef.current.scrollHeight -
        messagesDivRef.current.clientHeight;
    }
  }, [messages]);

  return (
    <Container light>
      {messages.length > 0 && (
        <div className={styles.messages} ref={messagesDivRef}>
          {messages.map((msg) => (
            <ChatMessage
              key={`msg-${msg.id}`}
              isOwnMessage={msg.sender !== id}
              message={decrypted[msg.id] || "Decrypting..."}
            />
          ))}
        </div>
      )}

      {messages.length > 0 && <HorizontalDivider />}

      <form onSubmit={handleSendMessage}>
        <Row>
          <Input
            defaultValue=""
            type="text"
            name="message"
            placeholder="Type a message"
          />
          <Button type="submit" style={{ flex: 1 }}>
            Send
          </Button>
        </Row>
      </form>
    </Container>
  );
};
