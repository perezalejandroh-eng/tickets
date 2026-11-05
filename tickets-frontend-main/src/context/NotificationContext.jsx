import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificacionService } from '../services/notificacionService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    if (!user) { setCount(0); return }
    try {
      const n = await notificacionService.contador()
      setCount(n)
    } catch { /* silent */ }
  }, [user])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [fetchCount])

  const decrementCount = (n = 1) => setCount(prev => Math.max(0, prev - n))
  const resetCount = () => setCount(0)

  return (
    <NotificationContext.Provider value={{ count, fetchCount, decrementCount, resetCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
