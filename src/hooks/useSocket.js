import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useCallStore } from '../store/callStore';
import { useNotificationStore } from '../store/notificationStore';
import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
}));

let socketInstance = null;

export function useSocket() {
  const { setSocket } = useSocketStore();
  const { user, accessToken } = useAuthStore();
  const {
    addMessage, setOnlineUsers, addOnlineUser,
    removeOnlineUser, setTypingUser, editMessageInStore,
  } = useChatStore();
  const { setIncomingCall, endCall } = useCallStore();
  const { addNotification, markAsRead } = useNotificationStore();

  useEffect(() => {
    if (!user || !accessToken) return;

    if (socketInstance?.connected) {
      console.log('[Socket] Already connected, reusing:', socketInstance.id);
      setSocket(socketInstance);
      return;
    }

    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    console.log('[Socket] Initializing...');

    const s = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      }
    );

    socketInstance = s;

    s.on('connect', () => {
      console.log('[Socket] Connected:', s.id);
      setSocket(s);
    });

    s.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setSocket(null);
    });

    s.on('reconnect', () => {
      console.log('[Socket] Reconnected:', s.id);
      setSocket(s);
    });

    s.on('online_users', ({ userIds }) => setOnlineUsers(userIds));
    s.on('user_online', ({ userId }) => addOnlineUser(userId));
    s.on('user_offline', ({ userId }) => removeOnlineUser(userId));

    s.on('new_message', (msg) => addMessage(msg));
    s.on('message_edited', ({ msgId, text }) => editMessageInStore(msgId, text));
    s.on('message_deleted', ({ msgId }) => {
      useChatStore.getState().editMessageInStore(msgId, '');
    });

    s.on('typing', ({ chatId, userId }) => setTypingUser(chatId, userId, true));
    s.on('stopTyping', ({ chatId, userId }) => setTypingUser(chatId, userId, false));

    s.on('incoming_call', (call) => {
      console.log('[Socket] incoming_call:', call);
      setIncomingCall(call);
    });

    s.on('call_accepted', ({ callId, by }) => {
      console.log('[Socket] call_accepted by:', by);
    });

    s.on('call_rejected', () => {
      console.log('[Socket] call_rejected');
      endCall(s);
    });

    s.on('call_ended', () => {
      console.log('[Socket] call_ended');
      endCall(s);
    });

    s.on('notification:new', (n) => addNotification(n));
    s.on('notification:read', (id) => markAsRead(id));

    return () => {};
  }, [user?._id, accessToken]);

  useEffect(() => {
    if (!user && socketInstance) {
      console.log('[Socket] User logged out, disconnecting...');
      socketInstance.disconnect();
      socketInstance = null;
      setSocket(null);
    }
  }, [user]);

  return { socket: useSocketStore((s) => s.socket) };
}