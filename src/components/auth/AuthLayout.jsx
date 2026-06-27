import { motion } from 'framer-motion'
import Logo from '@/components/common/Logo'
import ThemeToggle from '@/components/common/ThemeToggle'

export default function AuthLayout({ children, title, subtitle, illustration }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex overflow-hidden">
      {/* Left — Form side */}
      <div className="flex-1 flex flex-col justify-between p-6 md:p-10 z-10 min-w-0">
        <div className="flex items-center justify-between">
          <Logo size="md" linkTo="/" />
          <ThemeToggle />
        </div>

        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="mb-7">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-light-muted dark:text-dark-muted text-sm mt-1.5 font-body">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </motion.div>

        <p className="text-center text-xs text-light-muted dark:text-dark-muted font-body">
          © {new Date().getFullYear()} CONNECT by Emaan. All rights reserved.
        </p>
      </div>

      {/* Right — Illustration side (hidden on mobile) */}
      <div className="hidden lg:flex w-[52%] relative bg-gradient-to-br from-primary/5 via-accent-purple/5 to-dark-bg items-center justify-center overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent-purple/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-accent-cyan/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #6366F1 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <motion.div
          className="relative z-10 text-center px-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Floating UI mockup */}
          <div className="relative mx-auto w-80">
            {/* Main card */}
            <div className="glass-dark rounded-3xl p-6 shadow-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">E</div>
                <div>
                  <p className="text-white font-semibold text-sm font-heading">Emaan</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span className="text-dark-muted text-xs">Online</span>
                  </div>
                </div>
                <div className="ml-auto bg-primary/20 rounded-lg px-2 py-0.5">
                  <span className="text-primary text-xs font-medium">Trust: 98</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { msg: 'Hey! Ready for the meeting?', time: '2:30 PM', mine: false },
                  { msg: 'Yes! Starting now 🚀', time: '2:31 PM', mine: true },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl px-3.5 py-2 max-w-[75%] ${m.mine ? 'bg-gradient-primary text-white' : 'bg-dark-card text-slate-300'}`}>
                      <p className="text-xs">{m.msg}</p>
                      <p className="text-[10px] opacity-60 mt-0.5 text-right">{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notification card */}
            <motion.div
              className="absolute -top-4 -right-8 glass-dark rounded-2xl p-3 shadow-xl border border-white/10 w-44"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-pink/20 flex items-center justify-center">
                  <span className="text-accent-pink text-xs">🔔</span>
                </div>
                <div>
                  <p className="text-white text-xs font-medium">New message</p>
                  <p className="text-dark-muted text-[10px]">from Sarah</p>
                </div>
              </div>
            </motion.div>

            {/* Floating stats card */}
            <motion.div
              className="absolute -bottom-6 -left-8 glass-dark rounded-2xl p-3 shadow-xl border border-white/10"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {['#6366F1', '#8B5CF6', '#06B6D4'].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-dark-bg" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-white text-xs">+2.4k online</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-white font-heading font-bold text-2xl">
              Connect With People
              <span className="gradient-text block">Who Matter</span>
            </h2>
            <p className="text-dark-muted text-sm font-body max-w-xs mx-auto">
              Real-time messaging, trusted reputation, AI-powered conversations.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['🔒 Secure', '⚡ Real-time', '🤖 AI-powered', '🏆 Trusted'].map((f) => (
              <span key={f} className="glass-dark text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}