import { useEffect, useState, useCallback } from 'react';
import { Search, ShieldOff, ShieldCheck, Trash2, Loader2, UserX } from 'lucide-react';
import { getAllUsers, banUser, unbanUser, deleteUser } from '../../services/adminService';

const AVATAR = (u) =>
  u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=6C63FF&color=fff&size=40`;

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [acting,  setActing]  = useState(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers({ search, page, limit: LIMIT });
      setUsers(data.users || data);
      setTotal(data.total || 0);
    } catch { /* handled silently */ }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handle = async (action, id) => {
    setActing(id);
    try {
      if (action === 'ban')    await banUser(id);
      if (action === 'unban')  await unbanUser(id);
      if (action === 'delete') await deleteUser(id);
      await load();
    } catch { /* ignore */ }
    finally { setActing(null); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div style={{ padding: '32px 28px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>Users</h1>
          <p style={{ margin: '5px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
            {total} registered accounts
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            style={{
              paddingLeft: '36px', paddingRight: '16px', height: '38px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', width: '240px',
            }}
          />
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px',
          padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {['User', 'Email', 'Status', 'Actions'].map((h) => (
            <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={28} color="#6C63FF" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>
            <UserX size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ margin: 0 }}>No users found</p>
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px',
                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
                opacity: acting === u._id ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={AVATAR(u)} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{u.username}</div>
                  {u.role === 'admin' && (
                    <span style={{ fontSize: '10px', color: '#6C63FF', fontWeight: 600 }}>ADMIN</span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.email}
              </div>

              <div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                  background: u.isBanned ? 'rgba(255,107,107,0.12)' : 'rgba(163,230,107,0.12)',
                  color: u.isBanned ? '#FF6B6B' : '#A3E66B',
                  border: `1px solid ${u.isBanned ? 'rgba(255,107,107,0.25)' : 'rgba(163,230,107,0.25)'}`,
                }}>
                  {u.isBanned ? 'Banned' : 'Active'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handle(u.isBanned ? 'unban' : 'ban', u._id)}
                  disabled={acting === u._id || u.role === 'admin'}
                  title={u.isBanned ? 'Unban' : 'Ban'}
                  style={{
                    padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                    background: u.isBanned ? 'rgba(163,230,107,0.1)' : 'rgba(255,140,66,0.1)',
                    color: u.isBanned ? '#A3E66B' : '#FF8C42',
                    opacity: u.role === 'admin' ? 0.3 : 1,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {u.isBanned ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                </button>
                <button
                  onClick={() => handle('delete', u._id)}
                  disabled={acting === u._id || u.role === 'admin'}
                  title="Delete user"
                  style={{
                    padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                    background: 'rgba(255,107,107,0.1)', color: '#FF6B6B',
                    opacity: u.role === 'admin' ? 0.3 : 1,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: page === p ? '#6C63FF' : 'rgba(255,255,255,0.06)',
                color: page === p ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: '13px', fontWeight: page === p ? 600 : 400,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}