import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFriendStore } from '@/store/friendStore'
import RequestCard from '@/components/friends/RequestCard'

const TABS = ['Incoming', 'Outgoing']

export default function Requests() {
  const { incoming, outgoing, fetchRequests } = useFriendStore()
  const [tab, setTab] = useState('Incoming')

  useEffect(() => {
    fetchRequests()
  }, [])

  const list = tab === 'Incoming' ? incoming : outgoing
  const type = tab === 'Incoming' ? 'incoming' : 'outgoing'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">Friend Requests</h1>
        <p className="text-dark-muted text-sm font-body">Manage your connection requests</p>
      </div>

      {/* Tabs */}
      <div className="card p-1 flex gap-1">
        {TABS.map((t) => {
          const count = t === 'Incoming' ? incoming.length : outgoing.length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium font-body rounded-xl transition-all duration-200
                ${tab === t
                  ? 'bg-gradient-primary text-white shadow-md shadow-primary/25'
                  : 'text-dark-muted hover:text-slate-800 dark:hover:text-white'
                }`}
            >
              {t}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-white/30' : 'bg-primary/20 text-primary'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {list.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">{tab === 'Incoming' ? '📩' : '📤'}</p>
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                No {tab.toLowerCase()} requests
              </h3>
              <p className="text-dark-muted text-sm font-body mt-1">
                {tab === 'Incoming' ? 'No one has sent you a request yet' : "You haven't sent any requests"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {list.map((req) => (
                  <RequestCard key={req._id} request={req} type={type} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}