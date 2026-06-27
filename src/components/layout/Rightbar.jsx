import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiUserAdd, HiLightningBolt } from 'react-icons/hi'
import { useLayoutStore } from '@/store/layoutStore'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'
import api from '@/api/axios'

export default function Rightbar() {
  const { rightbarOpen } = useLayoutStore()
  const { user } = useAuthStore()
  const [suggestions, setSuggestions] = useState([])
  const [onlineFriends, setOnlineFriends] = useState([])
  const [stats, setStats] = useState(null)
  const [loadingSugg, setLoadingSugg] = useState(true)
  const [sendingReq, setSendingReq] = useState({})

  useEffect(() => {
    if (!rightbarOpen) return
    const fetchData = async () => {
      setLoadingSugg(true)
      try {
        const [suggRes, friendsRes, statsRes] = await Promise.allSettled([
          api.get('/users/suggestions?limit=4'),
          api.get('/friends/online'),
          userService.getUserStats(),
        ])
        if (suggRes.status === 'fulfilled') setSuggestions(suggRes.value.data.users || [])
        if (friendsRes.status === 'fulfilled') setOnlineFriends(friendsRes.value.data.friends || [])
        if (statsRes.status === 'fulfilled') {
          const s = statsRes.value.data?.stats || statsRes.value.data || {}
          setStats(s)
        }
      } catch {}
      finally { setLoadingSugg(false) }
    }
    fetchData()
  }, [rightbarOpen])

  const sendFriendRequest = async (userId) => {
    setSendingReq((p) => ({ ...p, [userId]: true }))
    try {
      await api.post(`/friends/request/${userId}`)
      setSuggestions((p) => p.map((u) => u._id === userId ? { ...u, requestSent: true } : u))
    } catch {}
    finally { setSendingReq((p) => ({ ...p, [userId]: false })) }
  }

  if (!rightbarOpen) return null

  return (
    <aside className="hidden xl:flex flex-col w-72 fixed right-0 top-16 bottom-0 z-30 border-l border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card overflow-y-auto">
      <div className="p-4 space-y-6">

        {/* Online Friends */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider font-body">Active Now</h3>
          </div>
          {onlineFriends.length === 0 ? (
            <p className="text-xs text-dark-muted font-body">No friends online right now</p>
          ) : (
            <div className="space-y-2">
              {onlineFriends.slice(0, 6).map((friend) => (
                <Link
                  key={friend._id}
                  to={`/chat`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {friend.avatar
                        ? <img src={friend.avatar} alt={friend.fullName} className="w-full h-full object-cover" />
                        : friend.fullName?.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-light-card dark:border-dark-card" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 font-body truncate group-hover:text-primary transition-colors">{friend.fullName}</p>
                    <p className="text-[10px] text-dark-muted font-body">Online</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-light-border dark:bg-dark-border" />

        {/* Suggestions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider font-body">Suggested</h3>
            <Link to="/friends" className="text-xs text-primary hover:text-primary-hover font-medium font-body transition-colors">See all</Link>
          </div>

          {loadingSugg ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-light-border dark:bg-dark-border flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-light-border dark:bg-dark-border rounded-full w-3/4" />
                    <div className="h-2 bg-light-border dark:bg-dark-border rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-xs text-dark-muted font-body">No suggestions available</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((sugg) => (
                <motion.div
                  key={sugg._id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-light-border/30 dark:hover:bg-dark-border/30 transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Link to={`/profile/${sugg.username}`} className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {sugg.avatar
                        ? <img src={sugg.avatar} alt={sugg.fullName} className="w-full h-full object-cover" />
                        : sugg.fullName?.charAt(0)}
                    </div>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/profile/${sugg.username}`}>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 font-body truncate hover:text-primary transition-colors">{sugg.fullName}</p>
                    </Link>
                    <p className="text-[10px] text-dark-muted font-body truncate">@{sugg.username}</p>
                  </div>
                  <button
                    onClick={() => sendFriendRequest(sugg._id)}
                    disabled={sugg.requestSent || sendingReq[sugg._id]}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                      sugg.requestSent
                        ? 'bg-light-border dark:bg-dark-border text-dark-muted cursor-default'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                    title={sugg.requestSent ? 'Request sent' : 'Send friend request'}
                  >
                    {sendingReq[sugg._id]
                      ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                      : <HiUserAdd size={14} />
                    }
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <div className="h-px bg-light-border dark:bg-dark-border" />

        {/* Quick Stats */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <HiLightningBolt className="text-accent-cyan" size={14} />
            <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider font-body">Quick Stats</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Messages sent', value: stats?.messagesSent ?? user?.stats?.messagesSent ?? '—' },
              { label: 'Communities',   value: stats?.communities  ?? user?.stats?.communities  ?? '—' },
              { label: 'Connections',   value: stats?.friends      ?? user?.stats?.friends      ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-dark-muted font-body">{label}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-body">{value}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  )
}