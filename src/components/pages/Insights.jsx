import { useEffect, useRef } from 'react'
import { Chart, BarElement, CategoryScale, LinearScale, BarController, Tooltip } from 'chart.js'
import { EMOTION_MAP, fmt } from '../../constants'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

export default function Insights({ store }) {
  const emoExpense = Object.entries(EMOTION_MAP).map(([k, v]) => {
    const days = store.emotions.filter((e) => e.emotion === k).map((e) => e.date)
    const exps = store.finances.filter((f) => f.type === 'expense' && days.includes(f.date))
    const avg  = days.length && exps.length ? exps.reduce((a, b) => a + b.amount, 0) / days.length : 0
    return { k, ...v, avg, days: days.length }
  }).filter((x) => x.days > 0).sort((a, b) => b.avg - a.avg)

  const catMap = {}
  store.finances.filter((f) => f.type === 'expense').forEach((f) => { catMap[f.category] = (catMap[f.category] || 0) + f.amount })
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  const maxCat  = topCats[0]?.[1] || 1

  const dayMap = {}
  store.finances.filter((f) => f.type === 'expense').forEach((f) => { dayMap[f.date] = (dayMap[f.date] || 0) + f.amount })
  const topDays = Object.entries(dayMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const barRef  = useRef(null)
  const barInst = useRef(null)

  useEffect(() => {
    if (!barRef.current || !emoExpense.length) return
    if (barInst.current) barInst.current.destroy()

    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: emoExpense.map((e) => e.label),
        datasets: [{ data: emoExpense.map((e) => Math.round(e.avg)), backgroundColor: emoExpense.map((e) => e.color + 'CC'), borderRadius: 5, borderSkipped: false }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#F0EEE8' }, ticks: { callback: (v) => '$' + v, font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    })

    return () => { if (barInst.current) barInst.current.destroy() }
  }, [emoExpense.length]) // eslint-disable-line

  return (
    <div>
      <div className="page-title">Insights</div>
      <div className="page-sub">Correlaciones entre emociones y finanzas</div>

      <div className="card">
        <div className="card-title">Gasto promedio por emoción</div>
        {emoExpense.length === 0
          ? <div style={{ fontSize: 12, color: '#bbb' }}>Registra emociones y gastos el mismo día para ver correlaciones.</div>
          : <div style={{ position: 'relative', height: Math.max(140, emoExpense.length * 44) }}><canvas ref={barRef}></canvas></div>
        }
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Distribución de gastos</div>
        {topCats.length === 0
          ? <div style={{ fontSize: 12, color: '#bbb' }}>Sin gastos aún.</div>
          : topCats.map(([c, total]) => (
            <div key={c} style={{ marginBottom: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
                <span>{c}</span><span style={{ fontWeight: 600 }}>{fmt(total)}</span>
              </div>
              <div style={{ height: 4, background: '#F0EEE8', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: '#5A3FBF', width: `${(total / maxCat) * 100}%` }} />
              </div>
            </div>
          ))
        }
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Días con mayor gasto</div>
        {topDays.length === 0
          ? <div style={{ fontSize: 12, color: '#bbb' }}>Sin datos.</div>
          : topDays.map(([date, total]) => {
            const emo = store.emotions.find((e) => e.date === date)
            return (
              <div key={date} className="row-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 18 }}>{emo ? EMOTION_MAP[emo.emotion]?.emoji : '·'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{date}</div>
                    <div style={{ fontSize: 10, color: '#bbb' }}>{emo ? EMOTION_MAP[emo.emotion]?.label : 'Sin emoción'}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: '#E24B4A', fontSize: 12 }}>{fmt(total)}</div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}