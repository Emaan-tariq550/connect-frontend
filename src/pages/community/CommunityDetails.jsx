import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import CommunityHeader from '../../components/community/CommunityHeader';
import {
  ArrowLeftIcon, PaperAirplaneIcon,
  PhotoIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const TABS = ['Feed', 'Members', 'About'];

export default function CommunityDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const {
    currentCommunity, communityFeed, members,
    fetchCommunity, fetchFeed, fetchMembers,
    joinCommunity, leaveCommunity, postToCommunity,
    loading, feedLoading,
  } = useCommunityStore();

  const [tab, setTab]       = useState('Feed');
  const [postText, setPostText] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [postPrev, setPostPrev] = useState(null);
  const [posting, setPosting]  = useState(false);


 const isMember = currentCommunity?.members?.some(
  (m) => (m.user?._id || m.user)?.toString() === user?._id?.toString()
) || currentCommunity?.isMember === true;
  const isAdmin   = currentCommunity?.admin === user?._id || currentCommunity?.admin?._id === user?._id;

  useEffect(() => {
    fetchCommunity(id);
    fetchFeed(id);
    fetchMembers(id);
  }, [id]);

  const handlePost = async () => {
    if (!postText.trim() && !postFile) return;
    setPosting(true);
    const fd = new FormData();
    if (postText) fd.append('content', postText);
    if (postFile) fd.append('file', postFile);
    await postToCommunity(id, fd);
    setPostText('');
    setPostFile(null);
    setPostPrev(null);
    setPosting(false);
  };

  if (loading && !currentCommunity) return <CommunityDetailsSkeleton />;

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto custom-scrollbar">
      {/* Back button */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/communities')}
          className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </motion.button>
        <h2 className="font-semibold text-white truncate">{currentCommunity?.name}</h2>
      </div>

      {/* Banner + info header */}
      <CommunityHeader
        community={currentCommunity}
        isMember={isMember}
        isAdmin={isAdmin}
        onJoin={() => joinCommunity(id)}
        onLeave={() => leaveCommunity(id)}
      />

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-4 sticky top-[57px] bg-[#0F172A] z-10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-5 py-3 text-sm font-medium transition-colors ${
              tab === t ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
            {tab === t && (
              <motion.div
                layoutId="community-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {tab === 'Feed' && (
            <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Post input */}
              {isMember && (
                <div className="bg-white/4 border border-white/8 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {user?.fullName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder={`Share something with ${currentCommunity?.name}...`}
                        rows={3}
                        className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none resize-none"
                      />
                      {postPrev && (
                        <div className="relative inline-block mt-2">
                          <img src={postPrev} alt="" className="h-24 rounded-xl object-cover border border-white/10" />
                          <button
                            onClick={() => { setPostFile(null); setPostPrev(null); }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-indigo-400 transition-colors text-sm">
                      <PhotoIcon className="w-5 h-5" />
                      <span>Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setPostFile(f);
                          setPostPrev(URL.createObjectURL(f));
                        }}
                      />
                    </label>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePost}
                      disabled={posting || (!postText.trim() && !postFile)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                    >
                      {posting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <PaperAirplaneIcon className="w-4 h-4" />
                      )}
                      Post
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Posts */}
              {feedLoading ? (
                <FeedSkeleton />
              ) : communityFeed.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No posts yet. {isMember ? 'Be the first to post!' : 'Join to post.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {communityFeed.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'Members' && (
            <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-2">
                {members.map((member, i) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                      {member.avatar ? (
                        <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {member.fullName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{member.fullName}</p>
                      <p className="text-xs text-slate-500">@{member.username}</p>
                    </div>
                    {(currentCommunity?.admin === member._id || currentCommunity?.admin?._id === member._id) && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-400 font-medium">
                        Admin
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'About' && (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                <InfoBlock label="Description" value={currentCommunity?.description} />
                <InfoBlock label="Category"    value={currentCommunity?.category} />
                <InfoBlock label="Privacy"     value={currentCommunity?.privacy === 'public' ? '🌐 Public' : '🔒 Private'} />
                <InfoBlock label="Members"     value={`${currentCommunity?.memberCount || members.length} members`} />
                {currentCommunity?.tags?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {currentCommunity.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-slate-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <div className="bg-white/4 border border-white/6 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {post.author?.fullName?.[0]}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{post.author?.fullName}</p>
          <p className="text-xs text-slate-500">
            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
          </p>
        </div>
      </div>
      {post.content && <p className="text-sm text-slate-200 leading-relaxed mb-3">{post.content}</p>}
      {post.fileUrl && post.fileType?.startsWith('image') && (
        <img src={post.fileUrl} alt="" className="w-full rounded-xl object-cover max-h-72 border border-white/5" />
      )}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return value ? (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  ) : null;
}

function CommunityDetailsSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#0F172A] animate-pulse">
      <div className="h-40 bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-40 bg-white/8 rounded-full" />
        <div className="h-3 w-64 bg-white/5 rounded-full" />
        <div className="h-3 w-48 bg-white/5 rounded-full" />
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white/4 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/8" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-white/8 rounded-full" />
              <div className="h-2 w-16 bg-white/5 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-white/5 rounded-full" />
            <div className="h-3 w-4/5 bg-white/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}