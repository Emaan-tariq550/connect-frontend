import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiUser, HiGlobe, HiLocationMarker, HiTag } from 'react-icons/hi'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'
import InputField from '@/components/common/InputField'
import toast from 'react-hot-toast'

const SECTION_TABS = ['Profile', 'Status', 'Privacy']

export default function EditProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

  const [activeSection, setActiveSection] = useState('Profile')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    skills: '',
    socialLinks: { twitter: '', linkedin: '', github: '' }
  })

  const [statusMessage, setStatusMessage] = useState('')

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showLastSeen: true,      // ✅ backend field name
    readReceipts: true,
    messagingPermission: 'everyone'  // ✅ backend field name
  })

  useEffect(() => {
    if (!user) return
    setForm({
      fullName: user.fullName || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      skills: user.skills?.join(', ') || '',
      socialLinks: {
        twitter: user.socialLinks?.twitter || '',
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || ''
      }
    })
    setStatusMessage(user.statusMessage || '')
    setPrivacy({
      profileVisibility: user.privacySettings?.profileVisibility || 'public',
      showLastSeen: user.privacySettings?.showLastSeen ?? true,
      readReceipts: user.privacySettings?.readReceipts ?? true,
      messagingPermission: user.privacySettings?.messagingPermission || 'everyone'
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('social_')) {
      const key = name.replace('social_', '')
      setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }))
    } else {
      setForm((p) => ({ ...p, [name]: value }))
    }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean)
      }
      const res = await userService.updateProfile(payload)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSavingProfile(false) }
  }

  const saveStatus = async () => {
    setSavingStatus(true)
    try {
      // ✅ backend { status } expect karta hai
      await userService.updateStatus({ status: statusMessage })
      updateUser({ statusMessage })
      toast.success('Status updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally { setSavingStatus(false) }
  }

  const savePrivacy = async () => {
    setSavingPrivacy(true)
    try {
      // ✅ backend field names: messagingPermission, profileVisibility, showLastSeen
      await userService.updatePrivacy({
        profileVisibility: privacy.profileVisibility,
        showLastSeen: privacy.showLastSeen,
        messagingPermission: privacy.messagingPermission
      })
      updateUser({ privacySettings: privacy })
      toast.success('Privacy settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save privacy settings')
    } finally { setSavingPrivacy(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}   // ✅ navigate(-1) — hamesha kaam karega
          className="p-2 rounded-xl hover:bg-light-border dark:hover:bg-dark-border text-slate-500"
        >
          ←
        </button>
        <div>
          <h1 className="font-bold text-xl">Edit Profile</h1>
          <p className="text-sm text-dark-muted">Update your personal information</p>
        </div>
      </div>

      {/* TABS */}
      <div className="card p-1 flex gap-1">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`flex-1 py-2.5 text-sm rounded-xl transition-all
              ${activeSection === tab ? 'bg-primary text-white' : 'text-dark-muted hover:text-black dark:hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {activeSection === 'Profile' && (
        <motion.div className="card p-6 space-y-5">
          <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} icon={HiUser} />
          <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio..." rows={3} className="input-field resize-none" />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} icon={HiLocationMarker} />
          <InputField label="Website" name="website" value={form.website} onChange={handleChange} icon={HiGlobe} />
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node, Design" className="input-field" />
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium"><HiTag /> Social Links</p>
            <InputField label="Twitter" name="social_twitter" value={form.socialLinks.twitter} onChange={handleChange} />
            <InputField label="LinkedIn" name="social_linkedin" value={form.socialLinks.linkedin} onChange={handleChange} />
            <InputField label="GitHub" name="social_github" value={form.socialLinks.github} onChange={handleChange} />
          </div>
          <button onClick={saveProfile} disabled={savingProfile} className="btn-primary w-full">
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </motion.div>
      )}

      {/* STATUS */}
      {activeSection === 'Status' && (
        <motion.div className="card p-6 space-y-5">
          <textarea
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            maxLength={150}
            rows={3}
            className="input-field resize-none"
            placeholder="What's on your mind?"
          />
          <div className="flex flex-wrap gap-2">
            {['💼 Working', '🎮 Gaming', '📚 Studying', '🎵 Music', '💤 Away'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusMessage(s)}
                className={`px-3 py-1 rounded-full text-xs border ${statusMessage === s ? 'bg-primary text-white' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={saveStatus} disabled={savingStatus} className="btn-primary w-full">
            {savingStatus ? 'Saving...' : 'Update Status'}
          </button>
        </motion.div>
      )}

      {/* PRIVACY */}
      {activeSection === 'Privacy' && (
        <motion.div className="card p-6 space-y-5">
          {/* Profile Visibility */}
          <div>
            <p className="text-sm font-medium mb-2">Profile Visibility</p>
            <div className="flex gap-2">
              {['public', 'friends', 'private'].map((v) => (
                <button
                  key={v}
                  onClick={() => setPrivacy((p) => ({ ...p, profileVisibility: v }))}
                  className={`flex-1 py-2 rounded-xl capitalize text-sm font-medium transition-all
                    ${privacy.profileVisibility === v ? 'bg-primary text-white' : 'bg-light-border dark:bg-dark-border text-slate-600 dark:text-slate-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Messaging Permission */}
          <div>
            <p className="text-sm font-medium mb-2">Who can message you</p>
            <div className="flex gap-2">
              {['everyone', 'friends'].map((v) => (
                <button
                  key={v}
                  onClick={() => setPrivacy((p) => ({ ...p, messagingPermission: v }))}
                  className={`flex-1 py-2 rounded-xl capitalize text-sm font-medium transition-all
                    ${privacy.messagingPermission === v ? 'bg-primary text-white' : 'bg-light-border dark:bg-dark-border text-slate-600 dark:text-slate-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          {[
            { key: 'showLastSeen', label: 'Show Last Seen', desc: 'Let others see your activity' },
            { key: 'readReceipts', label: 'Read Receipts', desc: "Show when you've read messages" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-dark-muted">{desc}</p>
              </div>
              <button
                onClick={() => setPrivacy((p) => ({ ...p, [key]: !p[key] }))}
                className={`w-12 h-6 rounded-full transition-colors ${privacy[key] ? 'bg-primary' : 'bg-gray-400'}`}
              />
            </div>
          ))}

          <button onClick={savePrivacy} disabled={savingPrivacy} className="btn-primary w-full">
            {savingPrivacy ? 'Saving...' : 'Save Privacy'}
          </button>
        </motion.div>
      )}
    </div>
  )
}