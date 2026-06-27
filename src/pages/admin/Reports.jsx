import { useEffect, useState, useCallback } from 'react';
import { Flag, Check, X, Trash2, Loader2, InboxIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllReports, resolveReport, dismissReport, deleteReport } from '../../services/adminService';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(247,183,49,0.12)', color: '#F7B731', border: 'rgba(247,183,49,0.25)' },
  resolved: { bg: 'rgba(163,230,107,0.1)', color: '#A3E66B', border: 'rgba(163,230,107,0.2)' },
  dismissed:{ bg: 'rgba(136,136,136,0.1)', color: '#888',    border: 'rgba(136,136,136,0.2)' },
};

export default function AdminReports() {
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [acting,   setActing]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllReports({ status: filter });
      setReports(data.reports || data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handle = async (action, id) => {
    setActing(id);
    try {
      if (action === 'resolve')  await resolveReport(id);
      if (action === 'dismiss')  await dismissReport(id);
      if (action === 'delete')   await deleteReport(id);
      await load();
    } catch { /* silent */ }
    finally { setActing(null); }
  };

  const FILTERS = ['pending', 'resolved', 'dismissed'];

  return (
    <div style={{ padding: '32px 28px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>Reports</h1>
        <p style={{ margin: '5px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
          Review flagged content
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
              fontWeight: filter === f ? 600 : 400,
              background: filter === f ? STATUS_COLORS[f].bg : 'transparent',
              border: filter === f ? `1px solid ${STATUS_COLORS[f].border}` : '1px solid rgba(255,255,255,0.08)',
              color: filter === f ? STATUS_COLORS[f].color : 'rgba(255,255,255,0.4)',
              textTransform: 'capitalize', transition: 'all 0.18s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Loader2 size={28} color="#6C63FF" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.25)' }}>
          <InboxIcon size={36} style={{ marginBottom: '14px', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '15px' }}>No {filter} reports</p>
        </div>
      ) : (
        reports.map((r) => {
          const s = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
          const isOpen = expanded === r._id;
          return (
            <div
              key={r._id}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', marginBottom: '10px', overflow: 'hidden',
                opacity: acting === r._id ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
            >
              {/* Header row */}
              <div
                onClick={() => setExpanded(isOpen ? null : r._id)}
                style={{
                  padding: '16px 20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: s.bg, border: `1px solid ${s.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Flag size={16} color={s.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.reason || 'No reason provided'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      Reported by <span style={{ color: 'rgba(255,255,255,0.5)' }}>{r.reportedBy?.username || 'Unknown'}</span>
                      {' · '}
                      {r.targetType || 'content'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    textTransform: 'capitalize',
                  }}>
                    {r.status}
                  </span>
                  {isOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.3)" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ padding: '0 20px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '14px 0 16px', lineHeight: 1.6 }}>
                    {r.description || r.details || 'No additional details provided.'}
                  </p>

                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handle('resolve', r._id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', border: 'none',
                          background: 'rgba(163,230,107,0.12)', color: '#A3E66B', fontSize: '13px', fontWeight: 500,
                        }}
                      >
                        <Check size={14} /> Resolve
                      </button>
                      <button
                        onClick={() => handle('dismiss', r._id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', border: 'none',
                          background: 'rgba(136,136,136,0.1)', color: '#888', fontSize: '13px', fontWeight: 500,
                        }}
                      >
                        <X size={14} /> Dismiss
                      </button>
                      <button
                        onClick={() => handle('delete', r._id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', border: 'none',
                          background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', fontSize: '13px', fontWeight: 500,
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}