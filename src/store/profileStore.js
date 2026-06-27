import { create } from 'zustand'
import { userService } from '@/services/userService'

export const useProfileStore = create((set, get) => ({
  profiles: {},
  loading: false,
  error: null,

  fetchProfile: async (username) => {
    set({ loading: true, error: null })
    try {
      const res = await userService.getProfile(username)
      set((s) => ({
        profiles: { ...s.profiles, [username]: res.data.user },
        loading: false,
      }))
      return res.data.user
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load profile' })
      return null
    }
  },

  updateProfileInStore: (username, data) =>
    set((s) => ({
      profiles: {
        ...s.profiles,
        [username]: { ...s.profiles[username], ...data },
      },
    })),

  clearError: () => set({ error: null }),
}))