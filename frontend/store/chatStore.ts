import { create } from 'zustand';
import { Message, ChatSession } from '@/types';

interface ChatState {
  messages: Message[];
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setCurrentSession: (session: ChatSession | null) => void;
  addSession: (session: ChatSession) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentSession: null,
  sessions: [],
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

  setCurrentSession: (session) => set({ currentSession: session }),

  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));


