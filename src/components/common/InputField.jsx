import { useState } from 'react'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  autoComplete,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300 font-body">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`input-field ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-11' : ''} ${
            error ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400' : ''
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-primary transition-colors"
          >
            {showPassword ? <HiEyeOff size={16} /> : <HiEye size={16} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-red-400 text-xs font-body flex items-center gap-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}