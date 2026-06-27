import { motion } from "framer-motion";
import {
  MessageSquare, Users, Bell, Search, FileText,
  Hash, Image, UserPlus, Inbox, AlertCircle,
  Wifi, Lock, Star,
} from "lucide-react";

const iconMap = {
  messages: MessageSquare,
  friends: Users,
  notifications: Bell,
  search: Search,
  posts: FileText,
  channels: Hash,
  media: Image,
  requests: UserPlus,
  inbox: Inbox,
  error: AlertCircle,
  offline: Wifi,
  private: Lock,
  starred: Star,
};

const EmptyState = ({
  type = "messages",
  title,
  description,
  action,
  actionLabel,
  icon: CustomIcon,
  size = "md",
  className = "",
}) => {
  const Icon = CustomIcon || iconMap[type] || Inbox;

  const sizeConfig = {
    sm: { icon: 32, wrapper: "py-8", title: "text-sm", desc: "text-xs" },
    md: { icon: 48, wrapper: "py-14", title: "text-base", desc: "text-sm" },
    lg: { icon: 64, wrapper: "py-20", title: "text-lg", desc: "text-sm" },
  };

  const cfg = sizeConfig[size];

  const defaultContent = {
    messages: {
      title: "No messages yet",
      description: "Start a conversation and say hello!",
    },
    friends: {
      title: "No friends yet",
      description: "Search for people you know and connect with them.",
    },
    notifications: {
      title: "All caught up!",
      description: "You have no new notifications right now.",
    },
    search: {
      title: "No results found",
      description: "Try different keywords or check your spelling.",
    },
    posts: {
      title: "No posts yet",
      description: "Be the first to share something with the community.",
    },
    channels: {
      title: "No channels yet",
      description: "Create your first channel to get started.",
    },
    media: {
      title: "No media shared",
      description: "Files and images shared here will appear in this gallery.",
    },
    requests: {
      title: "No pending requests",
      description: "You're all up to date with your friend requests.",
    },
    inbox: {
      title: "Your inbox is empty",
      description: "New messages will show up here.",
    },
    error: {
      title: "Something went wrong",
      description: "We couldn't load this content. Please try again.",
    },
    offline: {
      title: "You're offline",
      description: "Check your internet connection and try again.",
    },
    private: {
      title: "This is private",
      description: "You don't have permission to view this content.",
    },
    starred: {
      title: "No starred messages",
      description: "Star important messages to find them quickly later.",
    },
  };

  const defaults = defaultContent[type] || defaultContent.inbox;
  const finalTitle = title || defaults.title;
  const finalDesc = description || defaults.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center ${cfg.wrapper} px-6 ${className}`}
    >
      {/* Icon with glow rings */}
      <div className="relative mb-5">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
          style={{ margin: "-12px" }}
        />
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center"
        >
          <Icon size={cfg.icon * 0.55} className="text-indigo-400/60" />
        </motion.div>
      </div>

      {/* Text */}
      <h3 className={`font-semibold text-slate-300 mb-1.5 ${cfg.title}`}>
        {finalTitle}
      </h3>
      <p className={`text-slate-600 max-w-xs leading-relaxed ${cfg.desc}`}>
        {finalDesc}
      </p>

      {/* Action button */}
      {action && actionLabel && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={action}
          className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;