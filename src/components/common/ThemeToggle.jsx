import { motion } from 'framer-motion'
import { HiSun, HiMoon } from 'react-icons/hi'
import { useThemeStore } from '@/store/themeStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full bg-dark-border dark:bg-dark-border border border-light-border dark:border-dark-border overflow-hidden flex items-center px-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-gradient-primary flex items-center justify-center shadow-md"
        animate={{ x: isDark ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark
          ? <HiMoon className="text-white text-[10px]" />
          : <HiSun className="text-white text-[10px]" />
        }
      </motion.div>
    </motion.button>
  )
}