import { useState } from 'react'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')

  function go() {
    if (!f.email || !f.password) { setErr('Completa todos los campos'); return }
    if (mode === 'register' && !f.name) { setErr('Ingresa tu nombre'); return }
    const user = {
      id: Date.now(),
      name: f.name || f.email.split('@')[0],
      email: f.email,
    }
    localStorage.setItem('psywealth_user', JSON.stringify(user))
    onLogin(user)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3' }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5A3FBF', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 8 }}>
            PsyWealth
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Bienvenido</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>Psicología + Finanzas Personales</div>
        </div>

        <div className="card" style={{ padding: 26 }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: '#F7F6F3', borderRadius: 7, padding: 3, marginBottom: 18 }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '6px', borderRadius: 5, border: 'none',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#1a1a1a' : '#999',
                  fontWeight: mode === m ? 600 : 400,
                  fontSize: 12, cursor: 'pointer',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,.07)' : 'none',
                }}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 10 }}>
              <label className="field-label">Nombre</label>
              <input className="inp" placeholder="Tu nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
          )}
          <div style={{ marginBottom: 10 }}>
            <label className="field-label">Email</label>
            <input className="inp" type="email" placeholder="tu@email.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Contraseña</label>
            <input className="inp" type="password" placeholder="••••••••" value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && go()} />
          </div>
          {err && <div style={{ fontSize: 11, color: '#E24B4A', marginBottom: 10 }}>{err}</div>}
          <button className="btn-primary" onClick={go}>
            {mode === 'login' ? 'Entrar →' : 'Crear cuenta →'}
          </button>
          <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 12 }}>
            Demo: cualquier email y contraseña funcionan
          </div>
        </div>
      </div>
    </div>
  )
}