import { motion } from 'framer-motion';
import {
  UserGroupIcon, GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function CommunityCard({ community, view, index, onJoin, onLeave, onClick }) {
  const isGrid = view === 'grid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className={`group cursor-pointer rounded-2xl border border-white/6 overflow-hidden transition-all hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-900/15 bg-white/3 ${
        !isGrid ? 'flex' : ''
      }`}
    >
      {/* Banner */}
      <div
        className={`relative overflow-hidden flex-shrink-0 ${isGrid ? 'h-28' : 'w-28 h-full'}`}
        onClick={onClick}
      >
        {community.banner ? (
          <img src={community.banner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, hsl(${(index * 47) % 360}, 60%, 25%) 0%, hsl(${(index * 47 + 60) % 360}, 50%, 20%) 100%)`,
            }}
          />
        )}
        {isGrid && (
          <div className="absolute bottom-3 left-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#0F172A] shadow-lg">
              {community.avatar ? (
                <img src={community.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(index * 47 + 180) % 360}, 70%, 40%) 0%, hsl(${(index * 47 + 240) % 360}, 60%, 35%) 100%)`,
                  }}
                >
                  {community.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`flex flex-col ${isGrid ? 'p-4 pt-2' : 'p-4 flex-1'}`} onClick={onClick}>
        {!isGrid && (
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 mb-3 flex-shrink-0">
            {community.avatar ? (
              <img src={community.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {community.name?.[0]}
              </div>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-white text-sm truncate">{community.name}</h3>
              {community.isVerified && <CheckBadgeIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {community.isPrivate ? (
                <LockClosedIcon className="w-3 h-3 text-slate-500" />
              ) : (
                <GlobeAltIcon className="w-3 h-3 text-slate-500" />
              )}
              <span className="text-xs text-slate-500">{community.isPrivate ? 'Private' : 'Public'}</span>
            </div>
          </div>
        </div>

        {community.description && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-slate-500">
            <UserGroupIcon className="w-3.5 h-3.5" />
            <span className="text-xs">
              {community.memberCount?.toLocaleString() || '0'} members
            </span>
          </div>

          {community.isMember ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onLeave && onLeave(); }}
              className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
            >
              ✓ Joined
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onJoin && onJoin(); }}
              className="px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-600 hover:text-white transition-all"
            >
              Join
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}