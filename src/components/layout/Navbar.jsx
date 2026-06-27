import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiBell, HiChatAlt2, HiSearch, HiX, HiMenu,
  HiChevronDown, HiLogout, HiUser, HiCog,
} from 'react-icons/hi'
import { useAuthStore } from '@/store/authStore'
import { useLayoutStore } from '@/store/layoutStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useSearchStore } from '@/store/searchStore'
import ThemeToggle from '@/components/common/ThemeToggle'
import Logo from '@/components/common/Logo'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useDebounce } from '@/hooks/useDebounce'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useLayoutStore()
  const { unreadCount, notifications, fetchNotifications, markAllRead } = useNotificationStore()
  const { query, setQuery, search, results, loading: searchLoading, open: searchOpen, setOpen, clearSearch } = useSearchStore()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const searchRef = useRef(null)

  useClickOutside(profileRef, () => setProfileOpen(false))
  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(searchRef, () => { setOpen(false); setMobileSearchOpen(false) })

  const debouncedQuery = useDebounce(query, 350)

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery)
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [debouncedQuery])

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const avatarLetter = user?.fullName?.charAt(0).toUpperCase()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-light-border dark:border-dark-border bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center justify-between gap-3">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors text-slate-500 dark:text-slate-400 hover:text-primary"
          >
            <HiMenu size={20} />
          </button>
          <div className="hidden sm:block">
            <Logo size="sm" linkTo="/dashboard" />
          </div>
        </div>

        {/* Center - Search */}
        <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
          <div className="relative">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setOpen(true)}
              placeholder="Search people, posts, communities..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-sm font-body text-slate-900 dark:text-slate-100 placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-slate-400 transition-colors">
                <HiX size={14} />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 card shadow-xl overflow-hidden z-50"
              >
                {searchLoading ? (
                  <div className="p-4 flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm text-dark-muted font-body">Searching...</span>
                  </div>
                ) : results.users.length === 0 ? (
                  <div className="p-4 text-center text-sm text-dark-muted font-body">
                    No results for "<span className="text-slate-900 dark:text-white">{query}</span>"
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="px-4 py-1.5 text-xs font-semibold text-dark-muted uppercase tracking-wider font-body">People</p>
                    {results.users.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => { navigate(`/profile/${u.username}`); clearSearch() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                          {u.avatar ? <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" /> : u.fullName?.charAt(0)}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white font-body truncate">{u.fullName}</p>
                          <p className="text-xs text-dark-muted font-body">@{u.username}</p>
                        </div>
                        {u.trustScore && (
                          <span className="ml-auto text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            {u.trustScore}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors text-slate-500 dark:text-slate-400"
          >
            <HiSearch size={20} />
          </button>

          <ThemeToggle />

          {/* Messages - FIXED: /chat instead of /messages */}
          <Link
            to="/chat"
            className="relative p-2 rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors text-slate-500 dark:text-slate-400 hover:text-primary"
          >
            <HiChatAlt2 size={20} />
          </Link>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications() }}
              className="relative p-2 rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors text-slate-500 dark:text-slate-400 hover:text-primary"
            >
              <HiBell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-accent-pink rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 card shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
                    <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:text-primary-hover font-medium font-body transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <HiBell className="text-dark-muted text-3xl mx-auto mb-2" />
                        <p className="text-sm text-dark-muted font-body">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <NotifItem key={notif._id} notif={notif} />
                      ))
                    )}
                  </div>
                  <div className="border-t border-light-border dark:border-dark-border p-3">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block w-full text-center text-sm text-primary hover:text-primary-hover font-medium font-body transition-colors"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-primary/30">
                {user?.avatar
                  ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  : avatarLetter
                }
              </div>
              <HiChevronDown size={14} className={`text-dark-muted transition-transform duration-200 hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-52 card shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white font-body truncate">{user?.fullName}</p>
                    <p className="text-xs text-dark-muted font-body truncate">@{user?.username}</p>
                  </div>

                  <div className="py-1">
                    {[
                      { icon: HiUser,  label: 'View Profile', to: `/profile/${user?.username}` },
                      { icon: HiCog,   label: 'Settings',     to: '/settings/profile' },
                    ].map(({ icon: Icon, label, to }) => (
                      <Link
                        key={label}
                        to={to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors text-sm text-slate-700 dark:text-slate-300 font-body"
                      >
                        <Icon size={16} className="text-dark-muted" />
                        {label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-light-border dark:border-dark-border py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm text-red-500 font-body"
                    >
                      <HiLogout size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card px-4 py-3"
          >
            <div className="relative" ref={searchRef}>
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-muted" size={15} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-sm font-body text-slate-900 dark:text-slate-100 placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NotifItem({ notif }) {
  const { markOneRead } = useNotificationStore()
  const iconMap = {
    message: '💬',
    friend_request: '👥',
    mention: '@',
    call: '📞',
    community_invite: '🏠',
    like: '❤',
    comment: '💬',
  }

  return (
    <button
      onClick={() => !notif.isRead && markOneRead(notif._id)}
      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-light-border/30 dark:hover:bg-dark-border/30 transition-colors text-left ${
        !notif.isRead ? 'bg-primary/5' : ''
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-dark-card flex items-center justify-center text-base flex-shrink-0 mt-0.5">
        {iconMap[notif.type] || '🔔'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-800 dark:text-slate-200 font-body leading-relaxed line-clamp-2">{notif.message}</p>
        <p className="text-[10px] text-dark-muted font-body mt-0.5">
          {new Date(notif.createdAt).toLocaleDateString()}
        </p>
      </div>
      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
    </button>
  )
}