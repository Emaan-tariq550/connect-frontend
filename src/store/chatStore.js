import { create } from 'zustand';
import {
  getMyChats,
  createOrGetChat,
  getChatById,
  getMessages,
  sendMessage as sendMessageApi,
  deleteMessage as deleteMessageApi,
  editMessage as editMessageApi,
  reactToMessage as reactApi,
  markMessagesRead,
} from '../api/chat';
import toast from 'react-hot-toast';

export const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  msgLoading: false,
  typingUsers: {},
  onlineUsers: [],

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (userId) =>
    set((s) => ({
      onlineUsers: s.onlineUsers.includes(userId)
        ? s.onlineUsers
        : [...s.onlineUsers, userId],
    })),

  removeOnlineUser: (userId) =>
    set((s) => ({
      onlineUsers: s.onlineUsers.filter((id) => id !== userId),
    })),

  setTypingUser: (chatId, userId, isTyping) =>
    set((s) => {
      const prev = s.typingUsers[chatId] || [];
      return {
        typingUsers: {
          ...s.typingUsers,
          [chatId]: isTyping
            ? [...new Set([...prev, userId])]
            : prev.filter((id) => id !== userId),
        },
      };
    }),

  fetchChats: async () => {
    set({ loading: true });
    try {
      const { data } = await getMyChats();
      set({ chats: data?.chats || data || [] });
    } catch {
      toast.error('Failed to load chats');
    } finally {
      set({ loading: false });
    }
  },

  fetchChat: async (chatId) => {
    set({ loading: true });
    try {
      const { data } = await getChatById(chatId);
      set({ currentChat: data?.chat || data });
    } catch {
      toast.error('Failed to load chat');
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (chatId, page = 1) => {
    set({ msgLoading: true });
    try {
      const { data } = await getMessages(chatId, page);
      const msgs = data?.messages || data || [];
      set((s) => ({
        messages: page === 1 ? msgs : [...msgs, ...s.messages],
      }));
      return data;
    } catch {
      toast.error('Failed to load messages');
    } finally {
      set({ msgLoading: false });
    }
  },

  sendMessage: async (chatId, formData, socket) => {
    try {
      const { data } = await sendMessageApi(chatId, formData);
      const msg = data?.message || data;
      set((s) => ({
        messages: [...s.messages, msg],
        chats: s.chats.map((c) =>
          c._id === chatId ? { ...c, lastMessage: msg } : c
        ),
      }));
      return msg;
    } catch {
      toast.error('Failed to send message');
    }
  },

  addMessage: (msg) => {
    set((s) => {
      const exists = s.messages.some((m) => m._id === msg._id);
      if (exists) return s;
      return { messages: [...s.messages, msg] };
    });
    const chatId = msg.chatId || msg.chat?._id || msg.chat;
    set((s) => ({
      chats: s.chats.map((c) =>
        c._id === chatId ? { ...c, lastMessage: msg } : c
      ),
    }));
  },

  deleteMessage: async (messageId, chatId, socket) => {
    try {
      await deleteMessageApi(messageId);
      set((s) => ({
        messages: s.messages.map((m) =>
          m._id === messageId ? { ...m, deleted: true, text: '' } : m
        ),
      }));
      socket?.emit('delete_message', { msgId: messageId, chatId });
    } catch {
      toast.error('Failed to delete message');
    }
  },

  editMessageInStore: (messageId, text) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m._id === messageId ? { ...m, text, edited: true } : m
      ),
    }));
  },

  reactToMessage: async (messageId, emoji, chatId, socket) => {
    try {
      const { data } = await reactApi(messageId, emoji);
      const reactions = data?.reactions || [];
      set((s) => ({
        messages: s.messages.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      }));
      socket?.emit('react_message', { msgId: messageId, chatId, emoji });
    } catch {
      toast.error('Failed to react');
    }
  },

  markRead: async (chatId) => {
    try {
      await markMessagesRead(chatId);
      set((s) => ({
        chats: s.chats.map((c) =>
          c._id === chatId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    } catch {
      // silent
    }
  },

  clearCurrentChat: () => set({ currentChat: null, messages: [] }),
}));