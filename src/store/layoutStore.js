import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLayoutStore = create(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      rightbarOpen: true,
      mobileNavVisible: true,
      activeRoute: '/',

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleRightbar: () => set((s) => ({ rightbarOpen: !s.rightbarOpen })),
      setSidebarOpen: (val) => set({ sidebarOpen: val }),
      setActiveRoute: (route) => set({ activeRoute: route }),
    }),
    { name: 'connect-layout' }
  )
)