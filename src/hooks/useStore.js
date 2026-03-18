import { useState, useEffect } from 'react'

const INITIAL = { emotions: [], finances: [], trades: [] }

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('psywealth_store')
    return raw ? JSON.parse(raw) : INITIAL
  } catch {
    return INITIAL
  }
}

export function useStore() {
  const [store, setStoreRaw] = useState(loadFromStorage)

  // persist on every change
  useEffect(() => {
    localStorage.setItem('psywealth_store', JSON.stringify(store))
  }, [store])

  const setStore = (updater) => {
    setStoreRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }

  return [store, setStore]
}