import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Ticket } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { notificacionService } from '../../services/notificacionService'
import { useNotifications } from '../../context/NotificationContext'

export default function NotificationsPage() {
  const [data, setData] = useState({ content: [], totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const { fetchCount, resetCount } = useNotifications()

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const result = await notificacionService.listar(0, 50)
      setData(result)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const markAllRead = async () => {
    try {
      await notificacionService.marcarTodasLeidas()
      await loadNotifications()
      resetCount()
      toast.success('Todas marcadas como leídas')
    } catch { toast.error('Error') }
  }

  const markRead = async (n) => {
    if (n.leida) return
    await notificacionService.marcarLeida(n.id)
    await loadNotifications()
    fetchCount()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        {data.content.some(n => !n.leida) && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={16} /> Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : data.content.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.content.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n)}
              className={`card p-4 flex gap-4 cursor-pointer hover:shadow-md transition-all ${
                !n.leida ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
              }`}
            >
              <div className={`p-2 rounded-full flex-shrink-0 ${!n.leida ? 'bg-primary-100' : 'bg-gray-100'}`}>
                <Bell size={18} className={!n.leida ? 'text-primary-600' : 'text-gray-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                    {n.titulo}
                  </p>
                  {!n.leida && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.mensaje}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">
                    {n.createdAt && format(new Date(n.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                  </span>
                  {n.ticketId && (
                    <Link
                      to={`/tickets/${n.ticketId}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                    >
                      <Ticket size={12} /> Ver ticket
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
