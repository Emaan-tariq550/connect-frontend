import { motion } from 'framer-motion';
import {
  UserGroupIcon, GlobeAltIcon,
  LockClosedIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function CommunityHeader({ community, isMember, isAdmin, onJoin, onLeave }) {
  if (!community) return null;

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        {community.banner ? (
          <img src={community.banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="px-4 pb-4 -mt-6 relative">
        <div className="flex items-end justify-between mb-3">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-[#0F172A] shadow-xl flex-shrink-0">
            {community.avatar ? (
              <img src={community.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {community.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pb-1">
            {isAdmin && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-white/8 border border-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </motion.button>
            )}
            {isMember ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onLeave}
                className="px-4 py-2 rounded-xl bg-white/8 border border-white/10 text-slate-300 text-sm font-medium hover:border-red-500/40 hover:text-red-400 transition-all"
              >
                Leave
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onJoin}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 transition-shadow"
              >
                Join Community
              </motion.button>
            )}
          </div>
        </div>

        {/* Name + meta */}
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-white font-poppins">{community.name}</h2>
          {community.verified && <CheckBadgeIcon className="w-5 h-5 text-indigo-400" />}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <UserGroupIcon className="w-3.5 h-3.5" />
            {community.memberCount?.toLocaleString() || '0'} members
          </span>
          <span className="flex items-center gap-1">
            {community.privacy === 'private'
              ? <><LockClosedIcon className="w-3.5 h-3.5" /> Private</>
              : <><GlobeAltIcon className="w-3.5 h-3.5" /> Public</>
            }
          </span>
          {community.category && <span>· {community.category}</span>}
        </div>

        {community.description && (
          <p className="text-sm text-slate-400 leading-relaxed">{community.description}</p>
        )}

        {/* Tags */}
        {community.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {community.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-xs text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}