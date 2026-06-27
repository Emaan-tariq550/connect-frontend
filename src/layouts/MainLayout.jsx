import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import Rightbar from '@/components/layout/Rightbar'
import MobileNav from '@/components/layout/MobileNav'
import { useLayoutStore } from '@/store/layoutStore'

export default function MainLayout() {
  const { sidebarOpen, rightbarOpen } = useLayoutStore()
  const location = useLocation()

  // Chat routes pe rightbar nahi chahiye
  const isChatRoute = location.pathname.startsWith('/chat')

  const showRightbar = rightbarOpen && !isChatRoute

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 min-w-0
            ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}
            ${showRightbar ? 'xl:mr-72' : ''}
          `}
        >
          <div className="max-w-3xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {showRightbar && <Rightbar />}
      </div>

      <MobileNav />
    </div>
  )
}