import { create } from 'zustand';
import {
  getMyTrustScore,
  getUserTrustScore,
  getTrustHistory,
  getUserTrustHistory,
  getTrustLeaderboard,
  getTrustStats,
} from '../api/trust';
import toast from 'react-hot-toast';

export const useTrustStore = create((set, get) => ({
  myTrust:     null,
  userTrust:   null,
  history:     [],
  leaderboard: [],
  stats:       null,
  loading:     false,
  historyLoading: false,
  hasMore:     true,
  currentPage: 1,

  fetchMyTrust: async () => {
    set({ loading: true });
    try {
      const { data } = await getMyTrustScore();
      set({ myTrust: data?.trust || data });
    } catch {
      toast.error('Failed to load trust score');
    } finally {
      set({ loading: false });
    }
  },

  fetchUserTrust: async (userId) => {
    set({ loading: true });
    try {
      const { data } = await getUserTrustScore(userId);
      set({ userTrust: data?.trust || data });
    } catch {} finally {
      set({ loading: false });
    }
  },

  fetchHistory: async (page = 1, userId = null) => {
    set({ historyLoading: true });
    try {
      const { data } = userId
        ? await getUserTrustHistory(userId, page)
        : await getTrustHistory(page);
      const items = data?.history || data || [];
      set((s) => ({
        history: page === 1 ? items : [...s.history, ...items],
        hasMore: items.length === 15,
        currentPage: page,
      }));
    } catch {} finally {
      set({ historyLoading: false });
    }
  },

  fetchLeaderboard: async () => {
    try {
      const { data } = await getTrustLeaderboard();
      set({ leaderboard: data?.leaderboard || data || [] });
    } catch {}
  },

  fetchStats: async () => {
    try {
      const { data } = await getTrustStats();
      set({ stats: data?.stats || data });
    } catch {}
  },

  loadMoreHistory: () => {
    const { currentPage, hasMore, historyLoading } = get();
    if (!hasMore || historyLoading) return;
    get().fetchHistory(currentPage + 1);
  },
}));