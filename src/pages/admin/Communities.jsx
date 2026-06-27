import { useEffect, useState, useCallback } from 'react';
import { Globe, Lock, Unlock, Trash2, Loader2, Search, Users } from 'lucide-react';
import { getAllCommunities, deleteCommunity, toggleCommunityLock } from '../../services/adminService';

const AVATAR = (c) =>
  c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=4ECDC4&color=fff&size=40`;

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [acting,      setActing]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllCommunities({ search });
      setCommunities(data.communities || data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handle = async (action, id) => {
    setActing(id);
    try {
      if (action === 'delete') await deleteCommunity(id);
      if (action === 'toggle') await toggleCommunityLock(id);
      await load();
    } catch { /* silent */ }
    finally { setActing(null); }
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>Communities</h1>
          <p style={{ margin: '5px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
            {communities.length} communities
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities…"
            style={{
              paddingLeft: '36px', paddingRight: '16px', height: '38px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', width: '220px',
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '14px',
      }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              height: '130px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              animation: 'pulse 1.5s ease infinite',
            }} />
          ))
          : communities.map((c) => (
            <div
              key={c._id}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '18px',
                opacity: acting === c._id ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <img src={AVATAR(c)} alt="" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Users size={12} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                      {c.memberCount ?? c.members?.length ?? 0} members
                    </span>
                    {c.isLocked && (
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px',
                        background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)',
                      }}>
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p style={{
                margin: '0 0 14px', fontSize: '12px', color: 'rgba(255,255,255,0.3)',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {c.description || 'No description.'}
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handle('toggle', c._id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '7px', borderRadius: '9px', cursor: 'pointer', border: 'none', fontSize: '12px',
                    background: c.isLocked ? 'rgba(163,230,107,0.1)' : 'rgba(255,140,66,0.1)',
                    color: c.isLocked ? '#A3E66B' : '#FF8C42',
                  }}
                >
                  {c.isLocked ? <><Unlock size={13} /> Unlock</> : <><Lock size={13} /> Lock</>}
                </button>
                <button
                  onClick={() => handle('delete', c._id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '7px', borderRadius: '9px', cursor: 'pointer', border: 'none', fontSize: '12px',
                    background: 'rgba(255,107,107,0.1)', color: '#FF6B6B',
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        }
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}