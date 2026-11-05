import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Upload, X, AlertCircle, PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { ticketService } from '../../services/ticketService'
import { catalogoService } from '../../services/catalogoService'
import { useAuth } from '../../context/AuthContext'

// Auto-priority calculator
function calcPriority(impactoValor, urgenciaValor) {
  const sum = impactoValor + urgenciaValor
  if (sum <= 2) return 'Baja'
  if (sum <= 4) return 'Media'
  if (sum <= 6) return 'Alta'
  return 'Crítica'
}

export default function CreateTicket() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [archivos, setArchivos] = useState([])
  const [previews, setPreviews] = useState([])
  const [catalogs, setCatalogs] = useState({
    dependencias: [], edificios: [], pisos: [], tipos: [],
    categorias: [], subcategorias: [], impactos: [], urgencias: []
  })
  const [prioridadCalc, setPrioridadCalc] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()

  const edificioId = watch('edificioId')
  const categoriaId = watch('categoriaServicioId')
  const impactoId = watch('impactoId')
  const urgenciaId = watch('urgenciaId')

  // Load catalogs
  useEffect(() => {
    Promise.all([
      catalogoService.getDependencias(),
      catalogoService.getEdificios(),
      catalogoService.getTiposSolicitud(),
      catalogoService.getCategorias(),
      catalogoService.getImpactos(),
      catalogoService.getUrgencias(),
    ]).then(([dependencias, edificios, tipos, categorias, impactos, urgencias]) => {
      setCatalogs(c => ({ ...c, dependencias, edificios, tipos, categorias, impactos, urgencias }))
    })
  }, [])

  // Load pisos when edificio changes
  useEffect(() => {
    if (edificioId) {
      catalogoService.getPisos(edificioId).then(pisos => setCatalogs(c => ({ ...c, pisos })))
    }
  }, [edificioId])

  // Load subcategorias when categoria changes
  useEffect(() => {
    if (categoriaId) {
      catalogoService.getSubcategorias(categoriaId)
        .then(subs => setCatalogs(c => ({ ...c, subcategorias: subs })))
    } else {
      setCatalogs(c => ({ ...c, subcategorias: [] }))
    }
    setValue('subcategoriaServicioId', '')
  }, [categoriaId])

  // Calculate priority
  useEffect(() => {
    if (impactoId && urgenciaId) {
      const imp = catalogs.impactos.find(i => i.id == impactoId)
      const urg = catalogs.urgencias.find(u => u.id == urgenciaId)
      if (imp && urg) setPrioridadCalc(calcPriority(imp.valor, urg.valor))
    }
  }, [impactoId, urgenciaId, catalogs.impactos, catalogs.urgencias])

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    if (archivos.length + files.length > 5) {
      toast.error('Máximo 5 archivos')
      return
    }
    setArchivos(prev => [...prev, ...files])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews(prev => [...prev, { name: f.name, url: ev.target.result }])
      reader.readAsDataURL(f)
    })
  }

  const removeFile = (idx) => {
    setArchivos(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const ticket = await ticketService.crearTicket(data, archivos)
      toast.success(`Ticket ${ticket.folio} creado exitosamente`)
      navigate(`/tickets/${ticket.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear ticket')
    } finally { setLoading(false) }
  }

  const prioridadColors = {
    'Baja': 'text-gray-600 bg-gray-100',
    'Media': 'text-amber-700 bg-amber-100',
    'Alta': 'text-red-700 bg-red-100',
    'Crítica': 'text-purple-800 bg-purple-100',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo ticket de soporte</h1>
        <p className="text-gray-500 text-sm mt-1">Completa el formulario para registrar tu solicitud</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Ubicación */}
        <Section title="1. Ubicación organizacional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Dependencia</label>
              <select {...register('dependenciaId')} className="input-field">
                <option value="">-- Selecciona --</option>
                {catalogs.dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Edificio</label>
              <select {...register('edificioId')} className="input-field">
                <option value="">-- Selecciona --</option>
                {catalogs.edificios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Piso</label>
              <select {...register('pisoId')} className="input-field" disabled={!edificioId}>
                <option value="">-- Selecciona edificio --</option>
                {catalogs.pisos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Área / Oficina</label>
              <input {...register('area')} className="input-field" placeholder="Ej. Sala de juntas, oficina 301" />
            </div>
          </div>
        </Section>

        {/* Tipo y categoría */}
        <Section title="2. Clasificación del servicio">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de solicitud *</label>
              <select {...register('tipoSolicitudId', { required: 'Requerido' })} className="input-field">
                <option value="">-- Selecciona --</option>
                {catalogs.tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
              {errors.tipoSolicitudId && <p className="text-red-500 text-xs mt-1">{errors.tipoSolicitudId.message}</p>}
            </div>
            <div>
              <label className="label">Categoría *</label>
              <select {...register('categoriaServicioId', { required: 'Requerido' })} className="input-field">
                <option value="">-- Selecciona --</option>
                {catalogs.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {errors.categoriaServicioId && <p className="text-red-500 text-xs mt-1">{errors.categoriaServicioId.message}</p>}
            </div>
            <div>
              <label className="label">Subcategoría</label>
              <select {...register('subcategoriaServicioId')} className="input-field" disabled={!categoriaId || catalogs.subcategorias.length === 0}>
                <option value="">-- Selecciona categoría --</option>
                {catalogs.subcategorias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Descripción */}
        <Section title="3. Descripción del problema">
          <div className="space-y-4">
            <div>
              <label className="label">Asunto *</label>
              <input
                {...register('asunto', { required: 'El asunto es requerido', minLength: { value: 5, message: 'Mínimo 5 caracteres' } })}
                className="input-field"
                placeholder="Resumen breve del problema"
              />
              {errors.asunto && <p className="text-red-500 text-xs mt-1">{errors.asunto.message}</p>}
            </div>
            <div>
              <label className="label">Descripción detallada *</label>
              <textarea
                {...register('descripcion', { required: 'La descripción es requerida', minLength: { value: 10, message: 'Mínimo 10 caracteres' } })}
                className="input-field resize-none"
                rows={4}
                placeholder="Describe detalladamente el problema: ¿qué pasa?, ¿desde cuándo?, ¿qué ya intentaste?"
              />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion.message}</p>}
            </div>
          </div>
        </Section>

        {/* Impacto y Urgencia */}
        <Section title="4. Impacto y urgencia">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Impacto *</label>
              <select {...register('impactoId', { required: 'Requerido' })} className="input-field">
                <option value="">-- Selecciona --</option>
                {catalogs.impactos.map(i => <option key={i.id} value={i.id}>{i.nombre} — {i.descripcion}</option>)}
              </select>
              {errors.impactoId && <p className="text-red-500 text-xs mt-1">{errors.impactoId.message}</p>}
            </div>
            <div>
              <label className="label">Urgencia *</label>
              <select {...register('urgenciaId', { required: 'Requerido' })} className="input-field">
                <option value="">-- Selecciona --</option>
                {catalogs.urgencias.map(u => <option key={u.id} value={u.id}>{u.nombre} — {u.descripcion}</option>)}
              </select>
              {errors.urgenciaId && <p className="text-red-500 text-xs mt-1">{errors.urgenciaId.message}</p>}
            </div>
          </div>

          {prioridadCalc && (
            <div className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-fit ${prioridadColors[prioridadCalc]}`}>
              <AlertCircle size={16} />
              Prioridad calculada: <strong>{prioridadCalc}</strong>
            </div>
          )}
        </Section>

        {/* Evidencias */}
        <Section title="5. Evidencias (imágenes)">
          <div>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                Arrastra imágenes o <span className="text-primary-600 font-medium">haz clic para seleccionar</span>
              </span>
              <input type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Máx. 10MB por archivo — Máx. 5 archivos</p>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {previews.map((prev, idx) => (
                  <div key={idx} className="relative group">
                    <img src={prev.url} alt={prev.name}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8">
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : <PlusCircle size={18} />}
            {loading ? 'Enviando...' : 'Crear ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}
