import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSearch, HiUserGroup, HiUserAdd } from 'react-icons/hi'
import { useFriendStore } from '@/store/friendStore'
import { userService } from '@/services/userService'
import FriendCard from '@/components/friends/FriendCard'
import UserCard from '@/components/profile/UserCard'
import { Link } from 'react-router-dom'

export default function Friends() {
  const { friends, totalFriends, loading, hasMore, fetchFriends, page } = useFriendStore()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('friends') // 'friends' | 'explore'

  useEffect(() => {
    fetchFriends(1)
  }, [])

  useEffect(() => {
    if (activeTab === 'explore') loadSuggestions()
  }, [activeTab])

  const loadSuggestions = async () => {
    setSuggestLoading(true)
    try {
      const res = await userService.getSuggestions(20)
      setSuggestions(res.data.users || [])
    } catch {}
    setSuggestLoading(false)
  }

  const filtered = friends.filter((f) =>
    f.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    f.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
            Friends
          </h1>
          <p className="text-dark-muted text-sm font-body">
            {totalFriends} connections
          </p>
        </div>
        <Link
          to="/friends/requests"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-sm font-semibold font-body transition-all"
        >
          <HiUserGroup size={16} />
          Requests
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold font-body transition-all
            ${activeTab === 'friends'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-light-border/60 dark:bg-dark-border/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          My Friends
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-body transition-all
            ${activeTab === 'explore'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-light-border/60 dark:bg-dark-border/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
          <HiUserAdd size={16} />
          Explore People
        </button>
      </div>

      {/* Search (only on friends tab) */}
      {activeTab === 'friends' && (
        <div className="relative">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your friends..."
            className="input-field pl-10"
          />
        </div>
      )}

      {/* ── FRIENDS TAB ── */}
      {activeTab === 'friends' && (
        <>
          {loading && friends.length === 0 ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-xl bg-light-border dark:bg-dark-border flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-light-border dark:bg-dark-border rounded-full w-1/3" />
                    <div className="h-2.5 bg-light-border dark:bg-dark-border rounded-full w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">👥</p>
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                {search ? 'No friends found' : 'No friends yet'}
              </h3>
              <p className="text-dark-muted text-sm font-body mt-1">
                {search ? 'Try a different name' : 'Start connecting with people!'}
              </p>
              {!search && (
                <button
                  onClick={() => setActiveTab('explore')}
                  className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold font-body hover:bg-primary hover:text-white transition-all"
                >
                  Explore People
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {filtered.map((friend) => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {hasMore && !loading && (
            <div className="text-center">
              <motion.button
                onClick={() => fetchFriends(page + 1)}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary text-sm font-medium font-body transition-all"
              >
                Load more
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* ── EXPLORE TAB ── */}
      {activeTab === 'explore' && (
        <>
          {suggestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-light-border dark:bg-dark-border flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-light-border dark:bg-dark-border rounded-full w-1/2" />
                    <div className="h-2.5 bg-light-border dark:bg-dark-border rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                No suggestions right now
              </h3>
              <p className="text-dark-muted text-sm font-body mt-1">
                Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((user) => (
                <UserCard key={user._id} user={user} showActions={true} />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  )
}