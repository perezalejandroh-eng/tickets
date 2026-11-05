import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Ticket, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ticketService } from '../../services/ticketService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from '../../components/tickets/StatusBadge'
import PriorityBadge from '../../components/tickets/PriorityBadge'

export default function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState({ total: 0, abiertos: 0, resueltos: 0, cerrados: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await ticketService.misTickets(0, 5)
      setTickets(data.content || [])
      const total = data.totalElements || 0
      const abiertos = (data.content || []).filter(t => 
        ['Asignado', 'En revisión', 'En atención', 'Pendiente usuario', 'Pendiente tercero', 'Reabierto'].includes(t.estatus)).length
      const resueltos = (data.content || []).filter(t => ['Resuelto', 'Escalado'].includes(t.estatus)).length
      const cerrados = (data.content || []).filter(t => ['Cerrado', 'Cancelado'].includes(t.estatus)).length
      setStats({ total, abiertos, resueltos, cerrados })
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.nombre?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona y da seguimiento a tus solicitudes de soporte</p>
        </div>
        <Link to="/tickets/nuevo" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} /> Nuevo ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Ticket className="text-blue-600" />} label="Total tickets"
          value={stats.total} bg="bg-blue-50" />
        <StatCard icon={<Clock className="text-yellow-600" />} label="En proceso"
          value={stats.abiertos} bg="bg-yellow-50" />
        <StatCard icon={<CheckCircle className="text-green-600" />} label="Resueltos"
          value={stats.resueltos} bg="bg-green-50" />
        <StatCard icon={<AlertTriangle className="text-red-600" />} label="Cerrados"
          value={stats.cerrados} bg="bg-red-50" />
      </div>

      {/* Recent tickets */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tickets recientes</h2>
          <Link to="/tickets/mis-tickets" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tienes tickets aún</p>
            <Link to="/tickets/nuevo" className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusCircle size={16} /> Crear primer ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{ticket.folio}</span>
                    <PriorityBadge priority={ticket.prioridad} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.asunto}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {ticket.categoriaServicio} {ticket.subcategoriaServicio && `· ${ticket.subcategoriaServicio}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <StatusBadge status={ticket.estatus} color={ticket.estatusColor} />
                  <span className="text-xs text-gray-400">
                    {ticket.createdAt && format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`card p-4 flex items-center gap-4 ${bg}`}>
      <div className="p-3 rounded-xl bg-white shadow-sm">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-600">{label}</p>
      </div>
    </div>
  )
}
