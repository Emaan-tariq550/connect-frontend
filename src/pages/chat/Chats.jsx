import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useSocketStore } from '../../hooks/useSocket';
import ChatList from '../../components/chat/ChatList';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function Chats() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { chats, fetchChats, loading } = useChatStore();
  const socket = useSocketStore((s) => s.socket);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetchChats();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(chats);
    } else {
      setFiltered(
        chats.filter((chat) => {
          const other = chat.participants?.find((p) => p._id !== user?._id);
          return (
            other?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            other?.username?.toLowerCase().includes(search.toLowerCase())
          );
        })
      );
    }
  }, [search, chats, user]);

  // ✅ new_message aane pe fetchChats dobara call karo
  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchChats();
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, fetchChats]);

  const handleSelect = (chatId) => navigate(`/chat/${chatId}`);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-2xl mx-auto">
        <div className="px-4 pt-6 pb-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-poppins">
                Messages
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {chats.length} conversation{chats.length !== 1 ? 's' : ''}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/friends')}
              className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
              title="New Chat"
            >
              <PencilSquareIcon className="w-5 h-5 text-primary" />
            </motion.button>
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="py-2">
          {loading ? (
            <ChatListSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyChats search={search} onNew={() => navigate('/friends')} />
          ) : (
            <AnimatePresence>
              {filtered.map((chat, i) => (
                <ChatList
                  key={chat._id}
                  chat={chat}
                  currentUser={user}
                  index={i}
                  onClick={() => handleSelect(chat._id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatListSkeleton() {
  return (
    <div className="p-3 space-y-1">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 dark:bg-white/8 rounded-full w-32" />
            <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full w-48" />
          </div>
          <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-8" />
        </div>
      ))}
    </div>
  );
}

function EmptyChats({ search, onNew }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary" />
      </div>
      <p className="text-slate-700 dark:text-slate-300 font-medium">
        {search ? 'No results found' : 'No conversations yet'}
      </p>
      <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
        {search ? 'Try a different search' : 'Start chatting with your friends'}
      </p>
      {!search && (
        <button
          onClick={onNew}
          className="mt-4 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
        >
          Find Friends
        </button>
      )}
    </motion.div>
  );
}