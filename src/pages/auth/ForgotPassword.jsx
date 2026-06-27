import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMail, HiArrowLeft, HiLockClosed } from 'react-icons/hi'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import InputField from '@/components/common/InputField'
import { authService } from '@/services/authService'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Step 1: Email submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setErrors({ email: 'Email is required' })
    if (!/\S+@\S+\.\S+/.test(email)) return setErrors({ email: 'Enter a valid email' })
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email)
      setUserId(res.data?.userId || res.userId)
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: OTP + new password submit
  const handleResetSubmit = async (e) => {
    e.preventDefault()
    const e2 = {}
    if (!otp.trim()) e2.otp = 'OTP is required'
    if (!newPassword) e2.newPassword = 'Password is required'
    else if (newPassword.length < 8) e2.newPassword = 'Min 8 characters'
    if (newPassword !== confirmPassword) e2.confirmPassword = 'Passwords do not match'
    if (Object.keys(e2).length) return setErrors(e2)
    setErrors({})
    setLoading(true)
    try {
      await authService.resetPassword(userId, otp, newPassword)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={step === 1 ? 'Reset your password' : 'Enter OTP'}
      subtitle={step === 1 ? "Enter your email and we'll send you an OTP." : `OTP sent to ${email}`}
    >
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form key="email" onSubmit={handleEmailSubmit} className="space-y-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InputField
              label="Email address" name="email" type="email"
              value={email} onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
              placeholder="you@example.com" error={errors.email} icon={HiMail}
            />
            <motion.button type="submit" disabled={loading}
              className="btn-primary flex items-center justify-center gap-2" whileTap={{ scale: 0.98 }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                : 'Send OTP'}
            </motion.button>
            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium font-body transition-colors">
              <HiArrowLeft size={14} /> Back to login
            </Link>
          </motion.form>
        ) : (
          <motion.form key="reset" onSubmit={handleResetSubmit} className="space-y-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* OTP boxes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Enter 6-digit OTP
              </label>
              <input
                type="text" maxLength={6} value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors((p) => ({ ...p, otp: '' })) }}
                placeholder="123456"
                className="w-full text-center text-2xl tracking-widest font-bold px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp}</p>}
            </div>
            <InputField
              label="New Password" name="newPassword" type="password"
              value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })) }}
              placeholder="Min 8 characters" error={errors.newPassword} icon={HiLockClosed}
            />
            <InputField
              label="Confirm Password" name="confirmPassword" type="password"
              value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
              placeholder="Re-enter new password" error={errors.confirmPassword} icon={HiLockClosed}
            />
            <motion.button type="submit" disabled={loading}
              className="btn-primary flex items-center justify-center gap-2" whileTap={{ scale: 0.98 }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                : 'Reset Password'}
            </motion.button>
            <button type="button" onClick={() => setStep(1)}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-primary hover:text-primary-hover font-medium transition-colors">
              <HiArrowLeft size={14} /> Change email
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}