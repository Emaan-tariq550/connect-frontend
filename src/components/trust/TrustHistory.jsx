import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/* ── Event type config ── */
const EVENT_CONFIG = {
  email_verified:       { icon: '✅', label: 'Email Verified',         direction: 'positive' },
  message_sent:         { icon: '💬', label: 'Active Messaging',        direction: 'positive' },
  positive_feedback:    { icon: '👍', label: 'Positive Feedback',       direction: 'positive' },
  call_completed:       { icon: '📞', label: 'Call Completed',          direction: 'positive' },
  community_joined:     { icon: '🏘️', label: 'Joined Community',       direction: 'positive' },
  profile_completed:    { icon: '🪪', label: 'Profile Completed',       direction: 'positive' },
  report_received:      { icon: '🚩', label: 'Report Received',         direction: 'negative' },
  spam_detected:        { icon: '🚫', label: 'Spam Detected',           direction: 'negative' },
  toxic_behavior:       { icon: '☠️', label: 'Toxic Behavior',          direction: 'negative' },
  fake_content:         { icon: '🤖', label: 'Fake Content Flagged',    direction: 'negative' },
};

function getConfig(type) {
  return EVENT_CONFIG[type] || { icon: '🔔', label: type?.replace(/_/g, ' ') || 'Event', direction: 'neutral' };
}

/* ── Date group label ── */
function dateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d))     return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM yyyy');
}

/* ── Group items by date ── */
function groupByDate(items) {
  const groups = {};
  items.forEach((item) => {
    const label = dateLabel(item.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
}

/* ── Single history row ── */
function HistoryRow({ item, index }) {
  const cfg       = getConfig(item.eventType);
  const isPos     = cfg.direction === 'positive';
  const isNeg     = cfg.direction === 'negative';
  const change    = item.change ?? item.scoreChange ?? 0;
  const absChange = Math.abs(change);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/3 transition-colors border-b border-white/4 last:border-0"
    >
      {/* Icon bubble */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border ${
        isPos
          ? 'bg-emerald-600/10 border-emerald-500/20'
          : isNeg
          ? 'bg-red-600/10 border-red-500/20'
          : 'bg-white/5 border-white/8'
      }`}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{cfg.label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <ClockIcon className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <p className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </p>
          {item.note && (
            <>
              <span className="text-slate-700">·</span>
              <p className="text-xs text-slate-500 truncate">{item.note}</p>
            </>
          )}
        </div>
      </div>

      {/* Score change */}
      {absChange > 0 && (
        <div className={`flex items-center gap-1 font-bold text-sm flex-shrink-0 ${
          isPos ? 'text-emerald-400' : isNeg ? 'text-red-400' : 'text-slate-400'
        }`}>
          {isPos
            ? <ArrowTrendingUpIcon className="w-4 h-4" />
            : <ArrowTrendingDownIcon className="w-4 h-4" />
          }
          {isPos ? '+' : '-'}{absChange}
        </div>
      )}
    </motion.div>
  );
}

/* ── Main list ── */
export default function TrustHistoryList({ history, loading, onLoadMore }) {
  const groups     = groupByDate(history);
  const groupKeys  = Object.keys(groups);
  const loaderRef  = useRef(null);

  /* infinite scroll observer */
  const observe = useCallback((node) => {
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore?.(); },
      { threshold: 0.1 }
    );
    io.observe(node);
    loaderRef.current = io;
    return () => io.disconnect();
  }, [onLoadMore]);

  if (loading && !history.length) {
    return (
      <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
        <HistorySkeleton />
      </div>
    );
  }

  if (!history.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-3">
          <ClockIcon className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium text-sm">No trust events yet</p>
        <p className="text-slate-600 text-xs mt-1">
          Your trust activity will appear here
        </p>
      </motion.div>
    );
  }

  let rowIndex = 0;

  return (
    <div className="space-y-4">
      {groupKeys.map((dateKey) => (
        <div key={dateKey} className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
          {/* Date header */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {dateKey}
            </span>
          </div>

          {/* Rows */}
          <AnimatePresence>
            {groups[dateKey].map((item) => {
              const idx = rowIndex++;
              return <HistoryRow key={item._id} item={item} index={idx} />;
            })}
          </AnimatePresence>
        </div>
      ))}

      {/* Load more trigger */}
      <div ref={observe} className="py-2 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            Loading more…
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function HistorySkeleton() {
  return (
    <div className="divide-y divide-white/4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-white/8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-white/8 rounded-full w-36" />
            <div className="h-2.5 bg-white/5 rounded-full w-24" />
          </div>
          <div className="h-4 w-10 bg-white/8 rounded-full" />
        </div>
      ))}
    </div>
  );
}