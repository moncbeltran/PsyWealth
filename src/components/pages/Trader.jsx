import { useEffect, useRef, useState } from 'react'
import { Chart, BarElement, CategoryScale, LinearScale, BarController, Tooltip } from 'chart.js'
import { EMOTION_MAP, fmt, todayStr, uid } from '../../constants'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

export default function Trader({ store, setStore }) {
  const [asset,     setAsset]     = useState('')
  const [result,    setResult]    = useState('win')
  const [amount,    setAmount]    = useState('')
  const [lots,      setLots]      = useState('')
  const [pnl,       setPnl]       = useState('')
  const [setup,     setSetup]     = useState('')
  const [emoBefore, setEmoBefore] = useState('')
  const [emoAfter,  setEmoAfter]  = useState('')
  const [note,      setNote]      = useState('')
  const [date,      setDate]      = useState(todayStr())
  const [saved,     setSaved]     = useState(false)

  function save() {
    if (!asset || !emoBefore || !emoAfter) return
    setStore((s) => ({ ...s, trades: [...s.trades, { id: uid(), asset, result, amount: +amount || 0, lots: +lots || 0, pnl: +pnl || 0, setup, emoBefore, emoAfter, note, date }] }))
    setAsset(''); setAmount(''); setLots(''); setPnl(''); setSetup(''); setEmoBefore(''); setEmoAfter(''); setNote('')
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const trades   = store.trades
  const wins     = trades.filter((t) => t.result === 'win').length
  const winRate  = trades.length ? Math.round(wins / trades.length * 100) : 0
  const totalPnl = trades.reduce((a, t) => a + (t.pnl || 0), 0)
  const avgPnl   = trades.length ? totalPnl / trades.length : 0

  const emoWin = Object.entries(EMOTION_MAP).map(([k, v]) => {
    const t  = trades.filter((x) => x.emoBefore === k)
    if (!t.length) return null
    const wr = Math.round(t.filter((x) => x.result === 'win').length / t.length * 100)
    return { k, ...v, wr, count: t.length }
  }).filter(Boolean).sort((a, b) => b.wr - a.wr)

  const wrRef  = useRef(null)
  const wrInst = useRef(null)

  useEffect(() => {
    if (!wrRef.current || !emoWin.length) return
    if (wrInst.current) wrInst.current.destroy()

    wrInst.current = new Chart(wrRef.current, {
      type: 'bar',
      data: {
        labels: emoWin.map((e) => e.label),
        datasets: [{ data: emoWin.map((e) => e.wr), backgroundColor: emoWin.map((e) => e.wr >= 50 ? 'rgba(29,158,117,0.75)' : 'rgba(226,75,74,0.75)'), borderRadius: 5, borderSkipped: false }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { max: 100, grid: { color: '#F0EEE8' }, ticks: { callback: (v) => v + '%', font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    })

    return () => { if (wrInst.current) wrInst.current.destroy() }
  }, [emoWin.length, trades.length]) // eslint-disable-line

  return (
    <div>
      <div className="page-title">Trader</div>
      <div className="page-sub">Registra trades y su correlación emocional</div>

      <div className="grid4" style={{ marginBottom: 14 }}>
        {[
          { l: 'Win Rate',     v: winRate + '%', c: winRate >= 50 ? '#1D9E75' : '#E24B4A' },
          { l: 'Trades',       v: trades.length, c: '#1a1a1a' },
          { l: 'P&L Total',    v: fmt(totalPnl), c: totalPnl >= 0 ? '#1D9E75' : '#E24B4A' },
          { l: 'P&L Promedio', v: fmt(avgPnl),   c: avgPnl   >= 0 ? '#1D9E75' : '#E24B4A' },
        ].map((k) => (
          <div key={k.l} className="metric">
            <div className="metric-label">{k.l}</div>
            <div className="metric-value" style={{ color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Registrar trade</div>
        <div className="grid3" style={{ marginBottom: 10 }}>
          <div><label className="field-label">Activo</label><input className="inp" value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="BTC, EURUSD, AAPL..." /></div>
          <div><label className="field-label">Fecha</label><input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div>
            <label className="field-label">Resultado</label>
            <select className="sel" value={result} onChange={(e) => setResult(e.target.value)}>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9, marginBottom: 12 }}>
          <div><label className="field-label">Monto ($)</label><input type="number" className="inp" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" /></div>
          <div><label className="field-label">Lotaje</label><input type="number" className="inp" value={lots} onChange={(e) => setLots(e.target.value)} placeholder="0.10" step="0.01" /></div>
          <div><label className="field-label">P&L ($)</label><input type="number" className="inp" value={pnl} onChange={(e) => setPnl(e.target.value)} placeholder="+250 / -80" /></div>
          <div><label className="field-label">Setup</label><input className="inp" value={setup} onChange={(e) => setSetup(e.target.value)} placeholder="Breakout, EMA..." /></div>
        </div>

        <div className="grid2" style={{ marginBottom: 12 }}>
          {[{ sel: emoBefore, setSel: setEmoBefore, label: 'Emoción ANTES' }, { sel: emoAfter, setSel: setEmoAfter, label: 'Emoción DESPUÉS' }].map(({ sel, setSel, label }) => (
            <div key={label}>
              <label className="field-label">{label}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
                {Object.entries(EMOTION_MAP).map(([k, v]) => (
                  <button key={k} onClick={() => setSel(k)} style={{
                    padding: '7px 3px', borderRadius: 7, cursor: 'pointer', textAlign: 'center',
                    border:     sel === k ? `2px solid ${v.color}` : '1px solid #ECEAE4',
                    background: sel === k ? v.color + '12' : '#fff',
                  }}>
                    <div style={{ fontSize: 17, marginBottom: 2 }}>{v.emoji}</div>
                    <div style={{ fontSize: 9, color: '#777' }}>{v.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}><label className="field-label">Nota</label><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} placeholder="¿Seguiste tu plan? ¿Qué ocurrió?" /></div>
        <button className="btn-primary" onClick={save} disabled={!asset || !emoBefore || !emoAfter}>
          {saved ? '✓ Guardado' : 'Registrar trade'}
        </button>
      </div>

      {emoWin.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">Win rate por emoción previa</div>
          <div style={{ position: 'relative', height: Math.max(130, emoWin.length * 44) }}><canvas ref={wrRef}></canvas></div>
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">Historial ({trades.length})</div>
        {trades.length === 0
          ? <div style={{ fontSize: 12, color: '#bbb' }}>Sin trades aún.</div>
          : trades.slice().reverse().map((t) => (
            <div key={t.id} className="row-item" style={{ alignItems: 'flex-start', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 7, fontSize: 10, fontWeight: 700, flexShrink: 0,
                  background: t.result === 'win' ? '#E1F5EE' : '#FCEBEB',
                  color:      t.result === 'win' ? '#1D9E75' : '#E24B4A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.result === 'win' ? 'WIN' : 'LOSS'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {t.asset}
                    {t.setup && <span className="tag" style={{ background: '#5A3FBF18', color: '#5A3FBF', marginLeft: 5 }}>{t.setup}</span>}
                    {t.lots > 0 && <span className="tag" style={{ background: '#88878018', color: '#888780', marginLeft: 4 }}>{t.lots}L</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#bbb', marginTop: 1 }}>
                    {t.date} · {EMOTION_MAP[t.emoBefore]?.emoji}→{EMOTION_MAP[t.emoAfter]?.emoji}
                    {t.note && <span> · {t.note}</span>}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {t.pnl !== 0 && <div style={{ fontWeight: 700, fontSize: 12, color: t.pnl >= 0 ? '#1D9E75' : '#E24B4A' }}>{t.pnl > 0 ? '+' : ''}{fmt(t.pnl)}</div>}
                {t.amount > 0 && <div style={{ fontSize: 10, color: '#bbb' }}>{fmt(t.amount)}</div>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}