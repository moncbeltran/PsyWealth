import MonthCalendar from '../MonthCalendar'
import { fmt, EMOTION_MAP } from '../../constants'

export default function Dashboard({ store }) {
  const inc      = store.finances.filter((f) => f.type === 'income').reduce((a, b) => a + b.amount, 0)
  const exp      = store.finances.filter((f) => f.type === 'expense').reduce((a, b) => a + b.amount, 0)
  const trades   = store.trades
  const totalPnl = trades.reduce((a, t) => a + (t.pnl || 0), 0)
  const winRate  = trades.length ? Math.round(trades.filter((t) => t.result === 'win').length / trades.length * 100) : null

  const stDays  = store.emotions.filter((e) => ['stressed', 'anxious'].includes(e.emotion)).map((e) => e.date)
  const caDays  = store.emotions.filter((e) => ['calm', 'happy'].includes(e.emotion)).map((e) => e.date)
  const stExp   = store.finances.filter((f) => f.type === 'expense' && stDays.includes(f.date)).reduce((a, b) => a + b.amount, 0)
  const caExp   = store.finances.filter((f) => f.type === 'expense' && caDays.includes(f.date)).reduce((a, b) => a + b.amount, 0)

  let insight = 'Registra emociones y gastos para ver tus patrones personalizados.'
  if (stExp > 0 && caExp > 0)
    insight = stExp > caExp
      ? `Gastas ${fmt(stExp - caExp)} más en días de estrés/ansiedad que cuando estás tranquilo.`
      : 'Tus gastos son menores cuando estás en calma. ¡Sigue así!'

  return (
    <div>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Resumen general de tu actividad</div>

      <div className="grid4" style={{ marginBottom: 16 }}>
        {[
          { l: 'Balance',    v: fmt(inc - exp),                        c: (inc - exp) >= 0 ? '#1D9E75' : '#E24B4A' },
          { l: 'Ingresos',   v: fmt(inc),                              c: '#1D9E75' },
          { l: 'Gastos',     v: fmt(exp),                              c: '#E24B4A' },
          { l: 'P&L Trader', v: winRate !== null ? fmt(totalPnl) : '—', c: totalPnl >= 0 ? '#1D9E75' : '#E24B4A' },
        ].map((k) => (
          <div key={k.l} className="metric">
            <div className="metric-label">{k.l}</div>
            <div className="metric-value" style={{ color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ borderLeft: '3px solid #5A3FBF', marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#5A3FBF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>
          Insight automático
        </div>
        <div style={{ fontSize: 13, color: '#333' }}>{insight}</div>
      </div>

      <MonthCalendar store={store} />

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-title">Últimas transacciones</div>
        {store.finances.length === 0
          ? <div style={{ fontSize: 12, color: '#bbb' }}>Sin transacciones aún.</div>
          : store.finances.slice(-6).reverse().map((f) => (
            <div key={f.id} className="row-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: f.type === 'income' ? '#E1F5EE' : '#FCEBEB',
                  color:      f.type === 'income' ? '#1D9E75' : '#E24B4A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.type === 'income' ? '↑' : '↓'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>
                    {f.category}{f.note && <span style={{ color: '#bbb' }}> · {f.note}</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#ccc' }}>{f.date}</div>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 12, color: f.type === 'income' ? '#1D9E75' : '#E24B4A' }}>
                {f.type === 'income' ? '+' : '-'}{fmt(f.amount)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}