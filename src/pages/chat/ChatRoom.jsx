import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useCallStore } from '../../store/callStore';
import { useSocketStore } from '../../hooks/useSocket';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';
import {
  ArrowLeftIcon, PhoneIcon, VideoCameraIcon,
  EllipsisVerticalIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { formatLastSeen } from '../../utils/dateUtils';

export default function ChatRoom() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentChat, messages, fetchChat, fetchMessages,
    sendMessage, typingUsers, loading, msgLoading,
    addMessage, markRead, onlineUsers,
  } = useChatStore();
  const { initiateCall } = useCallStore();
  const socket = useSocketStore((s) => s.socket);

  const bottomRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef(null);

  const otherUser = currentChat?.participants?.find((p) => p._id !== user?._id);
  const isOnline = onlineUsers?.includes(otherUser?._id);
  const isTyping = typingUsers[chatId]?.some((id) => id !== user?._id);

  useEffect(() => {
    if (!chatId) return;
    fetchChat(chatId);
    fetchMessages(chatId, 1).then((res) => setHasMore(res?.hasMore ?? false));
    setPage(1);
    setHasMore(true);
    markRead(chatId);
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit('joinChat', chatId);
    return () => socket.emit('leaveChat', chatId);
  }, [socket, chatId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.chatId === chatId || msg.chat === chatId || msg.chat?._id === chatId) {
        addMessage(msg);
        markRead(chatId);
      }
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, chatId, addMessage, markRead]);

  useEffect(() => {
    if (page === 1) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, page]);

  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || msgLoading) return;
    if (listRef.current.scrollTop < 80) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(chatId, nextPage).then((res) => setHasMore(res?.hasMore ?? false));
    }
  }, [chatId, hasMore, msgLoading, page, fetchMessages]);

  const handleSend = async (content, file, type) => {
    const formData = new FormData();
    if (content) formData.append('text', content);
    if (file) formData.append('file', file);
    if (type) formData.append('type', type);
    if (replyTo) formData.append('replyTo', replyTo._id);
    await sendMessage(chatId, formData, socket);
    setReplyTo(null);
    setEditMsg(null);
  };

  const handleTyping = (typing) => {
    if (!socket) return;
    socket.emit(typing ? 'typing' : 'stopTyping', { chatId, userId: user._id });
  };

  const handleVoiceCall = async () => {
    console.log('1. Voice button clicked');
    console.log('2. otherUser:', otherUser?._id);
    console.log('3. socket id:', socket?.id);
    console.log('4. socket connected:', socket?.connected);

    if (!otherUser?._id) {
      console.log('❌ STOPPED: otherUser missing');
      return;
    }
    if (!socket) {
      console.log('❌ STOPPED: socket missing');
      return;
    }

    console.log('5. Calling initiateCall (voice)...');
    const call = await initiateCall(otherUser._id, otherUser, 'voice', socket);
    console.log('6. initiateCall result:', call);

    if (call) navigate(`/call/${call._id}`);
  };

  const handleVideoCall = async () => {
    console.log('1. Video button clicked');
    console.log('2. otherUser:', otherUser?._id);
    console.log('3. socket id:', socket?.id);
    console.log('4. socket connected:', socket?.connected);

    if (!otherUser?._id) {
      console.log('❌ STOPPED: otherUser missing');
      return;
    }
    if (!socket) {
      console.log('❌ STOPPED: socket missing');
      return;
    }

    console.log('5. Calling initiateCall (video)...');
    const call = await initiateCall(otherUser._id, otherUser, 'video', socket);
    console.log('6. initiateCall result:', call);

    if (call) navigate(`/call/${call._id}`);
  };

  if (loading && !currentChat) return <ChatRoomSkeleton />;

  return (
    <div className="flex flex-col h-full bg-[#0F172A]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0F172A] sticky top-0 z-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/chat')}
          className="p-1.5 rounded-lg hover:bg-white/8 transition-colors md:hidden">
          <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
        </motion.button>

        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/30">
            {otherUser?.avatar
              ? <img src={otherUser.avatar} alt={otherUser.fullName} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {otherUser?.fullName?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0F172A]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-white text-sm truncate">{otherUser?.fullName}</p>
            {otherUser?.trustScore >= 70 && (
              <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}
          </div>
          <AnimatePresence mode="wait">
            {isTyping
              ? <motion.p key="typing" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-indigo-400 font-medium">typing...</motion.p>
              : <motion.p key="status" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className={`text-xs ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isOnline ? 'Online' : formatLastSeen(otherUser?.lastSeen)}
                </motion.p>
            }
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceCall}
            className="p-2 rounded-xl hover:bg-white/8 transition-colors text-slate-400 hover:text-indigo-400"
          >
            <PhoneIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleVideoCall}
            className="p-2 rounded-xl hover:bg-white/8 transition-colors text-slate-400 hover:text-indigo-400"
          >
            <VideoCameraIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-white/8 transition-colors text-slate-400"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 60%)`,
        }}
      >
        {msgLoading && page > 1 && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {messages.length === 0 && !msgLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-3">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-slate-400 text-sm">
              Say hello to {otherUser?.fullName?.split(' ')[0]}!
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const showAvatar = !prevMsg || prevMsg.sender?._id !== msg.sender?._id;
            const isOwn = msg.sender?._id === user?._id;
            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onReply={() => setReplyTo(msg)}
                onEdit={() => setEditMsg(msg)}
                currentUser={user}
                socket={socket}
                chatId={chatId}
              />
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        editMsg={editMsg}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditMsg(null)}
        chatId={chatId}
      />
    </div>
  );
}

function ChatRoomSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#0F172A] animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-white/8" />
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-white/8 rounded-full" />
          <div className="h-2.5 w-16 bg-white/5 rounded-full" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
            <div className="h-10 w-48 bg-white/5 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}