import { useState } from 'react'
import { fmt, CATEGORIES, INCOME_CATEGORIES } from '../constants'

const ALL_CATS = [...CATEGORIES, ...INCOME_CATEGORIES]

export default function MovementList({ finances, setStore }) {
  const [search,   setSearch]   = useState('')
  const [typeF,    setTypeF]    = useState('all')
  const [catF,     setCatF]     = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [editing,  setEditing] = useState(null)
  const [delId,    setDelId]   = useState(null)

  const existingCats = [...new Set(finances.map((f) => f.category))].sort()

  const filtered = finances
    .filter((f) => {
      if (typeF !== 'all' && f.type !== typeF) return false
      if (catF  !== 'all' && f.category !== catF) return false
      if (dateFrom && f.date < dateFrom) return false
      if (dateTo   && f.date > dateTo)   return false
      if (search) {
        const q = search.toLowerCase()
        if (!f.category.toLowerCase().includes(q) && !(f.note || '').toLowerCase().includes(q)) return false
      }
      return true
    })
    .slice()
    .reverse()

  const filteredExp = filtered.filter((f) => f.type === 'expense').reduce((a, b) => a + b.amount, 0)
  const filteredInc = filtered.filter((f) => f.type === 'income').reduce((a, b)  => a + b.amount, 0)
  const hasFilter   = search || typeF !== 'all' || catF !== 'all' || dateFrom || dateTo

  function clearAll() { setSearch(''); setTypeF('all'); setCatF('all'); setDateFrom(''); setDateTo('') }

  function handleSave(updated) {
    setStore((s) => ({ ...s, finances: s.finances.map((f) => f.id === updated.id ? updated : f) }))
    setEditing(null)
  }

  function handleDelete(id) {
    setStore((s) => ({ ...s, finances: s.finances.filter((f) => f.id !== id) }))
    setDelId(null)
  }

  return (
    <div className="card" style={{ marginTop: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>
          Movimientos ({filtered.length}{filtered.length !== finances.length ? ` de ${finances.length}` : ''})
        </div>
        {hasFilter && (
          <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
            <span style={{ color: '#1D9E75', fontWeight: 600 }}>+{fmt(filteredInc)}</span>
            <span style={{ color: '#E24B4A', fontWeight: 600 }}>-{fmt(filteredExp)}</span>
          </div>
        )}
      </div>

      {/* Filters row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        <input
          className="inp" style={{ fontSize: 12 }}
          placeholder="Buscar por categoría o nota..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <select className="sel" style={{ fontSize: 12 }} value={typeF} onChange={(e) => setTypeF(e.target.value)}>
          <option value="all">Todos los tipos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
        </select>
        <select className="sel" style={{ fontSize: 12 }} value={catF} onChange={(e) => setCatF(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {existingCats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Filters row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label className="field-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Desde</label>
          <input type="date" className="inp" style={{ fontSize: 12 }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label className="field-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Hasta</label>
          <input type="date" className="inp" style={{ fontSize: 12 }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        {hasFilter && (
          <button onClick={clearAll} style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid #ECEAE4', background: '#fff', fontSize: 11, color: '#999', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Limpiar ✕
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0
        ? <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: '20px 0' }}>Sin resultados para este filtro.</div>
        : filtered.map((f) => (
          <div key={f.id} className="row-item" style={{ alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, fontSize: 11, fontWeight: 700,
                background: f.type === 'income' ? '#E1F5EE' : '#FCEBEB',
                color:      f.type === 'income' ? '#1D9E75' : '#E24B4A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.type === 'income' ? '↑' : '↓'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>
                  {f.category}
                  {f.note && <span style={{ color: '#bbb' }}> · {f.note}</span>}
                </div>
                <div style={{ fontSize: 10, color: '#ccc' }}>{f.date}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: f.type === 'income' ? '#1D9E75' : '#E24B4A' }}>
                {f.type === 'income' ? '+' : '-'}{fmt(f.amount)}
              </div>
              <button onClick={() => setEditing(f)} style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #5A3FBF', background: '#5A3FBF', color: '#fff', fontSize: 10, cursor: 'pointer' }}>
                Editar
              </button>
              <button onClick={() => setDelId(f.id)} style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #E24B4A', background: '#E24B4A', color: '#fff', fontSize: 10, cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        ))
      }

      {/* Edit Modal */}
      {editing && <EditModal item={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      {/* Delete Confirmation */}
      {delId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: 300, textAlign: 'center' }}>
            <div className="card-title">Confirmar eliminación</div>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>¿Estás seguro de que quieres eliminar este movimiento?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleDelete(delId)} className="btn-primary" style={{ flex: 1, background: '#E24B4A' }}>
                Eliminar
              </button>
              <button onClick={() => setDelId(null)} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid #ECEAE4', background: '#fff', color: '#666', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EditModal({ item, onSave, onClose }) {
  const [type, setType] = useState(item.type)
  const [amount, setAmount] = useState(item.amount)
  const [cat, setCat] = useState(item.category)
  const [note, setNote] = useState(item.note || '')
  const [date, setDate] = useState(item.date)

  function save() {
    if (!amount || isNaN(+amount) || +amount <= 0) return
    onSave({ ...item, type, amount: +amount, category: cat, note, date })
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ maxWidth: 400 }}>
        <div className="card-title">Editar movimiento</div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
          {['expense', 'income'].map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} className="btn-primary" style={{ flex: 1 }}>
            Guardar cambios
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid #ECEAE4', background: '#fff', color: '#666', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}