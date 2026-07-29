import { UserPlus } from "lucide-react";
import { useChatStore } from "@/state/chats";
import { useChatList } from "@/hooks/useChatList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const ChatList = () => {
  const { currentChattedUser, selectChattedUser: setCurrentChatID } =
    useChatStore((state) => state);
  const { add, chats, error } = useChatList();

  const handleNewChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(e.currentTarget);
    const recipientEmail = formData.get("recipientEmail") as string;
    await add(recipientEmail);
    form.reset();
  };

  const entries = Object.entries(chats);

  return (
    <div className="flex h-full w-full flex-col gap-3 p-3">
      <form onSubmit={handleNewChatSubmit} className="flex gap-2">
        <Input
          type="email"
          name="recipientEmail"
          placeholder="New Contact Email"
          required
        />
        <Button type="submit" size="icon" aria-label="Add contact">
          <UserPlus />
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {entries.length > 0 && <Separator />}

      <ScrollArea className="-mx-3 flex-1">
        <div className="flex flex-col gap-1 px-3">
          {entries.map(([user_id, chat]) => {
            const isActive = currentChattedUser === user_id;
            return (
              <button
                key={`chat-${user_id}`}
                onClick={() => setCurrentChatID(user_id)}
                disabled={isActive}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors disabled:cursor-default",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Avatar size="sm">
                  <AvatarFallback>
                    {chat.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{chat.email}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
