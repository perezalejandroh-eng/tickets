import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Paperclip, ChevronLeft, User, Clock, Tag, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { ticketService } from '../../services/ticketService'
import { catalogoService } from '../../services/catalogoService'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/tickets/StatusBadge'
import PriorityBadge from '../../components/tickets/PriorityBadge'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [isInterno, setIsInterno] = useState(false)
  const [sending, setSending] = useState(false)
  const [archivos, setArchivos] = useState([])
  // Support-specific
  const [estatusList, setEstatusList] = useState([])
  const [agentes, setAgentes] = useState([])
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [nuevoEstatus, setNuevoEstatus] = useState('')
  const [solucion, setSolucion] = useState('')

  const isSupport = ['AGENTE', 'SUPERVISOR', 'ADMINISTRADOR'].includes(user?.rol)

  useEffect(() => {
    loadTicket()
    if (isSupport) {
      Promise.all([catalogoService.getEstatus(), catalogoService.getAgentes()])
        .then(([estatus, agts]) => { setEstatusList(estatus); setAgentes(agts) })
    }
  }, [id])

  const loadTicket = async () => {
    setLoading(true)
    try {
      const t = await ticketService.obtenerDetalle(id)
      setTicket(t)
    } catch { navigate(-1) }
    finally { setLoading(false) }
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    setSending(true)
    try {
      await ticketService.comentar(id, comment, isInterno, archivos)
      setComment('')
      setArchivos([])
      await loadTicket()
      toast.success('Comentario enviado')
    } catch { toast.error('Error al enviar comentario') }
    finally { setSending(false) }
  }

  const handleChangeStatus = async () => {
    if (!nuevoEstatus) return
    try {
      await ticketService.cambiarEstatus(id, parseInt(nuevoEstatus), '', solucion)
      setShowStatusModal(false)
      await loadTicket()
      toast.success('Estatus actualizado')
    } catch { toast.error('Error al actualizar estatus') }
  }

  const handleAssign = async (agenteId) => {
    try {
      await ticketService.asignar(id, parseInt(agenteId))
      await loadTicket()
      toast.success('Ticket asignado')
    } catch { toast.error('Error al asignar') }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
    </div>
  )
  if (!ticket) return null

  const slaExpired = ticket.slaResolucion && new Date(ticket.slaResolucion) < new Date()
  const slaWarning = ticket.slaResolucion && new Date(ticket.slaResolucion) < new Date(Date.now() + 4 * 3600 * 1000)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-gray-400">{ticket.folio}</span>
            <StatusBadge status={ticket.estatus} color={ticket.estatusColor} />
            <PriorityBadge priority={ticket.prioridad} />
            {slaExpired && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">SLA vencido</span>
            )}
            {!slaExpired && slaWarning && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Próximo a vencer</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{ticket.asunto}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-700 mb-3">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{ticket.descripcion}</p>

            {/* Evidencias del ticket */}
            {ticket.evidencias?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Evidencias adjuntas</p>
                <div className="grid grid-cols-3 gap-3">
                  {ticket.evidencias.map(e => (
                    <a key={e.id} href={e.url} target="_blank" rel="noreferrer">
                      <img src={"./ventus/uploads/" + e.url} alt={e.nombreOriginal}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Solución */}
            {ticket.solucion && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Solución documentada</p>
                <p className="text-sm text-green-900">{ticket.solucion}</p>
              </div>
            )}
          </div>

          {/* Comments / Timeline */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Conversación</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {ticket.comentarios?.map(c => (
                <div key={c.id} className={`flex gap-3 ${c.autorId === user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-primary-700" />
                  </div>
                  <div className={`max-w-[80%] ${c.autorId === user?.id ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      c.esInterno ? 'bg-amber-50 border border-amber-200 text-amber-900' :
                      c.autorId === user?.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      {c.esInterno && <span className="block text-xs font-semibold text-amber-600 mb-1">🔒 Comentario interno</span>}
                      {c.comentario}
                      {c.evidencias?.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {c.evidencias.map(e => (
                            <a key={e.id} href={e.url} target="_blank" rel="noreferrer">
                              <img src={e.url} alt={e.nombreOriginal}
                                className="w-full h-16 object-cover rounded-lg" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {c.autorNombre} · {c.createdAt && format(new Date(c.createdAt), 'dd MMM HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
              ))}
              {(!ticket.comentarios || ticket.comentarios.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-4">Sin comentarios aún</p>
              )}
            </div>

            {/* Comment input */}
            {ticket.estatus !== 'Cerrado' && ticket.estatus !== 'Cancelado' && (
              <div className="mt-4 space-y-3">
                {isSupport && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={isInterno} onChange={e => setIsInterno(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600" />
                    Comentario interno (solo visible para soporte)
                  </label>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="input-field flex-1 resize-none"
                    rows={2}
                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment() }}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="btn-secondary p-2 cursor-pointer" title="Adjuntar imagen">
                      <Paperclip size={18} />
                      <input type="file" multiple accept="image/*" className="hidden"
                        onChange={e => setArchivos(Array.from(e.target.files))} />
                    </label>
                    <button onClick={handleComment} disabled={!comment.trim() || sending}
                      className="btn-primary p-2 disabled:opacity-50">
                      {sending ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        : <Send size={18} />}
                    </button>
                  </div>
                </div>
                {archivos.length > 0 && (
                  <p className="text-xs text-gray-500">{archivos.length} archivo(s) seleccionado(s)</p>
                )}
              </div>
            )}
          </div>

          {/* History */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Historial de cambios</h3>
            <div className="space-y-3">
              {ticket.historial?.map((h, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>{h.cambiadoPor}</strong> cambió estatus
                      {h.estatusAnterior && <> de <span className="font-medium">{h.estatusAnterior}</span></>}
                      {' a '}<span className="font-medium text-primary-700">{h.estatusNuevo}</span>
                    </p>
                    {h.comentario && <p className="text-xs text-gray-500 mt-0.5">{h.comentario}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {h.createdAt && format(new Date(h.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Información</h3>

            <InfoRow icon={<Tag size={14} />} label="Tipo" value={ticket.tipoSolicitud} />
            <InfoRow icon={<Tag size={14} />} label="Categoría" value={ticket.categoriaServicio} />
            {ticket.subcategoriaServicio && <InfoRow icon={<Tag size={14} />} label="Subcategoría" value={ticket.subcategoriaServicio} />}
            <InfoRow icon={<User size={14} />} label="Solicitante" value={ticket.usuarioNombre} />
            <InfoRow icon={<Building2 size={14} />} label="Dependencia" value={ticket.dependenciaNombre} />
            {ticket.edificioNombre && <InfoRow icon={<Building2 size={14} />} label="Edificio" value={`${ticket.edificioNombre}${ticket.pisoNombre ? ' · ' + ticket.pisoNombre : ''}`} />}
            {ticket.agenteNombre && <InfoRow icon={<User size={14} />} label="Agente" value={ticket.agenteNombre} />}
            {ticket.canalOrigen && <InfoRow icon={<Tag size={14} />} label="Canal" value={ticket.canalOrigen} />}

            <div className="border-t pt-3 space-y-2">
              <InfoRow icon={<Clock size={14} />} label="Creado"
                value={ticket.createdAt && format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')} />
              {ticket.fechaResolucion && (
                <InfoRow icon={<Clock size={14} />} label="Resuelto"
                  value={format(new Date(ticket.fechaResolucion), 'dd/MM/yyyy HH:mm')} />
              )}
              {ticket.slaResolucion && (
                <InfoRow icon={<Clock size={14} />} label="SLA resolución"
                  value={format(new Date(ticket.slaResolucion), 'dd/MM/yyyy HH:mm')}
                  valueClass={slaExpired ? 'text-red-600 font-semibold' : ''} />
              )}
            </div>
          </div>

          {/* Support actions */}
          {isSupport && (
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Acciones de soporte</h3>

              {/* Cambiar estatus */}
              <div>
                <label className="label text-xs">Cambiar estatus</label>
                <select
                  value={nuevoEstatus}
                  onChange={e => setNuevoEstatus(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">-- Selecciona --</option>
                  {estatusList.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
                {nuevoEstatus && (
                  <div className="mt-2">
                    <textarea
                      value={solucion}
                      onChange={e => setSolucion(e.target.value)}
                      placeholder="Solución o comentario..."
                      className="input-field text-sm resize-none"
                      rows={2}
                    />
                    <button onClick={handleChangeStatus} className="btn-primary w-full mt-2 text-sm py-2">
                      Aplicar cambio
                    </button>
                  </div>
                )}
              </div>

              {/* Asignar */}
              <div>
                <label className="label text-xs">Asignar a agente</label>
                <select
                  defaultValue={ticket.agenteId || ''}
                  onChange={e => e.target.value && handleAssign(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">-- Selecciona agente --</option>
                  {agentes.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre} {a.apellidoPaterno}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, valueClass = '' }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm text-gray-700 ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}
