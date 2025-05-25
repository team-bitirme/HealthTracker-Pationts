import { create } from 'zustand';
import { Message } from '~/components/MessagesPreview';

export interface MessageWithStatus extends Message {
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isOwn?: boolean;
}

interface MessagesState {
  messages: MessageWithStatus[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMessages: (messages: MessageWithStatus[]) => void;
  addMessage: (message: MessageWithStatus) => void;
  updateMessageStatus: (messageId: string, status: MessageWithStatus['status']) => void;
  markAsRead: (messageId: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateMessageStatus: (messageId, status) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    )
  })),
  
  markAsRead: (messageId) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, isUnread: false } : msg
    )
  })),
  
  clearMessages: () => set({ messages: [] }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
})); 