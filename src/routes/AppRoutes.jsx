import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import SplashScreen from '@/components/common/SplashScreen'
import MainLayout from '@/layouts/MainLayout'

import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Profile from '@/pages/profile/Profile'
import EditProfile from '@/pages/profile/EditProfile'
import Friends from '@/pages/friends/Friends'
import Requests from '@/pages/friends/Requests'
import Chats from '../pages/chat/Chats'
import ChatRoom from '../pages/chat/ChatRoom'
import CallScreen from '../pages/calls/CallScreen'
import Communities from '../pages/community/Communities'
import CommunityDetails from '../pages/community/CommunityDetails'
import CreateCommunity from '../pages/community/CreateCommunity'
import Notifications from '../pages/notifications/Notifications'
import TrustCenter from '../pages/trust/TrustCenter'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminUsers from '../pages/admin/Users'
import AdminReports from '../pages/admin/Reports'
import AdminCommunities from '../pages/admin/Communities'
import Dashboard from '@/pages/auth/Dashboard'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <SplashScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <SplashScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AdminOnly({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <SplashScreen />
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest-only routes */}
      <Route path="/login"                  element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register"               element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password"        element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/reset-password/:token"  element={<GuestRoute><ResetPassword /></GuestRoute>} />

      {/* ✅ CallScreen — MainLayout se BAHAR */}
      <Route path="/call/:callId"           element={<ProtectedRoute><CallScreen /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
        <Route index              element={<AdminDashboard />}   />
        <Route path="users"       element={<AdminUsers />}       />
        <Route path="reports"     element={<AdminReports />}     />
        <Route path="communities" element={<AdminCommunities />} />
      </Route>

      {/* Protected routes — inside MainLayout */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index                          element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"               element={<Dashboard />} />
        <Route path="profile/:username"       element={<Profile />} />
        <Route path="settings/profile"        element={<EditProfile />} />
        <Route path="friends"                 element={<Friends />} />
        <Route path="friends/requests"        element={<Requests />} />
        <Route path="chat"                    element={<Chats />} />
        <Route path="chat/:chatId"            element={<ChatRoom />} />
        <Route path="communities"             element={<Communities />} />
        <Route path="communities/create"      element={<CreateCommunity />} />
        <Route path="communities/:id"         element={<CommunityDetails />} />
        <Route path="notifications"           element={<Notifications />} />
        <Route path="trust"                   element={<TrustCenter />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}