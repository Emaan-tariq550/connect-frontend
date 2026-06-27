import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrustStore } from '../../store/trustStore';
import { useAuthStore } from '../../store/authStore';
import TrustScore from '../../components/trust/TrustScore';
import TrustHistoryList from '../../components/trust/TrustHistory';
import {
  ShieldCheckIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon as ShieldSolid,
  TrophyIcon as TrophySolid,
} from '@heroicons/react/24/solid';

const TABS = [
  { key: 'overview',    label: 'Overview',    Icon: ChartBarIcon  },
  { key: 'history',     label: 'History',     Icon: ClockIcon     },
  { key: 'leaderboard', label: 'Leaderboard', Icon: TrophyIcon    },
];

export default function TrustCenter() {
  const { user }                               = useAuthStore();
  const {
    myTrust, history, leaderboard, stats,
    loading, historyLoading,
    fetchMyTrust, fetchHistory,
    fetchLeaderboard, fetchStats, loadMoreHistory,
  } = useTrustStore();

  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchMyTrust();
    fetchStats();
    fetchLeaderboard();
    fetchHistory(1);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto custom-scrollbar">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6 border-b border-white/5">
        {/* BG blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldSolid className="w-5 h-5 text-indigo-400" />
              <span className="text-xs text-indigo-400 font-semibold tracking-widest uppercase">
                Trust Center
              </span>
            </div>
            <h1 className="text-2xl font-bold font-poppins text-white">
              Your Reputation
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Build trust, earn badges, grow your reputation
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Big Score Card */}
        {loading ? (
          <ScoreCardSkeleton />
        ) : (
          <TrustScore trust={myTrust} user={user} isOwn />
        )}

        {/* Stats Row */}
        {stats && !loading && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Score Changes', value: stats.totalEvents ?? '—', color: 'indigo' },
              { label: 'Positive',      value: stats.positiveEvents ?? '—', color: 'emerald' },
              { label: 'Negative',      value: stats.negativeEvents ?? '—', color: 'red' },
            ].map(({ label, value, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-3 bg-${color}-600/8 border border-${color}-500/15 text-center`}
              >
                <p className={`text-lg font-bold text-${color}-400`}>{value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 px-4 pt-4 pb-0 border-b border-white/5">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
              tab === key ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {tab === key && (
              <motion.div
                layoutId="trust-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 p-5">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <HowScoreWorks />
              <BadgesSection trust={myTrust} />
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TrustHistoryList
                history={history}
                loading={historyLoading}
                onLoadMore={loadMoreHistory}
              />
            </motion.div>
          )}

          {tab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Leaderboard leaderboard={leaderboard} currentUserId={user?._id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── How Score Works ─── */
function HowScoreWorks() {
  const gainItems = [
    { icon: '✅', text: 'Verified email address'   },
    { icon: '💬', text: 'Active messaging & participation' },
    { icon: '👍', text: 'Positive feedback from peers' },
    { icon: '📞', text: 'Successful calls completed' },
    { icon: '🏆', text: 'No reports or violations' },
  ];
  const loseItems = [
    { icon: '🚫', text: 'Spam messages sent'       },
    { icon: '⚠️', text: 'Reports from users'       },
    { icon: '☠️', text: 'Toxic or abusive behavior' },
    { icon: '🤖', text: 'Fake or misleading content'},
  ];

  return (
    <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
        <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">How Trust Score Works</h3>
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/5">
        <div className="p-4">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Increases Score
          </p>
          <ul className="space-y-2.5">
            {gainItems.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-base leading-none flex-shrink-0">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
            Decreases Score
          </p>
          <ul className="space-y-2.5">
            {loseItems.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="text-base leading-none flex-shrink-0">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── Badges ─── */
function BadgesSection({ trust }) {
  const allBadges = [
    { key: 'verified',    emoji: '✅', label: 'Verified User',     desc: 'Email verified',        color: 'emerald' },
    { key: 'trusted',     emoji: '🛡️', label: 'Trusted Member',    desc: 'Score above 70',        color: 'indigo'  },
    { key: 'contributor', emoji: '⭐', label: 'Top Contributor',   desc: '100+ messages sent',    color: 'amber'   },
    { key: 'leader',      emoji: '👑', label: 'Community Leader',  desc: 'Created 3+ communities',color: 'purple'  },
    { key: 'mentor',      emoji: '🎓', label: 'Mentor',            desc: 'Helped 10+ members',    color: 'cyan'    },
  ];

  const earned = trust?.badges || [];

  return (
    <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophySolid className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Reputation Badges</h3>
        </div>
        <span className="text-xs text-slate-500">
          {earned.length}/{allBadges.length} earned
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 gap-3">
        {allBadges.map((badge, i) => {
          const isEarned = earned.includes(badge.key);
          return (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isEarned
                  ? `border-${badge.color}-500/25 bg-${badge.color}-600/8`
                  : 'border-white/5 bg-white/2 opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                isEarned ? `bg-${badge.color}-600/15` : 'bg-white/5'
              }`}>
                {isEarned ? badge.emoji : '🔒'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isEarned ? 'text-white' : 'text-slate-500'}`}>
                  {badge.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{badge.desc}</p>
              </div>
              {isEarned && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${badge.color}-600/20 text-${badge.color}-400 border border-${badge.color}-500/20`}
                >
                  Earned
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Leaderboard ─── */
function Leaderboard({ leaderboard, currentUserId }) {
  const podiumColors = ['amber', 'slate', 'orange'];
  const podiumEmojis = ['🥇', '🥈', '🥉'];

  if (!leaderboard?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TrophySolid className="w-10 h-10 text-slate-700 mb-3" />
        <p className="text-slate-400 text-sm">Leaderboard loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Podium top 3 */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const height     = actualRank === 1 ? 'h-24' : actualRank === 2 ? 'h-18' : 'h-14';
            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {entry.fullName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-2 -right-1 text-lg">{podiumEmojis[actualRank - 1]}</span>
                </div>
                <p className="text-xs font-semibold text-white text-center max-w-[70px] truncate">
                  {entry.fullName?.split(' ')[0]}
                </p>
                <div className={`${height} w-16 rounded-t-xl bg-gradient-to-t from-${podiumColors[actualRank - 1]}-900/60 to-${podiumColors[actualRank - 1]}-600/30 border border-${podiumColors[actualRank - 1]}-500/20 flex items-center justify-center`}>
                  <p className={`text-sm font-bold text-${podiumColors[actualRank - 1]}-400`}>
                    {entry.trustScore ?? 0}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">All Rankings</h3>
        </div>
        <div>
          {leaderboard.map((entry, i) => {
            const isCurrentUser = entry._id === currentUserId;
            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 px-4 py-3 border-b border-white/4 last:border-0 transition-colors ${
                  isCurrentUser
                    ? 'bg-indigo-600/8 border-l-2 border-l-indigo-500'
                    : 'hover:bg-white/3'
                }`}
              >
                {/* Rank */}
                <div className="w-7 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-base">{podiumEmojis[i]}</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {entry.fullName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                      {entry.fullName}
                    </p>
                    {isCurrentUser && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 font-medium flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">@{entry.username}</p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <TrustBadgePill score={entry.trustScore ?? 0} small />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeletons ─── */
function ScoreCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white/8" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 bg-white/8 rounded-full" />
          <div className="h-3 w-48 bg-white/5 rounded-full" />
          <div className="h-2.5 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Re-exported helper used in TrustScore ─── */
export function TrustBadgePill({ score, small }) {
  const level =
    score >= 90 ? { label: 'Trusted',    color: 'emerald', bg: 'emerald' } :
    score >= 70 ? { label: 'Reliable',   color: 'indigo',  bg: 'indigo'  } :
    score >= 50 ? { label: 'Average',    color: 'amber',   bg: 'amber'   } :
                  { label: 'Suspicious', color: 'red',     bg: 'red'     };

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border
      ${small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
      bg-${level.bg}-600/15 text-${level.color}-400 border-${level.color}-500/25`}
    >
      {!small && <ShieldSolid className="w-3.5 h-3.5" />}
      {small ? score : `${score} · ${level.label}`}
    </span>
  );
}