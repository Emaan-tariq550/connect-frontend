import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-dark-bg flex flex-col items-center justify-center z-50">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo mark */}
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-white font-heading font-bold text-2xl">C</span>
        </motion.div>

        <div className="text-center">
          <h1 className="font-heading font-bold text-3xl text-white tracking-tight">
            CONNECT
          </h1>
          <p className="text-dark-muted text-sm font-body mt-0.5">by Emaan</p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}