import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
   HiHome, HiSearch, HiChatAlt2, HiUserGroup,
  HiUsers, HiBell, HiCog, HiShieldCheck, HiChartBar,
  HiViewGrid,
} from 'react-icons/hi'
import { useAuthStore } from '@/store/authStore'
import { useLayoutStore } from '@/store/layoutStore'
import { useNotificationStore } from '@/store/notificationStore'

const NAV_ITEMS = [
  { label: 'Home',          icon: HiHome,        to: '/dashboard'         },
  { label: 'Communities',   icon: HiViewGrid,    to: '/communities'       },
  { label: 'Messages',      icon: HiChatAlt2,    to: '/chat',    badge: 'messages' },
  { label: 'Friends',       icon: HiUsers,       to: '/friends'           },
  { label: 'Notifications', icon: HiBell,        to: '/notifications', badge: 'notif' },
  { label: 'Trust Center',  icon: HiShieldCheck, to: '/trust'             },
  { label: 'Settings',      icon: HiCog,         to: '/settings/profile'  },
]

const ADMIN_ITEMS = [
  { label: 'Analytics', icon: HiChartBar, to: '/admin' },
]

export default function Sidebar() {
  const { user }          = useAuthStore()
  const { sidebarOpen }   = useLayoutStore()
  const { unreadCount }   = useNotificationStore()
  const isAdmin           = user?.role === 'admin'

  return (
    <aside
      className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 border-r border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card transition-all duration-300 overflow-hidden
        ${sidebarOpen ? 'w-64' : 'w-16'}
      `}
    >
      <SidebarContent
        sidebarOpen={sidebarOpen}
        user={user}
        unreadCount={unreadCount}
        isAdmin={isAdmin}
      />
    </aside>
  )
}

export function SidebarContent({ sidebarOpen, user, unreadCount, isAdmin, onNavClick }) {
  return (
    <div className="flex flex-col h-full py-4 overflow-y-auto overflow-x-hidden">

      {/* ── User mini profile ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mb-4 p-3 rounded-2xl bg-gradient-card border border-light-border dark:border-dark-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden ring-2 ring-primary/30">
                {user?.avatar
                  ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  : user?.fullName?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-body truncate">
                  {user?.fullName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-dark-muted font-body">Online</span>
                  {user?.trustScore !== undefined && (
                    <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      {user.trustScore}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, to, badge }) => {
          const badgeCount = badge === 'notif' ? unreadCount : 0
          const isTrust    = to === '/trust'

          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? isTrust
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-light-border/70 dark:hover:bg-dark-border/70 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className="flex-shrink-0" />

                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium font-body truncate overflow-hidden whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Unread badge */}
                  {badgeCount > 0 && (
                    <span className={`ml-auto w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0
                      ${isActive ? 'bg-white/30' : 'bg-accent-pink'}
                    `}>
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}

                  {/* Trust score pill (only on Trust Center item when sidebar open & not active) */}
                  {isTrust && sidebarOpen && !isActive && user?.trustScore !== undefined && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                      {user.trustScore}
                    </span>
                  )}

                  {/* Collapsed tooltip */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-card border border-dark-border rounded-lg text-xs text-white font-body opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity duration-150">
                      {label}
                      {isTrust && user?.trustScore !== undefined && (
                        <span className="ml-1.5 text-indigo-400 font-bold">· {user.trustScore}</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          )
        })}

        {/* ── Admin section ── */}
        {isAdmin && (
          <>
            {sidebarOpen
              ? <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-dark-muted uppercase tracking-widest font-body">Admin</p>
              : <div className="my-2 mx-3 h-px bg-dark-border" />
            }
            {ADMIN_ITEMS.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-light-border/70 dark:hover:bg-dark-border/70 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className="flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium font-body truncate overflow-hidden whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-card border border-dark-border rounded-lg text-xs text-white font-body opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
                        {label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ── Bottom — Trust Score bar ── */}
      <AnimatePresence>
        {sidebarOpen && user?.trustScore !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-4 p-3 rounded-2xl border border-indigo-500/20 bg-indigo-600/5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <HiShieldCheck className="text-indigo-400" size={14} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-body">
                  Trust Score
                </span>
              </div>
              <NavLink
                to="/trust"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                View →
              </NavLink>
            </div>

            {/* Score number */}
            <p className="text-2xl font-bold text-white font-poppins leading-none mb-2">
              {user.trustScore}
              <span className="text-xs text-slate-500 font-normal ml-1">/100</span>
            </p>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    user.trustScore >= 90 ? 'linear-gradient(to right,#10B981,#34D399)' :
                    user.trustScore >= 70 ? 'linear-gradient(to right,#6366F1,#8B5CF6)' :
                    user.trustScore >= 50 ? 'linear-gradient(to right,#F59E0B,#FBBF24)' :
                                           'linear-gradient(to right,#EF4444,#F87171)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${user.trustScore}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>

            {/* Level label */}
            <p className="text-[10px] text-dark-muted font-body mt-1.5">
              {user.trustScore >= 90 ? '🏆 Trusted'
               : user.trustScore >= 70 ? '✅ Reliable'
               : user.trustScore >= 50 ? '👤 Average'
               : '⚠️ Suspicious'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}