import { useEffect, useRef } from 'react'
import { Chart, BarElement, CategoryScale, LinearScale, BarController, Tooltip } from 'chart.js'
import { fmt, CATEGORIES, INCOME_CATEGORIES, todayStr, uid } from '../../constants'
import { useState } from 'react'
import PieChart from '../PieChart'
import MovementList from '../MovementList'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const EXP_COLORS = ['#E24B4A','#D4537E','#BA7517','#888780','#639922','#5A3FBF','#378ADD','#1D9E75']
const INC_COLORS = ['#1D9E75','#378ADD','#5A3FBF','#639922','#BA7517','#888780','#D4537E','#E24B4A']

export default function Finances({ store, setStore }) {
  const [type,   setType]   = useState('expense')
  const [amount, setAmount] = useState('')
  const [cat,    setCat]    = useState(CATEGORIES[0])
  const [note,   setNote]   = useState('')
  const [date,   setDate]   = useState(todayStr())
  const [period, setPeriod] = useState('monthly')
  const [saved,  setSaved]  = useState(false)

  function save() {
    if (!amount || isNaN(+amount) || +amount <= 0) return
    setStore((s) => ({ ...s, finances: [...s.finances, { id: uid(), type, amount: +amount, category: cat, note, date }] }))
    setAmount(''); setNote(''); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const expenses = store.finances.filter((f) => f.type === 'expense')
  const incomes  = store.finances.filter((f) => f.type === 'income')
  const inc = incomes.reduce((a, b) => a + b.amount, 0)
  const exp = expenses.reduce((a, b) => a + b.amount, 0)

  const expCatMap = {}; expenses.forEach((f) => { expCatMap[f.category] = (expCatMap[f.category] || 0) + f.amount })
  const incCatMap = {}; incomes.forEach((f)  => { incCatMap[f.category] = (incCatMap[f.category] || 0) + f.amount })
  const expPie = Object.entries(expCatMap).sort((a, b) => b[1] - a[1]).map(([label, val]) => ({ label, val }))
  const incPie = Object.entries(incCatMap).sort((a, b) => b[1] - a[1]).map(([label, val]) => ({ label, val }))

  // Bar chart
  const barRef  = useRef(null)
  const barInst = useRef(null)

  useEffect(() => {
    if (!barRef.current) return
    if (barInst.current) barInst.current.destroy()

    let labels = [], expData = [], incData = []
    const now = new Date()

    if (period === 'daily') {
      const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return d.toISOString().split('T')[0] })
      labels  = days.map((d) => d.slice(5))
      expData = days.map((d) => expenses.filter((f) => f.date === d).reduce((a, b) => a + b.amount, 0))
      incData = days.map((d) => incomes.filter((f)  => f.date === d).reduce((a, b) => a + b.amount, 0))
    } else if (period === 'monthly') {
      const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - i); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }).reverse()
      labels  = months.map((m) => m.slice(5) + '/' + m.slice(2, 4))
      expData = months.map((m) => expenses.filter((f) => f.date.startsWith(m)).reduce((a, b) => a + b.amount, 0))
      incData = months.map((m) => incomes.filter((f)  => f.date.startsWith(m)).reduce((a, b) => a + b.amount, 0))
    } else {
      const years = Array.from({ length: 3 }, (_, i) => String(now.getFullYear() - i)).reverse()
      labels  = years
      expData = years.map((y) => expenses.filter((f) => f.date.startsWith(y)).reduce((a, b) => a + b.amount, 0))
      incData = years.map((y) => incomes.filter((f)  => f.date.startsWith(y)).reduce((a, b) => a + b.amount, 0))
    }

    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: { labels, datasets: [
        { label: 'Gastos',   data: expData, backgroundColor: 'rgba(226,75,74,0.75)',  borderRadius: 4 },
        { label: 'Ingresos', data: incData, backgroundColor: 'rgba(29,158,117,0.75)', borderRadius: 4 },
      ]},
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#F0EEE8' }, ticks: { callback: (v) => '$' + v, font: { size: 10 } } },
        },
      },
    })

    return () => { if (barInst.current) barInst.current.destroy() }
  }, [expenses.length, incomes.length, period, exp, inc]) // eslint-disable-line

  return (
    <div>
      <div className="page-title">Finanzas</div>
      <div className="page-sub">Registra ingresos y gastos</div>

      <div className="grid3" style={{ marginBottom: 14 }}>
        {[
          { l: 'Balance',  v: fmt(inc - exp), c: (inc - exp) >= 0 ? '#1D9E75' : '#E24B4A' },
          { l: 'Ingresos', v: fmt(inc),        c: '#1D9E75' },
          { l: 'Gastos',   v: fmt(exp),        c: '#E24B4A' },
        ].map((k) => (
          <div key={k.l} className="metric">
            <div className="metric-label">{k.l}</div>
            <div className="metric-value" style={{ color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 12, marginBottom: 14 }}>
        <div className="card"><PieChart data={expPie} colors={EXP_COLORS} total={exp} title="Gastos por categoría" /></div>
        <div className="card"><PieChart data={incPie} colors={INC_COLORS} total={inc} title="Ingresos por fuente" /></div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Evolución temporal</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {['daily', 'monthly', 'yearly'].map((p) => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '3px 8px', borderRadius: 5, border: '1px solid #E8E6E0', fontSize: 10, cursor: 'pointer',
                  background: period === p ? '#5A3FBF' : '#fff',
                  color:      period === p ? '#fff' : '#777',
                  fontWeight: period === p ? 600 : 400,
                }}>
                  {p === 'daily' ? 'Diario' : p === 'monthly' ? 'Mensual' : 'Anual'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#aaa', marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: 'rgba(226,75,74,0.75)', display: 'inline-block' }}></span>Gastos</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: 'rgba(29,158,117,0.75)', display: 'inline-block' }}></span>Ingresos</span>
          </div>
          <div style={{ position: 'relative', height: 155 }}><canvas ref={barRef}></canvas></div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-title">Nuevo movimiento</div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
          {['expense', 'income'].map((t) => (
            <button key={t} onClick={() => { setType(t); setCat(t === 'income' ? INCOME_CATEGORIES[0] : CATEGORIES[0]) }} style={{
              flex: 1, padding: '7px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border:      type === t ? (t === 'income' ? '2px solid #1D9E75' : '2px solid #E24B4A') : '1px solid #ECEAE4',
              background:  type === t ? (t === 'income' ? '#E1F5EE' : '#FCEBEB') : '#fff',
              color:       type === t ? (t === 'income' ? '#1D9E75' : '#E24B4A') : '#999',
            }}>
              {t === 'income' ? '+ Ingreso' : '− Gasto'}
            </button>
          ))}
        </div>

        <div className="grid3" style={{ marginBottom: 10 }}>
          <div><label className="field-label">Monto (MXN)</label><input type="number" className="inp" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
          <div>
            <label className="field-label">Categoría</label>
            <select className="sel" value={cat} onChange={(e) => setCat(e.target.value)}>
              {(type === 'income' ? INCOME_CATEGORIES : CATEGORIES).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="field-label">Fecha</label><input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>

        <div style={{ marginBottom: 12 }}><label className="field-label">Nota</label><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Descripción opcional" /></div>
        <button className="btn-primary" onClick={save} disabled={!amount}>
          {saved ? '✓ Guardado' : 'Agregar movimiento'}
        </button>
      </div>

      <MovementList finances={store.finances} setStore={setStore} />
    </div>
  )
}