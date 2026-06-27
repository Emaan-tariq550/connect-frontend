import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiHome, HiChatAlt2, HiViewGrid,
  HiUsers, HiMenu, HiX,
} from 'react-icons/hi'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { SidebarContent } from './Sidebar'

const BOTTOM_NAV = [
  { label: 'Home',        icon: HiHome,     to: '/dashboard'   },
  { label: 'Messages',    icon: HiChatAlt2, to: '/chat'        },
  { label: 'Communities', icon: HiViewGrid, to: '/communities' },
  { label: 'Friends',     icon: HiUsers,    to: '/friends'     },
]

export default function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  return (
    <>
      {/* Bottom tab bar - only mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-xl border-t border-light-border dark:border-dark-border">
        <div className="flex items-center justify-around h-16">
          {BOTTOM_NAV.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 relative
                ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    <Icon size={22} />
                    {label === 'Messages' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent-pink rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-medium font-body">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-slate-500 dark:text-slate-400"
          >
            <HiMenu size={22} />
            <span className="text-[9px] font-medium font-body">More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-light-border dark:border-dark-border">
                <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">Menu</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-colors text-slate-500"
                >
                  <HiX size={18} />
                </button>
              </div>
              <SidebarContent
                sidebarOpen={true}
                user={user}
                unreadCount={unreadCount}
                isAdmin={user?.role === 'admin'}
                onNavClick={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}