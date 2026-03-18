import { useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'
import { fmt } from '../constants'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

export default function PieChart({ data, colors, total, title }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data.length) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels:   data.map((d) => d.label),
        datasets: [{ data: data.map((d) => d.val), backgroundColor: colors.slice(0, data.length), borderWidth: 0 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '66%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${fmt(ctx.raw)}` } },
        },
      },
    })

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [JSON.stringify(data)])  // eslint-disable-line

  return (
    <div>
      <div className="card-title">{title}</div>
      {data.length === 0
        ? <div style={{ fontSize: 12, color: '#bbb' }}>Sin datos aún.</div>
        : (
          <>
            <div style={{ position: 'relative', height: 140 }}>
              <canvas ref={canvasRef}></canvas>
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
              {data.map((d, i) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#555' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: colors[i % colors.length], display: 'inline-block' }}></span>
                  {d.label} <span style={{ fontWeight: 600 }}>{total > 0 ? Math.round(d.val / total * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </>
        )
      }
    </div>
  )
}