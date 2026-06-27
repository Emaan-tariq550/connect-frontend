import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiUser, HiAtSymbol, HiMail, HiLockClosed,
  HiArrowRight, HiArrowLeft, HiCheck, HiShieldCheck
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import InputField from '@/components/common/InputField'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

const STEPS = [
  { label: 'Account Info', icon: HiUser },
  { label: 'Security', icon: HiLockClosed },
  { label: 'Verify Email', icon: HiShieldCheck },
  { label: 'All done!', icon: HiCheck },
]

export default function RegisterForm() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [form, setForm] = useState({
    fullName: '', username: '', email: '',
    password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [userId, setUserId] = useState(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  // ─── Handlers ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // sirf numbers
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // sirf 1 digit
    setOtp(newOtp)
    // auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus()
  }

  // ─── Validation ─────────────────────────────────────────────
  const validateStep = (s) => {
    const e = {}
    if (s === 0) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required'
      else if (form.fullName.length < 2) e.fullName = 'Name too short'
      if (!form.username.trim()) e.username = 'Username is required'
      else if (form.username.length < 3) e.username = 'Min 3 characters'
      else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscores only'
      if (!form.email.trim()) e.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    }
    if (s === 1) {
      if (!form.password) e.password = 'Password is required'
      else if (form.password.length < 8) e.password = 'Min 8 characters'
      else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password))
        e.password = 'Must contain uppercase letter and number'
      if (!form.confirmPassword) e.confirmPassword = 'Please confirm password'
      else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => s + 1)
  }
  const prevStep = () => setStep((s) => s - 1)

  // ─── Register (Step 1 submit) ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(1)) return
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      const res = await authService.register(payload)
      // backend returns userId, OTP email bhej deta hai
      setUserId(res.data.userId)
      toast.success('OTP sent to your email! 📧')
      setStep(2) // OTP step
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.'
      toast.error(msg)
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg })
      if (msg.toLowerCase().includes('username')) setErrors({ username: msg })
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  // ─── Verify OTP (Step 2 submit) ─────────────────────────────
  const handleVerifyOTP = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }
    setLoading(true)
    try {
      const res = await authService.verifyEmail(userId, otpString)
      // backend returns accessToken + user after verify
      login(res.data.user, res.data.accessToken)
      toast.success('Email verified! 🎉')
      setStep(3) // success
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP'
      toast.error(msg)
      if (msg.toLowerCase().includes('expired')) {
        toast('Request a new code ⬇️', { icon: '⏰' })
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Resend OTP ──────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setResendLoading(true)
    try {
      await authService.resendOTP(userId)
      toast.success('New OTP sent! Check your email 📧')
      setOtp(['', '', '', '', '', ''])
      // 60 second cooldown
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
      document.getElementById('otp-0')?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  // ─── Password strength ───────────────────────────────────────
  const passwordStrength = () => {
    const p = form.password
    if (!p) return { width: '0%', label: '', color: '' }
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    const map = [
      { width: '25%', label: 'Weak', color: 'bg-red-400' },
      { width: '50%', label: 'Fair', color: 'bg-orange-400' },
      { width: '75%', label: 'Good', color: 'bg-yellow-400' },
      { width: '100%', label: 'Strong', color: 'bg-green-400' },
    ]
    return map[score - 1] || { width: '0%', label: '', color: '' }
  }
  const strength = passwordStrength()

  // ─── UI ─────────────────────────────────────────────────────
  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  i < step
                    ? 'bg-primary'
                    : i === step
                    ? 'bg-gradient-primary'
                    : 'bg-light-border dark:bg-dark-border'
                }`}
                animate={{ scale: i === step ? 1.1 : 1 }}
              >
                {i < step
                  ? <HiCheck className="text-white text-sm" />
                  : <s.icon className={`text-sm ${i === step ? 'text-white' : 'text-dark-muted'}`} />
                }
              </motion.div>
              <span className={`text-[10px] font-body font-medium hidden sm:block ${
                i === step ? 'text-primary' : 'text-dark-muted'
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-4">
                <motion.div
                  className="h-full"
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    transformOrigin: 'left',
                    backgroundColor: i < step ? '#6366F1' : '#334155',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 0: Account Info ── */}
        {step === 0 && (
          <motion.div key="step0"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <InputField label="Full Name" name="fullName" value={form.fullName}
              onChange={handleChange} placeholder="e.g. Emaan Khan"
              error={errors.fullName} icon={HiUser} />
            <InputField label="Username" name="username" value={form.username}
              onChange={handleChange} placeholder="e.g. emaan_k"
              error={errors.username} icon={HiAtSymbol} autoComplete="username" />
            <InputField label="Email address" name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com"
              error={errors.email} icon={HiMail} autoComplete="email" />
            <motion.button type="button" onClick={nextStep}
              className="btn-primary flex items-center justify-center gap-2 w-full"
              whileTap={{ scale: 0.98 }}>
              Continue <HiArrowRight />
            </motion.button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 font-body">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {/* ── Step 1: Password ── */}
        {step === 1 && (
          <motion.form key="step1" onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <InputField label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              error={errors.password} icon={HiLockClosed} autoComplete="new-password" />

            {form.password && (
              <div className="space-y-1">
                <div className="h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${strength.color}`}
                    initial={{ width: 0 }} animate={{ width: strength.width }}
                    transition={{ duration: 0.4 }} />
                </div>
                <p className="text-xs text-dark-muted font-body">{strength.label} password</p>
              </div>
            )}

            <InputField label="Confirm Password" name="confirmPassword" type="password"
              value={form.confirmPassword} onChange={handleChange}
              placeholder="Re-enter your password"
              error={errors.confirmPassword} icon={HiLockClosed} autoComplete="new-password" />

            <div className="flex gap-3">
              <motion.button type="button" onClick={prevStep}
                className="btn-secondary flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}>
                <HiArrowLeft /> Back
              </motion.button>
              <motion.button type="submit" disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 flex-1"
                whileTap={{ scale: 0.98 }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</>
                  : <>Create Account <HiCheck /></>
                }
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* ── Step 2: OTP Verify ── */}
        {step === 2 && (
          <motion.div key="step2"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <HiMail className="text-primary text-2xl" />
              </motion.div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Check your email
              </h3>
              <p className="text-sm text-dark-muted font-body">
                We sent a 6-digit code to{' '}
                <span className="text-primary font-medium">{form.email}</span>
              </p>
            </div>

            {/* OTP Boxes */}
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-11 h-13 text-center text-xl font-bold font-heading rounded-xl border-2 
                    bg-light-surface dark:bg-dark-surface
                    text-slate-900 dark:text-white
                    transition-all duration-200 outline-none
                    ${digit
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-light-border dark:bg-dark-border focus:border-primary'
                    }`}
                  style={{ height: '52px' }}
                  whileFocus={{ scale: 1.05 }}
                  animate={{ scale: digit ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <motion.button
              type="button"
              onClick={handleVerifyOTP}
              disabled={loading || otp.join('').length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                : <><HiShieldCheck /> Verify Email</>
              }
            </motion.button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-dark-muted font-body">
                Didn't receive it?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-dark-muted">
                    Resend in <span className="text-primary font-medium">{resendCooldown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-primary font-semibold hover:text-primary-hover transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend code'}
                  </button>
                )}
              </p>
            </div>

            {/* Wrong email? Back button */}
            <div className="text-center">
              <button type="button" onClick={() => { setStep(0); setOtp(['','','','','','']) }}
                className="text-xs text-dark-muted hover:text-primary transition-colors font-body flex items-center gap-1 mx-auto">
                <HiArrowLeft className="text-xs" /> Wrong email? Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <motion.div key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8 gap-4"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
            >
              <HiCheck className="text-white text-3xl" />
            </motion.div>
            <div>
              <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Welcome to CONNECT!
              </h3>
              <p className="text-dark-muted text-sm font-body mt-1">
                Hi <span className="text-primary font-medium">{form.fullName}</span>, your account is verified & ready.
              </p>
            </div>
            <p className="text-dark-muted text-xs font-body">Redirecting to your dashboard...</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}