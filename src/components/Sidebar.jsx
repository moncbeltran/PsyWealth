const NAV = [
  { id: 'dashboard', label: 'Dashboard'  },
  { id: 'emotions',  label: 'Emociones'  },
  { id: 'finances',  label: 'Finanzas'   },
  { id: 'insights',  label: 'Insights'   },
  { id: 'trader',    label: 'Trader'     },
]

export default function Sidebar({ active, set, user, onLogout }) {
  return (
    <aside style={{
      width: 210, background: '#fff', borderRight: '1px solid #ECEAE4',
      display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
    }}>
      <div style={{ padding: '22px 18px 14px', borderBottom: '1px solid #ECEAE4' }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>PsyWealth</div>
        <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>Psychology meets Finance</div>
      </div>

      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => set(n.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 11px', borderRadius: 7, border: 'none',
              background: active === n.id ? '#EDE9FA' : 'transparent',
              color: active === n.id ? '#5A3FBF' : '#666',
              fontWeight: active === n.id ? 600 : 400,
              fontSize: 13, cursor: 'pointer', marginBottom: 1,
              transition: 'background 0.15s',
            }}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #ECEAE4' }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
        <div style={{ fontSize: 11, color: '#bbb', marginBottom: 7 }}>{user.email}</div>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', fontSize: 11, color: '#ccc', cursor: 'pointer', padding: 0 }}>
          Cerrar sesión →
        </button>
      </div>
    </aside>
  )
}