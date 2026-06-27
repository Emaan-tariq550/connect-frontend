import { create } from 'zustand';
import {
  getCommunities, getExploreCommunities, getCommunityById,
  createCommunity, joinCommunity, leaveCommunity,
  getCommunityFeed, postToCommunity, getCommunityMembers,
} from '../api/community';
import toast from 'react-hot-toast';

export const useCommunityStore = create((set, get) => ({
  myCommunities:     [],
  exploreCommunities:[],
  currentCommunity:  null,
  communityFeed:     [],
  members:           [],
  loading:           false,
  feedLoading:       false,
  createLoading:     false,

  fetchMyCommunities: async () => {
    set({ loading: true });
    try {
      const { data } = await getCommunities();
      set({ myCommunities: data?.communities || data || [] });
    } catch { toast.error('Failed to load communities'); }
    finally { set({ loading: false }); }
  },

  fetchExplore: async (search = '') => {
    set({ loading: true });
    try {
      const { data } = await getExploreCommunities(search);
      set({ exploreCommunities: data?.communities || data || [] });
    } catch {}
    finally { set({ loading: false }); }
  },

  fetchCommunity: async (id) => {
    set({ loading: true });
    try {
      const { data } = await getCommunityById(id);
      set({ currentCommunity: data?.community || data });
    } catch { toast.error('Community not found'); }
    finally { set({ loading: false }); }
  },

  fetchFeed: async (id, page = 1) => {
    set({ feedLoading: true });
    try {
      const { data } = await getCommunityFeed(id, page);
      const posts = data?.posts || data || [];
      set((s) => ({ communityFeed: page === 1 ? posts : [...s.communityFeed, ...posts] }));
    } catch {}
    finally { set({ feedLoading: false }); }
  },

  fetchMembers: async (id) => {
    try {
      const { data } = await getCommunityMembers(id);
      set({ members: data?.members || data || [] });
    } catch {}
  },

  createCommunity: async (formData) => {
    set({ createLoading: true });
    try {
      const { data } = await createCommunity(formData);
      const community = data?.community || data;
      set((s) => ({ myCommunities: [community, ...s.myCommunities] }));
      toast.success('Community created!');
      return community;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create community');
    } finally { set({ createLoading: false }); }
  },

  joinCommunity: async (id) => {
    try {
      await joinCommunity(id);
      // Fresh data fetch karo taake members array update ho
      const { data } = await getCommunityById(id);
      const updated = data?.community || data;
      set((s) => ({
        exploreCommunities: s.exploreCommunities.map((c) =>
          c._id === id ? { ...c, isMember: true, memberCount: (c.memberCount || 0) + 1 } : c
        ),
        myCommunities: s.myCommunities.some(c => c._id === id)
          ? s.myCommunities
          : [updated, ...s.myCommunities],
        currentCommunity: s.currentCommunity?._id === id ? updated : s.currentCommunity,
      }));
      toast.success('Joined community!');
    } catch { toast.error('Failed to join'); }
  },

  leaveCommunity: async (id) => {
    try {
      await leaveCommunity(id);
      // Fresh data fetch karo
      const { data } = await getCommunityById(id);
      const updated = data?.community || data;
      set((s) => ({
        myCommunities: s.myCommunities.filter((c) => c._id !== id),
        currentCommunity: s.currentCommunity?._id === id ? updated : s.currentCommunity,
      }));
      toast.success('Left community');
    } catch { toast.error('Failed to leave'); }
  },

  postToCommunity: async (id, formData) => {
    try {
      const { data } = await postToCommunity(id, formData);
      const post = data?.post || data;
      set((s) => ({ communityFeed: [post, ...s.communityFeed] }));
      toast.success('Posted!');
      return post;
    } catch { toast.error('Failed to post'); }
  },
}));