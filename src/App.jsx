import { useState, useEffect } from 'react'
import Auth      from './components/Auth'
import Sidebar   from './components/Sidebar'
import Dashboard from './components/pages/Dashboard'
import Emotions  from './components/pages/Emotions'
import Finances  from './components/pages/Finances'
import Insights  from './components/pages/Insights'
import Trader    from './components/pages/Trader'
import { useStore } from './hooks/useStore'

export default function App() {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('psywealth_user')) } catch { return null }
  })
  const [page,  setPage]  = useState('dashboard')
  const [store, setStore] = useStore()

  function handleLogout() {
    localStorage.removeItem('psywealth_user')
    setUser(null)
  }

  if (!user) return <Auth onLogin={setUser} />

  const pages = {
    dashboard: <Dashboard store={store} />,
    emotions:  <Emotions  store={store} setStore={setStore} />,
    finances:  <Finances  store={store} setStore={setStore} />,
    insights:  <Insights  store={store} />,
    trader:    <Trader    store={store} setStore={setStore} />,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F7F6F3', color: '#1a1a1a' }}>
      <Sidebar active={page} set={setPage} user={user} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', maxWidth: 980 }} className="main-content">
        {pages[page]}
      </main>
    </div>
  )
}