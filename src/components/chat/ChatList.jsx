import { motion } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { formatChatTime } from '../../utils/dateUtils';
import { ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolid } from '@heroicons/react/24/solid';

export default function ChatList({ chat, currentUser, index, onClick }) {
  const { onlineUsers } = useChatStore();
  const other = chat.participants?.find((p) => p._id !== currentUser?._id);
  const isOnline = onlineUsers?.includes(other?._id);
  const unread = chat.unreadCount?.[currentUser?._id] || 0;
  const lastMsg = chat.lastMessage;
  const isOwn = lastMsg?.sender?._id === currentUser?._id || lastMsg?.sender === currentUser?._id;

  const getLastMsgPreview = () => {
    if (!lastMsg) return 'Start a conversation';
    if (lastMsg.type === 'image') return '📷 Photo';
    if (lastMsg.type === 'video') return '🎥 Video';
    if (lastMsg.type === 'audio') return '🎤 Voice note';
    if (lastMsg.type === 'file') return '📄 File';
    return lastMsg.text || lastMsg.content || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="flex items-center gap-3 px-3 py-3 mx-2 rounded-xl cursor-pointer transition-all group hover:bg-light-border/50 dark:hover:bg-white/5"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-light-border dark:border-white/5 group-hover:border-primary/30 transition-colors">
          {other?.avatar ? (
            <img src={other.avatar} alt={other.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-base">
              {other?.fullName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-dark-bg" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">
              {other?.fullName}
            </span>
            {other?.trustScore >= 70 && (
              <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">
            {formatChatTime(lastMsg?.createdAt || chat.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            {isOwn && lastMsg && (
              <span className="flex-shrink-0">
                {lastMsg.readBy?.length > 1 ? (
                  <span className="text-indigo-400">
                    <CheckSolid className="w-3.5 h-3.5 inline -mr-1" />
                    <CheckSolid className="w-3.5 h-3.5 inline" />
                  </span>
                ) : (
                  <CheckIcon className="w-3.5 h-3.5 text-slate-400" />
                )}
              </span>
            )}
            <p className={`text-sm truncate ${unread > 0 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500'}`}>
              {getLastMsgPreview()}
            </p>
          </div>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0 ml-2 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}