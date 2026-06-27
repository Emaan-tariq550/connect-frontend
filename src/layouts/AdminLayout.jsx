import AdminSidebar from '../components/admin/AdminSidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D12', fontFamily: "'Inter',sans-serif" }}>
      <AdminSidebar />
      <main style={{
        marginLeft: '0',
        flex: 1,
        minHeight: '100vh',
        overflowY: 'auto',
        // push content on desktop
      }}>
        <style>{`@media(min-width:900px){ main { margin-left: 240px; } }`}</style>
        <Outlet />
      </main>
    </div>
  );
}