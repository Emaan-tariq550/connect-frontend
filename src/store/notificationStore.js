import { create } from 'zustand'
import api from '@/api/axios'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const res = await api.get('/notifications')
      const notifs = res.data.notifications || []
      set({
        notifications: notifs,
        unreadCount: notifs.filter((n) => !n.isRead).length,
      })
    } catch {}
    finally { set({ loading: false }) }
  },

  // FIXED: patch → put
  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all')
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
    } catch {}
  },

  // FIXED: patch → put
  markOneRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }))
    } catch {}
  },

  // FIXED: clear-all route nahi tha, sab ek ek delete karo
  clearAll: async () => {
    try {
      const notifs = get().notifications
      await Promise.allSettled(notifs.map((n) => api.delete(`/notifications/${n._id}`)))
      set({ notifications: [], unreadCount: 0 })
    } catch {}
  },

  deleteOne: async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      set((s) => ({
        notifications: s.notifications.filter((n) => n._id !== id),
        unreadCount: s.notifications.find((n) => n._id === id && !n.isRead)
          ? Math.max(0, s.unreadCount - 1)
          : s.unreadCount,
      }))
    } catch {}
  },

  addNotification: (notif) =>
    set((s) => ({
      notifications: [notif, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
}))