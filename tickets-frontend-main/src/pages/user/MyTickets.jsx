import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { ticketService } from '../../services/ticketService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from '../../components/tickets/StatusBadge'
import PriorityBadge from '../../components/tickets/PriorityBadge'

export default function MyTickets() {
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => { loadTickets() }, [page])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const result = await ticketService.misTickets(page, 10)
      setData(result)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const filtered = search
    ? data.content.filter(t =>
        t.folio.toLowerCase().includes(search.toLowerCase()) ||
        t.asunto.toLowerCase().includes(search.toLowerCase()))
    : data.content

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis tickets</h1>
        <Link to="/tickets/nuevo" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> Nuevo ticket
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por folio o asunto..."
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
          <div className="text-center py-16 text-gray-400">
            <p>No se encontraron tickets</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Folio', 'Asunto', 'Categoría', 'Prioridad', 'Estatus', 'Fecha', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{ticket.folio}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 line-clamp-1">{ticket.asunto}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {ticket.categoriaServicio}
                        {ticket.subcategoriaServicio && (
                          <span className="text-gray-400"> / {ticket.subcategoriaServicio}</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priority={ticket.prioridad} /></td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ticket.estatus} color={ticket.estatusColor} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {ticket.createdAt && format(new Date(ticket.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/tickets/${ticket.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-xs">
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Página {data.number + 1} de {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={data.number === 0}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={data.number >= data.totalPages - 1}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
