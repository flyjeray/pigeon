import { create } from "zustand";

export type ChatterData = {
  email: string;
  pk: string;
};

type ChatState = {
  chatters: Record<string, ChatterData>;

  conversationIDs: Record<string, string>;
  addConversationID: (userID: string, conversationID: string) => void;

  currentChattedUser: string | null;
  selectChattedUser: (id: string | null) => void;

  addChatter: (user_id: string, data: ChatterData) => void;
  removeChatter: (user_id: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  chatters: {},
  conversationIDs: {},
  addConversationID: (userID: string, conversationID: string) =>
    set((state) => ({
      conversationIDs: {
        ...state.conversationIDs,
        [userID]: conversationID,
      },
    })),
  currentChattedUser: null,
  selectChattedUser: (id: string | null) => set({ currentChattedUser: id }),
  addChatter: (user_id: string, data: ChatterData) =>
    set((state) => ({ chatters: { ...state.chatters, [user_id]: data } })),
  removeChatter: (user_id: string) =>
    set((state) => {
      const newChatters = { ...state.chatters };
      delete newChatters[user_id];
      return { chatters: newChatters };
    }),
}));
