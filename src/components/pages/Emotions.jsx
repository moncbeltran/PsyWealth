import { useState } from 'react'
import { EMOTION_MAP, todayStr, uid } from '../../constants'

export default function Emotions({ store, setStore }) {
  const [emotion,   setEmotion]   = useState('')
  const [intensity, setIntensity] = useState(3)
  const [note,      setNote]      = useState('')
  const [date,      setDate]      = useState(todayStr())
  const [saved,     setSaved]     = useState(false)

  function save() {
    if (!emotion) return
    setStore((s) => ({ ...s, emotions: [...s.emotions, { id: uid(), emotion, intensity: +intensity, note, date }] }))
    setEmotion(''); setNote(''); setIntensity(3); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="page-title">Emociones</div>
      <div className="page-sub">¿Cómo te sientes hoy?</div>

      <div className="card">
        <div className="card-title">Selecciona tu emoción</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 18 }}>
          {Object.entries(EMOTION_MAP).map(([k, v]) => (
            <button key={k} onClick={() => setEmotion(k)} style={{
              padding: '12px 6px', borderRadius: 9, cursor: 'pointer', textAlign: 'center',
              border:      emotion === k ? `2px solid ${v.color}` : '1px solid #ECEAE4',
              background:  emotion === k ? v.color + '12' : '#fff',
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{v.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: emotion === k ? v.color : '#666' }}>{v.label}</div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Intensidad: <span style={{ fontWeight: 700, color: '#5A3FBF' }}>{intensity}/5</span></label>
          <input type="range" min="1" max="5" value={intensity} onChange={(e) => setIntensity(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#ccc', marginTop: 2 }}>
            <span>Leve</span><span>Moderado</span><span>Intenso</span>
          </div>
        </div>

        <div className="grid2" style={{ marginBottom: 14 }}>
          <div><label className="field-label">Fecha</label><input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="field-label">Nota</label><input className="inp" placeholder="¿Por qué te sientes así?" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>

        <button className="btn-primary" onClick={save} disabled={!emotion}>
          {saved ? '✓ Guardado' : 'Guardar registro'}
        </button>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-title">Historial ({store.emotions.length})</div>
        {store.emotions.length === 0
          ? <div style={{ fontSize: 12, color: '#bbb' }}>Sin registros.</div>
          : store.emotions.slice().reverse().map((e) => (
            <div key={e.id} className="row-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 20 }}>{EMOTION_MAP[e.emotion]?.emoji}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>
                    {EMOTION_MAP[e.emotion]?.label}
                    <span className="tag" style={{ background: EMOTION_MAP[e.emotion]?.color + '18', color: EMOTION_MAP[e.emotion]?.color, marginLeft: 6 }}>
                      Int. {e.intensity}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#bbb' }}>{e.date}{e.note && ' · ' + e.note}</div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}