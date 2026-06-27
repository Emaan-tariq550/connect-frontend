import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiChatAlt2, HiUserGroup, HiViewGrid } from 'react-icons/hi'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, updateUser } = useAuthStore()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await userService.getUserStats()
        const s = res.data?.stats || res.data || {}
        setStats(s)
        updateUser({ stats: s })
      } catch {}
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Messages Sent',
      value: stats?.messagesSent ?? user?.stats?.messagesSent ?? 0,
      icon: HiChatAlt2,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Friends',
      value: stats?.friends ?? user?.stats?.friends ?? 0,
      icon: HiUserGroup,
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10',
    },
    {
      label: 'Communities',
      value: stats?.communities ?? user?.stats?.communities ?? 0,
      icon: HiViewGrid,
      color: 'text-accent-purple',
      bg: 'bg-accent-purple/10',
    },
    {
      label: 'Trust Score',
      value: stats?.trustScore ?? user?.trustScore ?? 0,
      icon: HiShieldCheck,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent-purple/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">👋</span>
            <h1 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span>
            </h1>
          </div>
          <p className="text-dark-muted text-sm font-body">
            Here's what's happening in your CONNECT world today.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            className="card p-4 flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={color} size={18} />
            </div>
            <div>
              <p className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                {value}
              </p>
              <p className="text-xs text-dark-muted font-body">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="card p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-heading font-semibold text-slate-900 dark:text-white mb-4 text-sm">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '💬 Start a chat',  to: '/chat' },
            { label: '👥 Find friends',  to: '/friends' },
            { label: '🏠 Communities',   to: '/communities' },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all font-body"
            >
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}