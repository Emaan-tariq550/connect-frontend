import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiUpload, HiPhotograph } from 'react-icons/hi'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'
import { friendService } from '@/services/friendService'
import { userService } from '@/services/userService'
import ProfileHeader from '@/components/profile/ProfileHeader'
import UserStats from '@/components/profile/UserStats'
import UserCard from '@/components/profile/UserCard'
import toast from 'react-hot-toast'

const TABS = ['Posts', 'Media', 'Friends', 'About']

export default function Profile() {
  const { username } = useParams()
  const { user: me } = useAuthStore()
  const { fetchProfile, profiles, loading, error } = useProfileStore()

  const [activeTab, setActiveTab] = useState('Posts')
  const [friendshipStatus, setFriendshipStatus] = useState('none')
  const [friendsOfProfile, setFriendsOfProfile] = useState([])

  // Media state
  const [mediaFiles, setMediaFiles] = useState([])
  const [mediaUploading, setMediaUploading] = useState(false)
  const mediaInputRef = useRef(null)

  // Posts state
  const [posts, setPosts] = useState([])
  const [postText, setPostText] = useState('')
  const [postSubmitting, setPostSubmitting] = useState(false)

  const profile = profiles[username]
  const isOwn = me?.username === username

  // --- Loaders ---

  const loadProfile = async () => {
    const data = await fetchProfile(username)
    if (data && !isOwn) {
      try {
        const res = await friendService.getFriendshipStatus(data._id)
        setFriendshipStatus(res.data.status)
      } catch {}
    }
  }

  const loadProfileFriends = async () => {
    if (!profile?._id) return
    try {
      const res = await friendService.getFriends(1)
      setFriendsOfProfile(res.data.friends || [])
    } catch {}
  }

  const loadPosts = async () => {
    if (!profile?._id) return
    try {
      const res = await userService.getUserPosts(username)
      setPosts(res.data.posts || [])
    } catch {}
  }

  const loadMedia = async () => {
    if (!profile?._id) return
    try {
      const res = await userService.getUserMedia(username)
      setMediaFiles(res.data.media || [])
    } catch {}
  }

  // --- Handlers ---

  const handlePostSubmit = async () => {
    if (!postText.trim()) return
    setPostSubmitting(true)
    try {
      const res = await userService.createPost({ content: postText })
      if (res?.data?.post) setPosts((prev) => [res.data.post, ...prev])
      setPostText('')
      toast.success('Posted!')
    } catch {
      toast.error('Post failed. Try again.')
    } finally {
      setPostSubmitting(false)
    }
  }

  const handleMediaUpload = async (files) => {
    if (!files || files.length === 0) return
    setMediaUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('media', file)
        const res = await userService.uploadMedia(formData)
        return res.data.media
      })
      const uploaded = await Promise.all(uploadPromises)
      setMediaFiles((prev) => [...uploaded, ...prev])
      toast.success(`${uploaded.length} file(s) uploaded!`)
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setMediaUploading(false)
    }
  }

  // --- Effects ---

  useEffect(() => {
    loadProfile()
  }, [username])

  useEffect(() => {
    if (!profile?._id) return
    if (activeTab === 'Posts') loadPosts()
    if (activeTab === 'Media') loadMedia()
    if (activeTab === 'Friends') loadProfileFriends()
  }, [activeTab, profile?._id])

  // --- Render guards ---

  if (loading && !profile) {
    return (
      <div className="space-y-4">
        <div className="card animate-pulse h-64" />
        <div className="card animate-pulse h-24" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <p className="text-3xl mb-3">😕</p>
        <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Profile not found</h2>
        <p className="text-dark-muted text-sm font-body mt-1">{error}</p>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="space-y-4">
      <ProfileHeader
        profile={profile}
        isOwn={isOwn}
        friendshipStatus={friendshipStatus}
        onRefresh={loadProfile}
      />
      <UserStats profile={profile} />

      <div className="card overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-light-border dark:border-dark-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-medium font-body transition-colors relative ${
                activeTab === tab
                  ? 'text-primary'
                  : 'text-dark-muted hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            {/* ── Posts Tab ── */}
            {activeTab === 'Posts' && (
              <div className="space-y-4">
                {isOwn && (
                  <div className="border border-light-border dark:border-dark-border rounded-xl p-4 space-y-3">
                    <textarea
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={3}
                      className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end border-t border-light-border dark:border-dark-border pt-3">
                      <button
                        onClick={handlePostSubmit}
                        disabled={!postText.trim() || postSubmitting}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold font-body disabled:opacity-50 hover:opacity-90 transition-all"
                      >
                        {postSubmitting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                )}

                {posts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-3xl mb-3">📝</p>
                    <p className="text-dark-muted text-sm font-body">No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="border border-light-border dark:border-dark-border rounded-xl p-4 space-y-2"
                      >
                        {post.content && (
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-body leading-relaxed">
                            {post.content}
                          </p>
                        )}
                        {post.fileUrl && post.fileType?.startsWith('image') && (
                          <img
                            src={post.fileUrl}
                            alt=""
                            className="w-full rounded-lg object-cover max-h-64"
                          />
                        )}
                        <p className="text-xs text-dark-muted font-body">
                          {new Date(post.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Media Tab ── */}
            {activeTab === 'Media' && (
              <div>
                {isOwn && (
                  <div className="flex justify-end mb-4">
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleMediaUpload(e.target.files)}
                    />
                    <button
                      onClick={() => mediaInputRef.current?.click()}
                      disabled={mediaUploading}
                      className="flex items-center gap-2 bg-primary text-white text-sm font-semibold font-body px-4 py-2 rounded-xl hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                    >
                      {mediaUploading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <HiUpload size={15} />
                      )}
                      {mediaUploading ? 'Uploading...' : 'Upload Media'}
                    </button>
                  </div>
                )}

                {mediaFiles.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mediaFiles.map((item, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-xl overflow-hidden bg-light-border dark:bg-dark-border"
                      >
                        {item.type?.startsWith('video') ? (
                          <video src={item.url} className="w-full h-full object-cover" controls />
                        ) : (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <HiPhotograph className="mx-auto text-dark-muted mb-3" size={40} />
                    <p className="text-dark-muted text-sm font-body">No media shared yet</p>
                    {isOwn && (
                      <p className="text-dark-muted text-xs font-body mt-1">
                        Upload photos or videos to display them here
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Friends Tab ── */}
            {activeTab === 'Friends' && (
              <div>
                {friendsOfProfile.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-3xl mb-3">👥</p>
                    <p className="text-dark-muted text-sm font-body">No friends to show</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {friendsOfProfile.map((f) => (
                      <UserCard key={f._id} user={f} showActions={!isOwn} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── About Tab ── */}
            {activeTab === 'About' && (
              <div className="space-y-4 max-w-lg">
                {[
                  { label: 'Full Name', value: profile.fullName },
                  { label: 'Username', value: `@${profile.username}` },
                  { label: 'Email', value: isOwn ? profile.email : null },
                  { label: 'Bio', value: profile.bio },
                  { label: 'Location', value: profile.location },
                  { label: 'Website', value: profile.website },
                  { label: 'Status', value: profile.statusMessage },
                ]
                  .filter((r) => r.value)
                  .map(({ label, value }) => (
                    <div key={label} className="flex gap-4">
                      <span className="text-xs text-dark-muted font-body w-24 flex-shrink-0 pt-0.5">
                        {label}
                      </span>
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-body">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}