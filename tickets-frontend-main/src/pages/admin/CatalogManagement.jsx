import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { catalogoService } from '../../services/catalogoService'
import clsx from 'clsx'

// ── Configuración de cada tipo de catálogo ──────────────────────────────────
const TABS = [
  {
    key: 'dependencias',
    label: 'Dependencias',
    fields: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'descripcion', label: 'Descripción' },
    ],
  },
  {
    key: 'edificios',
    label: 'Edificios',
    fields: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'direccion', label: 'Dirección' },
      { name: 'descripcion', label: 'Descripción' },
    ],
  },
  {
    key: 'tipos-solicitud',
    label: 'Tipos Solicitud',
    fields: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'descripcion', label: 'Descripción' },
    ],
  },
  {
    key: 'categorias',
    label: 'Categorías',
    fields: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'descripcion', label: 'Descripción' },
      { name: 'icono', label: 'Icono (clase/código)' },
    ],
  },
  {
    key: 'subcategorias',
    label: 'Subcategorías',
    requiresParent: true,
    fields: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'descripcion', label: 'Descripción' },
    ],
  },
  {
    key: 'estatus',
    label: 'Estatus Ticket',
    noTimestamps: true,
    fields: [
      { name: 'nombre', label: 'Nombre', required: true },
      { name: 'descripcion', label: 'Descripción' },
      { name: 'orden', label: 'Orden', type: 'number' },
      { name: 'color', label: 'Color (hex)', type: 'color' },
      { name: 'esFinal', label: 'Estado final', type: 'checkbox' },
    ],
  },
]

const emptyForm = () => ({
  nombre: '', descripcion: '', direccion: '', icono: '',
  categoriaServicioId: '', orden: '', color: '#6b7280', esFinal: false,
})

const itemToForm = (item) => ({
  nombre: item.nombre ?? '',
  descripcion: item.descripcion ?? '',
  direccion: item.direccion ?? '',
  icono: item.icono ?? '',
  categoriaServicioId: item.categoriaServicio?.id ?? '',
  orden: item.orden ?? '',
  color: item.color ?? '#6b7280',
  esFinal: item.esFinal ?? false,
})

