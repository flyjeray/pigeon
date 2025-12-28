import { create } from "zustand";

export type Chat = {
  email: string;
  publicKey: string;
  conversationId?: string;
};

type ChatState = {
  chats: Record<string, Chat>;

  currentChattedUser: string | null;
  selectChattedUser: (id: string | null) => void;

  addChat: (userId: string, chat: Chat) => void;
  updateConversationId: (userId: string, conversationId: string) => void;
  removeChat: (userId: string) => void;
  clear: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  chats: {},
  currentChattedUser: null,
  selectChattedUser: (id: string | null) => set({ currentChattedUser: id }),
  addChat: (userId: string, chat: Chat) =>
    set((state) => ({ chats: { ...state.chats, [userId]: chat } })),
  updateConversationId: (userId: string, conversationId: string) =>
    set((state) => {
      const chat = state.chats[userId];
      if (!chat) return state;
      return {
        chats: {
          ...state.chats,
          [userId]: { ...chat, conversationId },
        },
      };
    }),
  removeChat: (userId: string) =>
    set((state) => {
      const newChats = { ...state.chats };
      delete newChats[userId];
      return { chats: newChats };
    }),
  clear: () => set({ chats: {}, currentChattedUser: null }),
}));
