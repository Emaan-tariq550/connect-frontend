import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCommunityStore } from '../../store/communityStore';
import {
  PhotoIcon, ArrowLeftIcon,
  GlobeAltIcon, LockClosedIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const CATEGORIES = [
  'Technology', 'Gaming', 'Education', 'Art', 'Music',
  'Sports', 'Business', 'Health', 'Science', 'Other',
];

export default function CreateCommunity() {
  const navigate  = useNavigate();
  const { createCommunity, createLoading } = useCommunityStore();

  const [form, setForm] = useState({
    name: '', description: '', category: '', privacy: 'public', tags: '',
  });
  const [banner, setBanner]   = useState(null);
  const [bannerPrev, setBannerPrev] = useState(null);
  const [avatar, setAvatar]   = useState(null);
  const [avatarPrev, setAvatarPrev] = useState(null);
  const [errors, setErrors]   = useState({});

  const bannerRef = useRef(null);
  const avatarRef = useRef(null);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleBanner = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBanner(f);
    setBannerPrev(URL.createObjectURL(f));
  };

  const handleAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatar(f);
    setAvatarPrev(URL.createObjectURL(f));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name = 'Name is required';
    if (form.name.length > 50)    e.name = 'Max 50 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (banner) fd.append('banner', banner);
    if (avatar) fd.append('avatar', avatar);
    const result = await createCommunity(fd);
    if (result) navigate(`/communities/${result._id}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-bold font-poppins">Create Community</h1>
          <p className="text-xs text-slate-400">Build your space</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={createLoading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold disabled:opacity-60 shadow-lg shadow-indigo-900/40"
        >
          {createLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
          {createLoading ? 'Creating...' : 'Create'}
        </motion.button>
      </div>

      <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Banner & Avatar */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Community Banner</label>
          <div
            onClick={() => bannerRef.current?.click()}
            className="relative h-40 rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer group"
            style={{
              background: bannerPrev ? undefined : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
            }}
          >
            {bannerPrev ? (
              <>
                <img src={bannerPrev} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PhotoIcon className="w-8 h-8 text-white" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setBanner(null); setBannerPrev(null); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                <PhotoIcon className="w-10 h-10" />
                <p className="text-sm">Click to upload banner</p>
                <p className="text-xs opacity-60">PNG, JPG, GIF · Recommended 1200×400</p>
              </div>
            )}
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBanner} />

          {/* Avatar overlapping banner */}
          <div className="flex items-end gap-4 -mt-8 pl-6 relative z-10">
            <div
              onClick={() => avatarRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-4 border-[#0F172A] overflow-hidden cursor-pointer group relative bg-white/8"
            >
              {avatarPrev ? (
                <>
                  <img src={avatarPrev} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <PhotoIcon className="w-5 h-5 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 group-hover:text-slate-300 transition-colors">
                  <PhotoIcon className="w-7 h-7" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 pb-2">Community icon (optional)</p>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
        </div>

        {/* Name */}
        <FormField label="Community Name" error={errors.name} required>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. React Developers PK"
            maxLength={50}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
          <p className="text-xs text-slate-600 text-right mt-1">{form.name.length}/50</p>
        </FormField>

        {/* Description */}
        <FormField label="Description" error={errors.description} required>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What is this community about?"
            rows={4}
            maxLength={500}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none"
          />
          <p className="text-xs text-slate-600 text-right">{form.description.length}/500</p>
        </FormField>

        {/* Category */}
        <FormField label="Category" error={errors.category} required>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => set('category', cat)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  form.category === cat
                    ? 'bg-indigo-600 text-white border border-indigo-500'
                    : 'bg-white/5 border border-white/8 text-slate-400 hover:border-indigo-500/40 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FormField>

        {/* Privacy */}
        <FormField label="Privacy">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'public',  Icon: GlobeAltIcon,  title: 'Public',  desc: 'Anyone can join' },
              { value: 'private', Icon: LockClosedIcon, title: 'Private', desc: 'Invite only' },
            ].map(({ value, Icon, title, desc }) => (
              <button
                key={value}
                onClick={() => set('privacy', value)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  form.privacy === value
                    ? 'border-indigo-500/60 bg-indigo-600/10'
                    : 'border-white/8 bg-white/3 hover:border-white/20'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${form.privacy === value ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <p className={`text-sm font-medium ${form.privacy === value ? 'text-white' : 'text-slate-300'}`}>{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </FormField>

        {/* Tags */}
        <FormField label="Tags" hint="Comma separated (optional)">
          <input
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="react, javascript, frontend"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </FormField>
      </div>
    </div>
  );
}

function FormField({ label, children, error, required, hint }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        {required && <span className="text-indigo-400 text-xs">*</span>}
        {hint && <span className="text-xs text-slate-500 ml-1">({hint})</span>}
      </div>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}