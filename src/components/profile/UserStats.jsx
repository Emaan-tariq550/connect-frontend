import { motion } from 'framer-motion'
import { HiUsers, HiChatAlt2, HiViewGrid, HiShieldCheck } from 'react-icons/hi'

export default function UserStats({ profile }) {
  const stats = [
    { label: 'Friends', value: profile?.friendsCount ?? 0, icon: HiUsers, color: 'text-primary' },
    { label: 'Messages', value: profile?.stats?.messagesSent ?? 0, icon: HiChatAlt2, color: 'text-accent-cyan' },
    { label: 'Communities', value: profile?.stats?.communities ?? 0, icon: HiViewGrid, color: 'text-accent-purple' },
    { label: 'Trust Score', value: profile?.trustScore ?? 0, icon: HiShieldCheck, color: 'text-green-400' },
  ]

  return (
    <div className="card p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            className="flex flex-col items-center gap-1.5 py-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Icon className={color} size={20} />
            <span className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              {typeof value === 'number' && value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : value}
            </span>
            <span className="text-xs text-dark-muted font-body">{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}