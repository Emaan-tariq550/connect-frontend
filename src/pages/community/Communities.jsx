import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunityStore } from '../../store/communityStore';
import CommunityCard from '../../components/community/CommunityCard';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/Modal';
import {
  MagnifyingGlassIcon, PlusIcon,
  Squares2X2Icon, ListBulletIcon,
} from '@heroicons/react/24/outline';

export default function Communities() {
  const navigate = useNavigate();
  const {
    myCommunities, exploreCommunities,
    fetchMyCommunities, fetchExplore,
    joinCommunity, leaveCommunity, loading,
  } = useCommunityStore();

  const [tab,          setTab]          = useState('mine');
  const [search,       setSearch]       = useState('');
  const [view,         setView]         = useState('grid');
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [leaveTarget,  setLeaveTarget]  = useState(null);

  useEffect(() => { fetchMyCommunities(); fetchExplore(); }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (tab === 'explore') fetchExplore(search); }, 400);
    return () => clearTimeout(t);
  }, [search, tab]);

  const displayed = tab === 'mine' ? myCommunities : exploreCommunities;

  const handleLeaveClick = (communityId) => {
    setLeaveTarget(communityId);
    setLeaveConfirm(true);
  };

  const handleLeaveCommunity = async () => {
    if (!leaveTarget) return;
    await leaveCommunity(leaveTarget);
    setLeaveConfirm(false);
    setLeaveTarget(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto custom-scrollbar">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold font-poppins text-white">Communities</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {tab === 'mine'
                ? `${myCommunities.length} joined`
                : `${exploreCommunities.length} available`}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/communities/create')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 transition-shadow"
          >
            <PlusIcon className="w-4 h-4" />
            Create
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-4">
          {[
            { key: 'mine',    label: 'My Communities' },
            { key: 'explore', label: 'Explore'        },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex items-center bg-white/5 border border-white/8 rounded-xl p-1 gap-0.5">
            {[
              { v: 'grid', Icon: Squares2X2Icon },
              { v: 'list', Icon: ListBulletIcon },
            ].map(({ v, Icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-1.5 rounded-lg transition-colors ${
                  view === v ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <Skeleton type="community" count={3} />
        ) : displayed.length === 0 ? (
          <EmptyState
            type="channels"
            action={() => navigate('/communities/create')}
            actionLabel="Create Community"
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${view}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'flex flex-col gap-3'
              }
            >
              {displayed.map((community, i) => (
                <CommunityCard
                  key={community._id}
                  community={community}
                  view={view}
                  index={i}
                  onJoin={() => joinCommunity(community._id)}
                  onLeave={() => handleLeaveClick(community._id)}
                  onClick={() => navigate(`/communities/${community._id}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Leave Confirm Modal */}
      <ConfirmModal
        isOpen={leaveConfirm}
        onClose={() => { setLeaveConfirm(false); setLeaveTarget(null); }}
        onConfirm={handleLeaveCommunity}
        title="Leave Community?"
        message="You will lose access to all channels in this community."
        confirmText="Leave"
        danger
      />

    </div>
  );
}