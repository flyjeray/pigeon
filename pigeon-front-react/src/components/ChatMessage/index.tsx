import { cn } from "@/lib/utils";

type Props = {
  message: string;
  isOwnMessage: boolean;
};

export const ChatMessage = ({ message, isOwnMessage }: Props) => {
  return (
    <div
      className={cn(
        "max-w-[70%] rounded-lg px-3 py-2 text-sm break-words",
        isOwnMessage
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted text-foreground"
      )}
    >
      {message}
    </div>
  );
};