// ── Componente principal ───────────────────────────────────────────────────
export default function CatalogManagement() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [filterCatId, setFilterCatId] = useState('')

  // Carga categorías para el selector de subcategorías
  useEffect(() => {
    catalogoService.getCategorias().then(setCategorias).catch(() => {})
  }, [])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = activeTab.key === 'subcategorias' && filterCatId
        ? { categoriaId: filterCatId }
        : {}
      const data = await catalogoService.adminListar(activeTab.key, params)
      setItems(data ?? [])
    } catch {
      toast.error('Error al cargar el catálogo')
    } finally {
      setLoading(false)
    }
  }, [activeTab, filterCatId])

  useEffect(() => { loadItems() }, [loadItems])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFilterCatId('')
    setModalOpen(false)
  }

  // ── Modal ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingItem(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm(itemToForm(item))
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleFieldChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    if (activeTab.key === 'subcategorias' && !editingItem && !form.categoriaServicioId) {
      toast.error('Selecciona una categoría')
      return
    }

    setSaving(true)
    try {
      const payload = { ...form }
      if (payload.orden !== '') payload.orden = parseInt(payload.orden, 10)
      else delete payload.orden

      if (editingItem) {
        await catalogoService.actualizar(activeTab.key, editingItem.id, payload)
        toast.success('Registro actualizado')
      } else {
        await catalogoService.crear(activeTab.key, payload)
        toast.success('Registro creado')
      }
      closeModal()
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle activo / eliminar ────────────────────────────────────────────
  const handleToggle = async (item) => {
    if (item.activo && !window.confirm(`¿Desactivar "${item.nombre}"? Dejará de aparecer en los formularios.`)) return

    setTogglingId(item.id)
    try {
      if (item.activo) {
        await catalogoService.eliminar(activeTab.key, item.id)
        toast.success('Registro desactivado')
      } else {
        await catalogoService.activar(activeTab.key, item.id)
        toast.success('Registro activado')
      }
      loadItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar estatus')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs de tipo de catálogo */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t)}
            className={clsx(
              'px-4 py-2 text-sm rounded-lg font-medium transition-colors',
              activeTab.key === t.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{activeTab.label}</h2>
            {!loading && (
              <p className="text-xs text-gray-500 mt-0.5">{items.length} registro{items.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadItems}
              disabled={loading}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              title="Refrescar"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Nuevo
            </button>
          </div>
        </div>

        {/* Filtro de categoría para subcategorías */}
        {activeTab.key === 'subcategorias' && (
          <div className="mb-4">
            <label className="label">Filtrar por categoría</label>
            <select
              value={filterCatId}
              onChange={e => setFilterCatId(e.target.value)}
              className="input-field w-72"
            >
              <option value="">— Todas las categorías —</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tabla de items */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 pr-4 font-medium text-gray-600">Nombre</th>
                  {activeTab.key === 'subcategorias' && (
                    <th className="pb-3 pr-4 font-medium text-gray-600">Categoría</th>
                  )}
                  {activeTab.key === 'estatus' && (
                    <>
                      <th className="pb-3 pr-4 font-medium text-gray-600">Orden</th>
                      <th className="pb-3 pr-4 font-medium text-gray-600">Color</th>
                    </>
                  )}
                  {!activeTab.noTimestamps && (
                    <th className="pb-3 pr-4 font-medium text-gray-600">Creado</th>
                  )}
                  <th className="pb-3 pr-4 font-medium text-gray-600">Estatus</th>
                  <th className="pb-3 text-right font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr
                    key={item.id}
                    className={clsx(
                      'hover:bg-gray-50 transition-colors',
                      !item.activo && 'opacity-60'
                    )}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{item.nombre}</p>
                      {item.descripcion && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{item.descripcion}</p>
                      )}
                    </td>

                    {activeTab.key === 'subcategorias' && (
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {item.categoriaServicio?.nombre ?? '—'}
                      </td>
                    )}

                    {activeTab.key === 'estatus' && (
                      <>
                        <td className="py-3 pr-4 text-gray-500">{item.orden}</td>
                        <td className="py-3 pr-4">
                          {item.color ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="inline-block w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs text-gray-500">{item.color}</span>
                            </span>
                          ) : '—'}
                        </td>
                      </>
                    )}

                    {!activeTab.noTimestamps && (
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {item.createdAt
                          ? format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: es })
                          : '—'}
                      </td>
                    )}

                    <td className="py-3 pr-4">
                      {item.activo
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={12} />Activo</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-gray-400"><XCircle size={12} />Inactivo</span>
                      }
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(item)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggle(item)}
                          disabled={togglingId === item.id}
                          title={item.activo ? 'Desactivar' : 'Activar'}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors disabled:opacity-50',
                            item.activo
                              ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                              : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                          )}
                        >
                          {item.activo ? <Trash2 size={14} /> : <CheckCircle size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">Sin registros</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de crear / editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* Contenido del modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {editingItem ? `Editar ${activeTab.label}` : `Nuevo registro — ${activeTab.label}`}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Selector de categoría solo en subcategorías al crear */}
            {activeTab.key === 'subcategorias' && !editingItem && (
              <div>
                <label className="label">Categoría *</label>
                <select
                  value={form.categoriaServicioId}
                  onChange={e => handleFieldChange('categoriaServicioId', e.target.value)}
                  className="input-field"
                >
                  <option value="">— Selecciona una categoría —</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Categoría padre readonly al editar subcategoría */}
            {activeTab.key === 'subcategorias' && editingItem && (
              <div>
                <label className="label">Categoría</label>
                <input
                  value={editingItem.categoriaServicio?.nombre ?? ''}
                  readOnly
                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            )}

            {/* Campos dinámicos según el tab */}
            {activeTab.fields.map(field => (
              <div key={field.name}>
                <label className="label">
                  {field.label}{field.required && ' *'}
                </label>

                {field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form[field.name] ?? false}
                      onChange={e => handleFieldChange(field.name, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Marcar como estado final del ticket</span>
                  </label>
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form[field.name] ?? '#6b7280'}
                      onChange={e => handleFieldChange(field.name, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={form[field.name] ?? ''}
                      onChange={e => handleFieldChange(field.name, e.target.value)}
                      placeholder="#6b7280"
                      className="input-field flex-1"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={form[field.name] ?? ''}
                    onChange={e => handleFieldChange(field.name, e.target.value)}
                    className="input-field"
                    placeholder={field.required ? 'Requerido' : 'Opcional'}
                  />
                )}
              </div>
            ))}

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 text-sm"
              >
                {saving ? 'Guardando…' : editingItem ? 'Actualizar' : 'Crear'}
              </button>
              <button onClick={closeModal} className="btn-secondary text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
