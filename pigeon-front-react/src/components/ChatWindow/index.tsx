import { useEffect, useRef } from "react";
import { ArrowLeft, SendHorizontal } from "lucide-react";
import { useChatStore } from "@/state/chats";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  id: string;
};

export const ChatWindow = ({ id }: Props) => {
  const { chats, selectChattedUser } = useChatStore((state) => state);
  const { messages, decrypted, send, isLoadingMessages } = useChatMessages(
    id,
    chats[id].publicKey
  );
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = formData.get("message") as string;
    if (!message) return;
    await send(message);
    form.reset();
  };

  useEffect(() => {
    const viewport = viewportRef.current?.closest(
      "[data-slot=scroll-area-viewport]"
    );
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Back to chat list"
          onClick={() => selectChattedUser(null)}
        >
          <ArrowLeft />
        </Button>
        <Avatar size="sm">
          <AvatarFallback>
            {chats[id].email.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">{chats[id].email}</span>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div ref={viewportRef} className="flex flex-col gap-3 p-3">
          {isLoadingMessages && (
            <p className="text-center text-sm text-muted-foreground">
              Loading messages…
            </p>
          )}
          {!isLoadingMessages && messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No messages yet. Say hello!
            </p>
          )}
          {messages.map((msg) => (
            <ChatMessage
              key={`msg-${msg.id}`}
              isOwnMessage={msg.sender !== id}
              message={decrypted[msg.id] || "Decrypting..."}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <form onSubmit={handleSendMessage} className="flex gap-2 p-3">
        <Input
          defaultValue=""
          type="text"
          name="message"
          placeholder="Type a message"
          autoComplete="off"
        />
        <Button type="submit" size="icon" aria-label="Send message">
          <SendHorizontal />
        </Button>
      </form>
    </div>
  );
};
