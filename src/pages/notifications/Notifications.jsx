import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, Loader2, InboxIcon } from 'lucide-react';
import NotificationCard from '../../components/notifications/NotificationCard';
import { useNotificationStore } from '../../store/notificationStore';

const FILTERS = ['All', 'Unread', 'Friend Requests', 'Messages', 'Community'];

const filterTypeMap = {
  'Friend Requests': 'friend_request',
  Messages: 'message',
  Community: 'community',
};

export default function Notifications() {
  const {
    notifications,
    loading,
    fetchNotifications,
    markOneRead,
    markAllRead,
    deleteOne,
    clearAll,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState('All');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = (id) => markOneRead(id);

  const handleMarkAllRead = () => markAllRead();

  const handleDelete = (id) => deleteOne(id);

  const handleClearAll = async () => {
    setClearing(true);
    await clearAll();
    setClearing(false);
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.isRead;
    return n.type === filterTypeMap[activeFilter];
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D12', padding: '0', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'rgba(13,13,18,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 28px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="#6C63FF" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Notifications</h1>
              {unreadCount > 0 && (
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', color: '#6C63FF', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B', fontSize: '13px', fontWeight: 500, cursor: 'pointer', opacity: clearing ? 0.6 : 1 }}
              >
                <Trash2 size={15} /> {clearing ? 'Clearing…' : 'Clear all'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 28px 0' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            const count =
              f === 'All' ? notifications.length
              : f === 'Unread' ? notifications.filter((n) => !n.isRead).length
              : notifications.filter((n) => n.type === filterTypeMap[f]).length;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{ padding: '7px 16px', borderRadius: '20px', border: isActive ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.08)', background: isActive ? 'rgba(108,99,255,0.15)' : 'transparent', color: isActive ? '#6C63FF' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: isActive ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {f}
                {count > 0 && (
                  <span style={{ background: isActive ? '#6C63FF' : 'rgba(255,255,255,0.1)', color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={{ marginTop: '20px', paddingBottom: '40px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
              <Loader2 size={32} color="#6C63FF" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>Loading notifications…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <InboxIcon size={28} color="rgba(108,99,255,0.5)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                  {activeFilter === 'All' ? "You're all caught up" : `No ${activeFilter.toLowerCase()} notifications`}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
                  {activeFilter === 'All' ? 'New activity will appear here' : 'Try a different filter'}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationCard
                key={n._id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}