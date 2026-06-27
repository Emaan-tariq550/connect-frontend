import { useEffect, useState } from 'react';
import { Users, Flag, Globe, TrendingUp, ShieldAlert, Activity } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { getAdminStats } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: Users,      label: 'Total Users',       value: stats?.totalUsers,       accent: '#6C63FF', sub: `+${stats?.newUsersToday ?? 0} today`        },
    { icon: Flag,       label: 'Open Reports',      value: stats?.openReports,      accent: '#FF6B6B', sub: stats?.openReports > 0 ? 'Needs review' : 'All clear' },
    { icon: Globe,      label: 'Communities',       value: stats?.totalCommunities, accent: '#4ECDC4', sub: `${stats?.activeCommunities ?? 0} active`     },
    { icon: TrendingUp, label: 'Messages Today',    value: stats?.messagesToday,    accent: '#F7B731', sub: null                                           },
    { icon: ShieldAlert,label: 'Banned Users',      value: stats?.bannedUsers,      accent: '#FF8C42', sub: null                                           },
    { icon: Activity,   label: 'Active Now',        value: stats?.activeNow,        accent: '#A8E063', sub: 'Online users'                                 },
  ];

  return (
    <div style={{ padding: '32px 28px', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>
          Overview
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
          Platform health at a glance
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)',
          borderRadius: '12px', padding: '14px 18px', color: '#FF6B6B',
          fontSize: '14px', marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {cards.map((c) => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>
    </div>
  );
}