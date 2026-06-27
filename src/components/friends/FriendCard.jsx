import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiChatAlt2, HiDotsVertical, HiUserRemove, HiShieldCheck } from 'react-icons/hi'
import { useFriendStore } from '@/store/friendStore'
import toast from 'react-hot-toast'

export default function FriendCard({ friend }) {
  const { removeFriend } = useFriendStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    setRemoving(true)
    try {
      await removeFriend(friend._id)
      toast.success(`${friend.fullName} removed from friends`)
    } catch { toast.error('Failed to remove friend') }
    finally { setRemoving(false); setMenuOpen(false) }
  }

  const trustColor = friend?.trustScore >= 90 ? 'text-green-400'
    : friend?.trustScore >= 70 ? 'text-blue-400'
    : 'text-yellow-400'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-4 flex items-center gap-3 group"
    >
      <Link to={`/profile/${friend.username}`} className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold font-heading overflow-hidden">
          {friend.avatar
            ? <img src={friend.avatar} alt={friend.fullName} className="w-full h-full object-cover" />
            : friend.fullName?.charAt(0)
          }
        </div>
        {friend.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-light-card dark:border-dark-card" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/profile/${friend.username}`}>
          <p className="text-sm font-semibold text-slate-900 dark:text-white font-body truncate hover:text-primary transition-colors">
            {friend.fullName}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-xs text-dark-muted font-body truncate">@{friend.username}</p>
          {friend?.trustScore !== undefined && (
            <span className={`flex items-center gap-0.5 text-[10px] font-medium font-body ${trustColor}`}>
              <HiShieldCheck size={10} /> {friend.trustScore}
            </span>
          )}
        </div>
        {friend.statusMessage && (
          <p className="text-[10px] text-dark-muted font-body truncate mt-0.5 italic">"{friend.statusMessage}"</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          to={`/messages/${friend._id}`}
          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
          title="Send message"
        >
          <HiChatAlt2 size={15} />
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white opacity-0 group-hover:opacity-100"
          >
            <HiDotsVertical size={15} />
          </button>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 w-36 card shadow-xl z-20 py-1"
            >
              <Link
                to={`/profile/${friend.username}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-light-border/50 dark:hover:bg-dark-border/50 font-body"
              >
                View Profile
              </Link>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-body"
              >
                {removing
                  ? <span className="w-3 h-3 border border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  : <HiUserRemove size={12} />
                }
                Unfriend
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}