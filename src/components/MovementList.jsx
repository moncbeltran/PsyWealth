import { useState } from 'react'
import { fmt, CATEGORIES, INCOME_CATEGORIES } from '../constants'

const ALL_CATS = [...CATEGORIES, ...INCOME_CATEGORIES]

// ── EDIT FINANCE MODAL ────────────────────────────────────────────────────────
function EditFinanceModal({ item, onSave, onClose }) {
  const [f, setF] = useState({ ...item })
  
  const lbl = { fontSize: 11, color: '#777', marginBottom: 4, display: 'block', fontWeight: 500 }
  const inp = { width: '100%', padding: '8px 11px', borderRadius: 7, border: '1px solid #DDD', fontSize: 13, color: '#1a1a1a', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const sel = { width: '100%', padding: '8px 11px', borderRadius: 7, border: '1px solid #DDD', fontSize: 13, color: '#1a1a1a', background: '#fff', boxSizing: 'border-box' }
  const btn = { width: '100%', padding: '9px', borderRadius: 7, border: 'none', background: '#5A3FBF', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 420, boxShadow: '0 8px 40px rgba(0,0,0,.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Editar movimiento</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#bbb', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              onClick={() => setF({ ...f, type: t })}
              style={{
                flex: 1, padding: '7px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: f.type === t ? (t === 'income' ? '2px solid #1D9E75' : '2px solid #E24B4A') : '1px solid #ECEAE4',
                background: f.type === t ? (t === 'income' ? '#E1F5EE' : '#FCEBEB') : '#fff',
                color: f.type === t ? (t === 'income' ? '#1D9E75' : '#E24B4A') : '#999',
              }}
            >
              {t === 'income' ? '+ Ingreso' : '− Gasto'}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div><label style={lbl}>Monto (MXN)</label><input type="number" style={inp} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
          <div><label style={lbl}>Fecha</label><input type="date" style={inp} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={lbl}>Categoría</label>
          <select style={sel} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {ALL_CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Nota</label>
          <input style={inp} value={f.note || ''} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Descripción opcional" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid #ECEAE4', background: '#fff', fontSize: 13, color: '#888', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => onSave({ ...f, amount: +f.amount })} style={{ ...btn, flex: 2 }}>Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}

// ── DELETE CONFIRM MODAL ──────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onClose, danger }) {
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 320, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,.15)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>¿Estás seguro?</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>{message}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid #ECEAE4', background: '#fff', fontSize: 13, color: '#888', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '9px', borderRadius: 7, border: 'none', background: danger || '#E24B4A', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export default function MovementList({ finances, setStore }) {
  const [search,   setSearch]   = useState('')
  const [typeF,    setTypeF]    = useState('all')
  const [catF,     setCatF]     = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [editing,  setEditing]  = useState(null)
  const [delId,    setDelId]    = useState(null)

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
    setStore(s => ({ ...s, finances: s.finances.map(f => f.id === updated.id ? updated : f) }))
    setEditing(null)
  }

  function handleDelete(id) {
    setStore(s => ({ ...s, finances: s.finances.filter(f => f.id !== id) }))
    setDelId(null)
  }

  return (
    <>
      {editing && <EditFinanceModal item={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
      {delId && <ConfirmModal message="Esta acción no se puede deshacer." onConfirm={() => handleDelete(delId)} onClose={() => setDelId(null)} />}

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
          <div key={f.id} className="row-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, fontSize: 11, fontWeight: 700,
                background: f.type === 'income' ? '#E1F5EE' : '#FCEBEB',
                color:      f.type === 'income' ? '#1D9E75' : '#E24B4A',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {f.type === 'income' ? '↑' : '↓'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.category}
                  {f.note && <span style={{ color: '#bbb' }}> · {f.note}</span>}
                </div>
                <div style={{ fontSize: 10, color: '#ccc' }}>{f.date}</div>
              </div>
            </div>
            {/* amount + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontWeight: 600, fontSize: 12, color: f.type === 'income' ? '#1D9E75' : '#E24B4A' }}>
                {f.type === 'income' ? '+' : '-'}{fmt(f.amount)}
              </span>
              <button
                onClick={() => setEditing(f)}
                title="Editar"
                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E8E6E0', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#555' }}
              >
                ✏️
              </button>
              <button
                onClick={() => setDelId(f.id)}
                title="Eliminar"
                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #FCEBEB', background: '#FCEBEB', fontSize: 12, cursor: 'pointer', color: '#E24B4A' }}
              >
                🗑
              </button>
            </div>
          </div>
        ))
      }
    </div>
    </>
  )
}