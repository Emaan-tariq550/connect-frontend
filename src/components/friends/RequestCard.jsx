import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCheck, HiX, HiShieldCheck } from 'react-icons/hi'
import { useFriendStore } from '@/store/friendStore'
import toast from 'react-hot-toast'

export default function RequestCard({ request, type }) {
  const { acceptRequest, rejectRequest, cancelRequest } = useFriendStore()
  const [loading, setLoading] = useState(null)

  const person = type === 'incoming' ? request.sender : request.receiver

  const handleAccept = async () => {
    setLoading('accept')
    try {
      await acceptRequest(person._id)
      toast.success(`You and ${person.fullName} are now friends! 🎉`)
    } catch { toast.error('Failed to accept request') }
    finally { setLoading(null) }
  }

  const handleReject = async () => {
    setLoading('reject')
    try {
      await rejectRequest(person._id)
      toast.success('Request declined')
    } catch { toast.error('Failed to decline request') }
    finally { setLoading(null) }
  }

  const handleCancel = async () => {
    setLoading('cancel')
    try {
      await cancelRequest(person._id)
      toast.success('Request cancelled')
    } catch { toast.error('Failed to cancel request') }
    finally { setLoading(null) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-4 flex items-center gap-3"
    >
      <Link to={`/profile/${person.username}`} className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold font-heading overflow-hidden">
          {person.avatar
            ? <img src={person.avatar} alt={person.fullName} className="w-full h-full object-cover" />
            : person.fullName?.charAt(0)
          }
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/profile/${person.username}`}>
          <p className="text-sm font-semibold text-slate-900 dark:text-white font-body hover:text-primary transition-colors truncate">
            {person.fullName}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-xs text-dark-muted font-body">@{person.username}</p>
          {person?.mutualFriends > 0 && (
            <span className="text-[10px] text-dark-muted font-body">· {person.mutualFriends} mutual</span>
          )}
        </div>
        {type === 'incoming' && request.createdAt && (
          <p className="text-[10px] text-dark-muted font-body mt-0.5">
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {type === 'incoming' ? (
          <>
            <motion.button
              onClick={handleAccept}
              disabled={!!loading}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold font-body hover:bg-primary-hover transition-all shadow-md shadow-primary/25 disabled:opacity-60"
            >
              {loading === 'accept'
                ? <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                : <HiCheck size={14} />
              }
              Accept
            </motion.button>
            <motion.button
              onClick={handleReject}
              disabled={!!loading}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-light-border dark:border-dark-border text-dark-muted hover:text-red-400 hover:border-red-400 text-xs font-semibold font-body transition-all disabled:opacity-60"
            >
              {loading === 'reject'
                ? <span className="w-3.5 h-3.5 border border-current/30 border-t-current rounded-full animate-spin" />
                : <HiX size={14} />
              }
              Decline
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={handleCancel}
            disabled={!!loading}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-light-border dark:border-dark-border text-dark-muted hover:text-red-400 hover:border-red-400 text-xs font-semibold font-body transition-all disabled:opacity-60"
          >
            {loading === 'cancel'
              ? <span className="w-3.5 h-3.5 border border-current/30 border-t-current rounded-full animate-spin" />
              : <HiX size={14} />
            }
            Cancel
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}