import { create } from 'zustand'
import api from '@/api/axios'

export const useSearchStore = create((set) => ({
  query: '',
  results: { users: [], posts: [], communities: [] },
  loading: false,
  open: false,

  setQuery: (q) => set({ query: q }),
  setOpen: (val) => set({ open: val }),
  clearSearch: () => set({ query: '', results: { users: [], posts: [], communities: [] }, open: false }),

  search: async (q) => {
    if (!q.trim()) return set({ results: { users: [], posts: [], communities: [] } })
    set({ loading: true })
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}&limit=5`)
      set({ results: { users: res.data.users || [], posts: [], communities: [] } })
    } catch {}
    finally { set({ loading: false }) }
  },
}))