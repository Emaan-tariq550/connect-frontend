export default function StatCard({ icon: Icon, label, value, sub, accent = '#6C63FF', loading }) {
  return (
    <div style={{
      background:    'rgba(255,255,255,0.03)',
      border:        `1px solid rgba(255,255,255,0.07)`,
      borderRadius:  '16px',
      padding:       '22px 24px',
      display:       'flex',
      flexDirection: 'column',
      gap:           '14px',
      transition:    'border-color 0.2s',
      position:      'relative',
      overflow:      'hidden',
    }}>
      {/* subtle glow */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: accent, opacity: 0.06, filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: `${accent}18`,
        border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={accent} />
      </div>

      <div>
        {loading ? (
          <div style={{
            height: '32px', width: '80px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite',
          }} />
        ) : (
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
            {value ?? '—'}
          </div>
        )}
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: '12px', color: accent, marginTop: '4px', fontWeight: 500 }}>
            {sub}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}