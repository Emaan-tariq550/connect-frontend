import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Flag, Globe,
  LogOut, ShieldCheck, X, Menu
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/admin/users',       icon: Users,           label: 'Users'        },
  { to: '/admin/reports',     icon: Flag,            label: 'Reports'      },
  { to: '/admin/communities', icon: Globe,           label: 'Communities'  },
];

export default function AdminSidebar() {
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);

  const sidebarStyles = {
    position:        'fixed',
    top:             0,
    left:            open ? 0 : '-260px',
    width:           '240px',
    height:          '100vh',
    background:      '#0A0A0F',
    borderRight:     '1px solid rgba(255,255,255,0.06)',
    display:         'flex',
    flexDirection:   'column',
    zIndex:          100,
    transition:      'left 0.25s ease',
    padding:         '0',
  };

  const desktopOverride = `
    @media (min-width: 900px) {
      .admin-sidebar { left: 0 !important; }
      .admin-menu-btn { display: none !important; }
    }
  `;

  return (
    <>
      <style>{desktopOverride}</style>

      {/* Mobile toggle */}
      <button
        className="admin-menu-btn"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 200,
          background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#6C63FF',
          display: 'flex', alignItems: 'center',
        }}
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 99, backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside className="admin-sidebar" style={sidebarStyles}>
        {/* Brand */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#6C63FF,#4ECDC4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                Connect
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
                Admin Panel
              </div>
            </div>
          </div>
          <button
            className="admin-menu-btn"
            onClick={() => setOpen(false)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', padding: '4px', display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display:        'flex',
                alignItems:     'center',
                gap:            '12px',
                padding:        '10px 14px',
                borderRadius:   '10px',
                marginBottom:   '4px',
                textDecoration: 'none',
                background:     isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                border:         isActive ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent',
                color:          isActive ? '#6C63FF' : 'rgba(255,255,255,0.45)',
                fontSize:       '14px',
                fontWeight:     isActive ? 600 : 400,
                transition:     'all 0.18s',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,107,107,0.08)',
              border: '1px solid rgba(255,107,107,0.18)', color: '#FF6B6B',
              fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}