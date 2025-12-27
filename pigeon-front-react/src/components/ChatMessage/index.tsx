import styles from "./styles.module.scss";

type Props = {
  message: string;
  isOwnMessage: boolean;
};

export const ChatMessage = ({ message, isOwnMessage }: Props) => {
  return (
    <div
      className={isOwnMessage ? styles.message_own : styles.message_received}
    >
      {message}
    </div>
  );
};
