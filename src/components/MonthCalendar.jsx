import { useState } from 'react'
import { EMOTION_MAP, fmt, todayStr } from '../constants'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function MonthCalendar({ store }) {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  function prev() { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }
  function next() { if (month === 11) { setMonth(0);  setYear((y) => y + 1) } else setMonth((m) => m + 1) }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function ds(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>{MONTH_NAMES[month]} {year}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={prev} style={{ padding: '3px 9px', borderRadius: 6, border: '1px solid #E8E6E0', background: '#fff', fontSize: 14, cursor: 'pointer', color: '#555' }}>‹</button>
          <button onClick={next} style={{ padding: '3px 9px', borderRadius: 6, border: '1px solid #E8E6E0', background: '#fff', fontSize: 14, cursor: 'pointer', color: '#555' }}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#ccc', padding: '3px 0' }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ minHeight: 72 }} />

          const date      = ds(d)
          const emos      = store.emotions.filter((e) => e.date === date)
          const lastEmo   = emos[emos.length - 1]
          const dayInc    = store.finances.filter((f) => f.type === 'income'  && f.date === date).reduce((a, b) => a + b.amount, 0)
          const dayExp    = store.finances.filter((f) => f.type === 'expense' && f.date === date).reduce((a, b) => a + b.amount, 0)
          const dayTrades = store.trades.filter((t) => t.date === date)
          const tradePnl  = dayTrades.reduce((a, t) => a + (t.pnl || 0), 0)
          const isToday   = date === todayStr()
          const hasData   = lastEmo || dayInc || dayExp || dayTrades.length

          return (
            <div
              key={i}
              style={{
                minHeight: 72, borderRadius: 8, padding: '5px 5px 4px',
                background: hasData ? '#FAFAF8' : '#fff',
                border: isToday ? '1.5px solid #5A3FBF' : '1px solid #ECEAE4',
                display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? '#5A3FBF' : '#bbb', textAlign: 'right', lineHeight: 1 }}>{d}</div>
              {lastEmo   && <div style={{ fontSize: 14, textAlign: 'center', lineHeight: 1 }}>{EMOTION_MAP[lastEmo.emotion]?.emoji}</div>}
              {dayInc > 0 && <Chip color="#1D9E75" bg="#E1F5EE">+{fmt(dayInc)}</Chip>}
              {dayExp > 0 && <Chip color="#E24B4A" bg="#FCEBEB">-{fmt(dayExp)}</Chip>}
              {dayTrades.length > 0 && (
                <Chip color={tradePnl >= 0 ? '#1D9E75' : '#E24B4A'} bg={tradePnl >= 0 ? '#E1F5EE' : '#FCEBEB'}>
                  {tradePnl >= 0 ? '+' : ''}{fmt(tradePnl)} · {dayTrades.length}T
                </Chip>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F0EEE8', fontSize: 10, color: '#aaa' }}>
        <LegendItem bg="#E1F5EE" color="#1D9E75" label="Ingreso" />
        <LegendItem bg="#FCEBEB" color="#E24B4A" label="Gasto" />
        <LegendItem bg="#EDE9FA" color="#5A3FBF" label="P&L · Trades" />
        <span>😊 Emoción del día</span>
      </div>
    </div>
  )
}

function Chip({ color, bg, children }) {
  return (
    <div style={{ fontSize: 8, fontWeight: 600, color, background: bg, borderRadius: 3, padding: '1px 3px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {children}
    </div>
  )
}

function LegendItem({ bg, color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ background: bg, color, padding: '1px 5px', borderRadius: 3, fontWeight: 600, fontSize: 10 }}>{label}</span>
    </span>
  )
}