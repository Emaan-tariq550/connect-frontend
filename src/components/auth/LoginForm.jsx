import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiMail, HiLockClosed } from 'react-icons/hi'
import toast from 'react-hot-toast'
import InputField from '@/components/common/InputField'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authService.login({ ...form, rememberMe })
      login(res.data.user, res.data.accessToken)
      toast.success(`Welcome back, ${res.data.user.fullName.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
      if (err.response?.status === 401) {
        setErrors({ password: 'Invalid email or password' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <InputField
        label="Email address"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@example.com"
        error={errors.email}
        icon={HiMail}
        autoComplete="email"
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Enter your password"
        error={errors.password}
        icon={HiLockClosed}
        autoComplete="current-password"
      />

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              rememberMe ? 'bg-primary border-primary' : 'border-light-border dark:border-dark-border'
            }`}
          >
            {rememberMe && <span className="text-white text-[10px]">✓</span>}
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400 font-body">Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary-hover font-medium font-body transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        className="btn-primary flex items-center justify-center gap-2"
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
        <span className="text-xs text-light-muted dark:text-dark-muted font-body">or</span>
        <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
      </div>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400 font-body">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:text-primary-hover font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </form>
  )
}