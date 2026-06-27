import { create } from 'zustand'
import { friendService } from '@/services/friendService'

export const useFriendStore = create((set, get) => ({
  friends: [],
  incoming: [],
  outgoing: [],
  totalFriends: 0,
  loading: false,
  page: 1,
  hasMore: true,

  fetchFriends: async (page = 1) => {
    set({ loading: true })
    try {
      const res = await friendService.getFriends(page)
      const { friends, total, hasMore } = res.data
      set((s) => ({
        friends: page === 1 ? friends : [...s.friends, ...friends],
        totalFriends: total,
        hasMore: hasMore ?? false,
        page,
        loading: false,
      }))
    } catch { set({ loading: false }) }
  },

  fetchRequests: async () => {
    try {
      const [inRes, outRes] = await Promise.allSettled([
        friendService.getIncomingRequests(),
        friendService.getOutgoingRequests(),
      ])
      if (inRes.status === 'fulfilled') set({ incoming: inRes.value.data.requests || [] })
      if (outRes.status === 'fulfilled') set({ outgoing: outRes.value.data.requests || [] })
    } catch {}
  },

  acceptRequest: async (userId) => {
    await friendService.acceptRequest(userId)
    set((s) => ({
      incoming: s.incoming.filter((r) => r.sender._id !== userId),
    }))
    get().fetchFriends(1)
  },

  rejectRequest: async (userId) => {
    await friendService.rejectRequest(userId)
    set((s) => ({ incoming: s.incoming.filter((r) => r.sender._id !== userId) }))
  },

  cancelRequest: async (userId) => {
    await friendService.cancelRequest(userId)
    set((s) => ({ outgoing: s.outgoing.filter((r) => r.receiver._id !== userId) }))
  },

  removeFriend: async (userId) => {
    await friendService.removeFriend(userId)
    set((s) => ({
      friends: s.friends.filter((f) => f._id !== userId),
      totalFriends: Math.max(0, s.totalFriends - 1),
    }))
  },
}))