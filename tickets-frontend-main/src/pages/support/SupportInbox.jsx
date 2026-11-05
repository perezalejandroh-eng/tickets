import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { ticketService } from '../../services/ticketService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from '../../components/tickets/StatusBadge'
import PriorityBadge from '../../components/tickets/PriorityBadge'

export default function SupportInbox() {
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [view, setView] = useState('all') // 'all' | 'mine' | 'new'
  const [search, setSearch] = useState('')

  useEffect(() => { loadTickets() }, [page, view])

  const loadTickets = async () => {
    setLoading(true)
    try {
      let result
      if (view === 'all') result = await ticketService.bandeja(page, 20)
      else if (view === 'mine') result = await ticketService.misAsignados(page, 20)
      else result = { content: await ticketService.nuevos(), totalPages: 1, number: 0 }
      setData(result)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const filtered = search
    ? data.content.filter(t =>
        t.folio.toLowerCase().includes(search.toLowerCase()) ||
        t.asunto.toLowerCase().includes(search.toLowerCase()) ||
        (t.usuarioNombre || '').toLowerCase().includes(search.toLowerCase()))
    : data.content

  const slaColor = (ticket) => {
    if (!ticket.slaResolucion) return ''
    const d = new Date(ticket.slaResolucion)
    const now = new Date()
    if (d < now) return 'border-l-4 border-l-red-500'
    if (d < new Date(now.getTime() + 4 * 3600 * 1000)) return 'border-l-4 border-l-amber-400'
    return ''
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bandeja de soporte</h1>
        <button onClick={loadTickets} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[['all','Todos'], ['mine','Mis asignados'], ['new','Nuevos']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setView(val); setPage(0) }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por folio, asunto o solicitante..."
          className="input-field pl-9"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Sin tickets en esta vista</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Folio', 'Asunto', 'Solicitante', 'Categoría', 'Prioridad', 'Estatus', 'Agente', 'Fecha', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(ticket => (
                    <tr key={ticket.id} className={`hover:bg-gray-50 transition-colors ${slaColor(ticket)}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{ticket.folio}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="font-medium text-gray-900 line-clamp-1">{ticket.asunto}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{ticket.usuarioNombre}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{ticket.categoriaServicio}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={ticket.prioridad} /></td>
                      <td className="px-4 py-3"><StatusBadge status={ticket.estatus} color={ticket.estatusColor} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{ticket.agenteNombre || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {ticket.createdAt && format(new Date(ticket.createdAt), 'dd/MM/yy', { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/tickets/${ticket.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-xs whitespace-nowrap">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">Página {data.number + 1} de {data.totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={data.number === 0}
                    className="btn-secondary p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => p + 1)} disabled={data.number >= data.totalPages - 1}
                    className="btn-secondary p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SLA legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> SLA vencido</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded" /> SLA próximo a vencer</span>
      </div>
    </div>
  )
}
