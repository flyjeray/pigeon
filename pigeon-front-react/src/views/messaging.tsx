import { Bird, LogOut } from "lucide-react";
import { ChatList, ChatWindow } from "@/components";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/state/chats";
import { useSupabase } from "@/supabase/hooks";
import { cn } from "@/lib/utils";

export const MessagingView = () => {
  const { user, wrapper } = useSupabase();
  const { currentChattedUser } = useChatStore();

  const handleSignOut = async () => {
    if (!wrapper) return;
    await wrapper.auth.signOut();
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Bird className="size-5" />
          Pigeon
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Logged in as {user ? user.email : "..."}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut />
            Logout
          </Button>
        </div>
      </header>

      <Separator />

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "w-full border-r border-border sm:max-w-[280px]",
            currentChattedUser && "hidden sm:block"
          )}
        >
          <ChatList />
        </aside>
        <main className={cn("flex-1", !currentChattedUser && "hidden sm:flex")}>
          {currentChattedUser ? (
            <ChatWindow id={currentChattedUser} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
