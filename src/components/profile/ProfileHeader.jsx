import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiCamera, HiPencil, HiUserAdd, HiChatAlt2,
  HiShieldCheck, HiBadgeCheck, HiDotsVertical,
  HiUserRemove, HiBan,
} from 'react-icons/hi'
import { useAuthStore } from '@/store/authStore'
import { friendService } from '@/services/friendService'
import { userService } from '@/services/userService'
import { chatService } from '@/services/chatService'
import toast from 'react-hot-toast'

const TRUST_LABEL = (score) => {
  if (score >= 90) return { label: 'Trusted', color: 'text-green-400', bg: 'bg-green-400/10' }
  if (score >= 70) return { label: 'Reliable', color: 'text-blue-400', bg: 'bg-blue-400/10' }
  if (score >= 50) return { label: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
  return { label: 'Suspicious', color: 'text-red-400', bg: 'bg-red-400/10' }
}

export default function ProfileHeader({ profile, isOwn, friendshipStatus, onRefresh }) {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const [uploading, setUploading] = useState({ avatar: false, cover: false })
  const [actionLoading, setActionLoading] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const trust = TRUST_LABEL(profile?.trustScore || 0)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    setUploading((p) => ({ ...p, avatar: true }))
    try {
      const res = await userService.uploadAvatar(formData)
      updateUser({ avatar: res.data.avatar })
      onRefresh?.()
      toast.success('Profile picture updated!')
    } catch { toast.error('Upload failed') }
    finally { setUploading((p) => ({ ...p, avatar: false })) }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('cover', file)
    setUploading((p) => ({ ...p, cover: true }))
    try {
      const res = await userService.uploadCover(formData)
      updateUser({ coverPhoto: res.data.coverPhoto })
      onRefresh?.()
      toast.success('Cover photo updated!')
    } catch { toast.error('Upload failed') }
    finally { setUploading((p) => ({ ...p, cover: false })) }
  }

  const handleFriendAction = async () => {
    setActionLoading(true)
    try {
      if (friendshipStatus === 'none') {
        await friendService.sendRequest(profile._id)
        toast.success('Friend request sent!')
      } else if (friendshipStatus === 'pending_sent') {
        await friendService.cancelRequest(profile._id)
        toast.success('Request cancelled')
      } else if (friendshipStatus === 'pending_received') {
        await friendService.acceptRequest(profile._id)
        toast.success('Friend request accepted!')
      } else if (friendshipStatus === 'friends') {
        await friendService.removeFriend(profile._id)
        toast.success('Friend removed')
      }
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally { setActionLoading(false) }
  }

  // ✅ FIX: Message button — chat banana ya existing open karna
  const handleMessage = async () => {
    if (!profile?._id) return
    setMessageLoading(true)
    try {
      const res = await chatService.createOrGetChat(profile._id)
      const chatId = res.data?.chat?._id || res.data?._id
      if (!chatId) throw new Error('No chat ID')
      navigate(`/chat/${chatId}`)
    } catch (err) {
      toast.error('Could not open chat. Please try again.')
    } finally {
      setMessageLoading(false)
    }
  }

  const friendBtnConfig = {
    none: { label: 'Add Friend', icon: HiUserAdd, variant: 'primary' },
    pending_sent: { label: 'Request Sent', icon: HiUserAdd, variant: 'secondary' },
    pending_received: { label: 'Accept Request', icon: HiUserAdd, variant: 'green' },
    friends: { label: 'Friends', icon: HiBadgeCheck, variant: 'secondary' },
  }

  const btnCfg = friendBtnConfig[friendshipStatus] || friendBtnConfig.none

  return (
    <div className="card overflow-hidden">
      {/* Cover photo */}
      <div className="relative h-40 md:h-52 bg-gradient-to-r from-primary via-accent-purple to-accent-cyan overflow-hidden group">
        {profile?.coverPhoto && (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {isOwn && (
          <>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
            >
              {uploading.cover
                ? <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                : <HiCamera size={14} />
              }
              Edit Cover
            </button>
          </>
        )}
      </div>

      {/* Profile info row */}
      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-14 mb-4">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-light-card dark:border-dark-card bg-gradient-primary flex items-center justify-center text-white font-heading font-bold text-3xl overflow-hidden shadow-xl">
              {profile?.avatar
                ? <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover" />
                : profile?.fullName?.charAt(0)
              }
            </div>
            {profile?.isOnline && (
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-light-card dark:border-dark-card" />
            )}
            {isOwn && (
              <>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  {uploading.avatar
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <HiCamera className="text-white" size={22} />
                  }
                </button>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-16">
            {isOwn ? (
              <Link
                to="/settings/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary text-sm font-medium font-body transition-all"
              >
                <HiPencil size={15} />
                Edit Profile
              </Link>
            ) : (
              <>
                <motion.button
                  onClick={handleFriendAction}
                  disabled={actionLoading}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-body transition-all
                    ${btnCfg.variant === 'primary' ? 'bg-gradient-primary text-white shadow-lg shadow-primary/25 hover:opacity-90' :
                      btnCfg.variant === 'green' ? 'bg-green-500 text-white hover:bg-green-600' :
                      'border border-light-border dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary'
                    }`}
                >
                  {actionLoading
                    ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    : <btnCfg.icon size={15} />
                  }
                  {btnCfg.label}
                </motion.button>

                {/* ✅ FIX: Link ki jagah button — chatService se chat open karo */}
                <motion.button
                  onClick={handleMessage}
                  disabled={messageLoading}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-sm font-semibold font-body transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {messageLoading
                    ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    : <HiChatAlt2 size={15} />
                  }
                  Message
                </motion.button>

                {/* More options */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-xl border border-light-border dark:border-dark-border text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition-all"
                  >
                    <HiDotsVertical size={16} />
                  </button>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-1 w-40 card shadow-xl z-20 py-1"
                    >
                      {friendshipStatus === 'friends' && (
                        <button
                          onClick={async () => { await friendService.removeFriend(profile._id); onRefresh?.(); setMenuOpen(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors font-body"
                        >
                          <HiUserRemove size={14} /> Unfriend
                        </button>
                      )}
                      <button
                        onClick={async () => { await friendService.blockUser(profile._id); navigate('/dashboard'); toast.success('User blocked') }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-body"
                      >
                        <HiBan size={14} /> Block User
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Name + details */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading font-bold text-xl md:text-2xl text-slate-900 dark:text-white">
              {profile?.fullName}
            </h1>
            {profile?.isVerified && (
              <HiBadgeCheck className="text-primary" size={20} title="Verified" />
            )}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full font-body ${trust.bg} ${trust.color}`}>
              <HiShieldCheck className="inline mr-1" size={11} />
              {trust.label} · {profile?.trustScore ?? 0}
            </span>
          </div>
          <p className="text-dark-muted text-sm font-body">@{profile?.username}</p>
          {profile?.bio && (
            <p className="text-slate-700 dark:text-slate-300 text-sm font-body leading-relaxed max-w-xl">
              {profile.bio}
            </p>
          )}
          {profile?.statusMessage && (
            <p className="text-dark-muted text-xs font-body italic">"{profile.statusMessage}"</p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {profile?.location && (
              <span className="text-xs text-dark-muted font-body">📍 {profile.location}</span>
            )}
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-body">
                🔗 {profile.website.replace(/https?:\/\//, '')}
              </a>
            )}
            {profile?.createdAt && (
              <span className="text-xs text-dark-muted font-body">
                📅 Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Skills / badges */}
          {profile?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.skills.map((skill) => (
                <span key={skill} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-body font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Reputation badges */}
          {profile?.badges?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.badges.map((badge) => (
                <span key={badge} className="text-xs bg-dark-border text-slate-400 px-2.5 py-1 rounded-full font-body flex items-center gap-1">
                  🏅 {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}