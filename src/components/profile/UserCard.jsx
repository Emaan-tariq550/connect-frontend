import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiUserAdd, HiChatAlt2, HiShieldCheck } from 'react-icons/hi'
import { friendService } from '@/services/friendService'
import { chatService } from '@/services/chatService'
import toast from 'react-hot-toast'

export default function UserCard({ user, showActions = true }) {
  const [requested, setRequested] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msgLoading, setMsgLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await friendService.sendRequest(user._id)
      setRequested(true)
      toast.success(`Request sent to ${user.fullName}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    } finally { setLoading(false) }
  }

  // ✅ Chat open/create karo aur /chat/:chatId pe navigate karo
  const handleMessage = async (e) => {
    e.preventDefault()
    setMsgLoading(true)
    try {
      const res = await chatService.createOrGetChat(user._id)
      const chatId = res.data.chat?._id || res.data._id
      navigate(`/chat/${chatId}`)
    } catch (err) {
      toast.error('Could not open chat')
    } finally { setMsgLoading(false) }
  }

  const trustColor = user?.trustScore >= 90 ? 'text-green-400'
    : user?.trustScore >= 70 ? 'text-blue-400'
    : user?.trustScore >= 50 ? 'text-yellow-400'
    : 'text-red-400'

  return (
    <motion.div whileHover={{ y: -2 }} className="card p-4 flex flex-col gap-3 group">
      <Link to={`/profile/${user.username}`} className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold font-heading text-base overflow-hidden">
            {user.avatar
              ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              : user.fullName?.charAt(0)
            }
          </div>
          {user.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-light-card dark:border-dark-card" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-slate-900 dark:text-white font-body truncate group-hover:text-primary transition-colors">
            {user.fullName}
          </p>
          <p className="text-xs text-dark-muted font-body truncate">@{user.username}</p>
          {user.bio && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-body mt-0.5 line-clamp-1">{user.bio}</p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {user?.trustScore !== undefined && (
          <span className={`flex items-center gap-1 text-[10px] font-medium font-body ${trustColor}`}>
            <HiShieldCheck size={11} />
            {user.trustScore}
          </span>
        )}
        {user?.mutualFriends > 0 && (
          <span className="text-[10px] text-dark-muted font-body">· {user.mutualFriends} mutual</span>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2">
          <motion.button
            onClick={handleSendRequest}
            disabled={requested || loading}
            whileTap={{ scale: 0.97 }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold font-body transition-all
              ${requested
                ? 'bg-light-border dark:bg-dark-border text-dark-muted cursor-default'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
              }`}
          >
            {loading
              ? <span className="w-3.5 h-3.5 border border-current/30 border-t-current rounded-full animate-spin" />
              : <HiUserAdd size={13} />
            }
            {requested ? 'Sent' : 'Add Friend'}
          </motion.button>

          {/* ✅ Link nahi, button — chat create/open karta hai */}
          <motion.button
            onClick={handleMessage}
            disabled={msgLoading}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary text-xs font-semibold font-body transition-all"
          >
            {msgLoading
              ? <span className="w-3.5 h-3.5 border border-current/30 border-t-current rounded-full animate-spin" />
              : <HiChatAlt2 size={13} />
            }
            Message
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}