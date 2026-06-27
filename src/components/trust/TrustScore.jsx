import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

/* ── Score level config ── */
export function getTrustLevel(score) {
  if (score >= 90) return { label: 'Trusted',    color: '#10B981', ring: '#10B981', glow: 'rgba(16,185,129,0.25)', bg: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/25' };
  if (score >= 70) return { label: 'Reliable',   color: '#6366F1', ring: '#6366F1', glow: 'rgba(99,102,241,0.25)',  bg: 'from-indigo-600/20 to-indigo-900/10',   border: 'border-indigo-500/25'  };
  if (score >= 50) return { label: 'Average',    color: '#F59E0B', ring: '#F59E0B', glow: 'rgba(245,158,11,0.25)',  bg: 'from-amber-600/20 to-amber-900/10',     border: 'border-amber-500/25'   };
  return           { label: 'Suspicious', color: '#EF4444', ring: '#EF4444', glow: 'rgba(239,68,68,0.25)',    bg: 'from-red-600/20 to-red-900/10',         border: 'border-red-500/25'     };
}

/* ── Animated circular gauge ── */
function CircleGauge({ score, size = 120, stroke = 10 }) {
  const r        = (size - stroke) / 2;
  const circ     = 2 * Math.PI * r;
  const pct      = Math.min(Math.max(score, 0), 100);
  const level    = getTrustLevel(score);
  const dashLen  = (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40 pointer-events-none"
        style={{ background: level.glow }}
      />
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={level.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dashLen }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-white font-poppins leading-none"
        >
          {score ?? '—'}
        </motion.span>
        <span className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
          /100
        </span>
      </div>
    </div>
  );
}

/* ── Main TrustScore card ── */
export default function TrustScore({ trust, user, isOwn }) {
  const score = trust?.score ?? trust?.trustScore ?? 0;
  const level = getTrustLevel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-2xl border ${level.border} overflow-hidden`}
      style={{ background: 'rgba(15,23,42,0.7)' }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${level.bg} pointer-events-none`} />

      <div className="relative p-5">
        <div className="flex items-center gap-5">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <CircleGauge score={score} size={104} stroke={9} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheckIcon className="w-4 h-4 flex-shrink-0" style={{ color: level.color }} />
              <span className="text-sm font-bold" style={{ color: level.color }}>
                {level.label}
              </span>
            </div>

            <p className="text-white font-semibold text-base font-poppins truncate mb-1">
              {isOwn ? 'Your Trust Score' : `${user?.fullName?.split(' ')[0]}'s Score`}
            </p>

            {/* Change indicator */}
            {trust?.recentChange !== undefined && trust.recentChange !== 0 && (
              <div className={`inline-flex items-center gap-1 text-xs font-semibold mb-2 ${
                trust.recentChange > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {trust.recentChange > 0
                  ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                  : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                }
                {trust.recentChange > 0 ? '+' : ''}{trust.recentChange} this week
              </div>
            )}

            {/* Score bar */}
            <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(to right, ${level.ring}99, ${level.ring})` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-medium">
              <span>0</span>
              <span>Suspicious</span>
              <span>Average</span>
              <span>Reliable</span>
              <span>Trusted</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Level thresholds strip */}
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {[
            { range: '0–49',   label: 'Suspicious', color: 'red',     active: score < 50 },
            { range: '50–69',  label: 'Average',    color: 'amber',   active: score >= 50 && score < 70 },
            { range: '70–89',  label: 'Reliable',   color: 'indigo',  active: score >= 70 && score < 90 },
            { range: '90–100', label: 'Trusted',    color: 'emerald', active: score >= 90 },
          ].map(({ range, label, color, active }) => (
            <div
              key={label}
              className={`rounded-xl px-2 py-2 text-center border transition-all ${
                active
                  ? `bg-${color}-600/18 border-${color}-500/30`
                  : 'bg-white/3 border-white/5 opacity-40'
              }`}
            >
              <p className={`text-[10px] font-bold ${active ? `text-${color}-400` : 'text-slate-500'}`}>
                {label}
              </p>
              <p className="text-[9px] text-slate-600 mt-0.5">{range}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}