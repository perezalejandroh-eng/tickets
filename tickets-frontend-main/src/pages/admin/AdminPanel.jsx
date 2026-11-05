import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Settings, BookOpen, Users, Database, CheckCircle, XCircle, ShieldCheck, ChevronLeft, ChevronRight, RefreshCw, Edit2, X, Eye, EyeOff, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import CatalogManagement from './CatalogManagement'
import { useAuth } from '../../context/AuthContext'
import userService from '../../services/userService'
import { catalogoService } from '../../services/catalogoService'
import clsx from 'clsx'

const tabs = [
  { path: '/admin', label: 'General', icon: Settings },
  { path: '/admin/catalogos', label: 'Catálogos', icon: BookOpen },
  { path: '/admin/usuarios', label: 'Usuarios', icon: Users },
]

export default function AdminPanel() {
  const { pathname } = useLocation()

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              pathname === path
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <Routes>
        <Route path="/" element={<AdminGeneral />} />
        <Route path="/catalogos" element={<CatalogManagement />} />
        <Route path="/usuarios" element={<AdminUsers />} />
      </Routes>
    </div>
  )
}

function AdminGeneral() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Configuración general</h2>
      <p className="text-gray-500 text-sm">
        Desde aquí puedes gestionar los parámetros del sistema, configurar integraciones y administrar la plataforma.
      </p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Parámetros del sistema', icon: Database, desc: 'SLA, tiempos, configuraciones' },
          { label: 'Gestión de catálogos', icon: BookOpen, desc: 'Categorías, estatus, prioridades' },
          { label: 'Administrar usuarios', icon: Users, desc: 'Roles, accesos y dependencias' },
        ].map(item => (
          <div key={item.label} className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/20 transition-colors cursor-pointer">
            <item.icon size={24} className="text-primary-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Modal de edición de usuario ────────────────────────────────────────────
function EditUserModal({ usuario, roles, dependencias, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: usuario.nombre ?? '',
    apellidoPaterno: usuario.apellidoPaterno ?? '',
    apellidoMaterno: usuario.apellidoMaterno ?? '',
    correo: usuario.correo ?? '',
    telefono: usuario.telefono ?? '',
    extension: usuario.extension ?? '',
    area: usuario.area ?? '',
    rolId: usuario.rol?.id ?? '',
    dependenciaId: usuario.dependencia?.id ?? '',
    edificioId: usuario.edificio?.id ?? '',
    pisoId: usuario.piso?.id ?? '',
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.apellidoPaterno.trim() || !form.correo.trim()) {
      toast.error('Nombre, apellido y correo son requeridos')
      return
    }
    if (!form.rolId) { toast.error('Selecciona un rol'); return }

    setSaving(true)
    try {
      await userService.actualizarUsuario(usuario.id, {
        ...form,
        rolId: Number(form.rolId),
        dependenciaId: form.dependenciaId ? Number(form.dependenciaId) : null,
        edificioId: form.edificioId ? Number(form.edificioId) : null,
        pisoId: form.pisoId ? Number(form.pisoId) : null,
      })

      if (showPasswordSection && password.trim()) {
        if (password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); setSaving(false); return }
        await userService.resetearPassword(usuario.id, password)
      }

      toast.success('Usuario actualizado correctamente')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="font-semibold text-gray-900">Editar usuario</h3>
            <p className="text-xs text-gray-500 mt-0.5">{usuario.correo}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Datos personales */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos personales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre *</label>
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Apellido paterno *</label>
                <input value={form.apellidoPaterno} onChange={e => set('apellidoPaterno', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Apellido materno</label>
                <input value={form.apellidoMaterno} onChange={e => set('apellidoMaterno', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Correo electrónico *</label>
                <input type="email" value={form.correo} onChange={e => set('correo', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Extensión</label>
                <input value={form.extension} onChange={e => set('extension', e.target.value)} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Área</label>
                <input value={form.area} onChange={e => set('area', e.target.value)} className="input-field" />
              </div>
            </div>
          </section>

          {/* Rol */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rol del sistema</h4>
            <select value={form.rolId} onChange={e => set('rolId', e.target.value)} className="input-field">
              <option value="">— Selecciona un rol —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </section>

          {/* Ubicación */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ubicación</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Dependencia</label>
                <select value={form.dependenciaId} onChange={e => set('dependenciaId', e.target.value)} className="input-field">
                  <option value="">— Sin asignar —</option>
                  {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Edificio</label>
                <input value={usuario.edificio?.nombre ?? '—'} readOnly className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Piso</label>
                <input value={usuario.piso?.nombre ?? '—'} readOnly className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
            </div>
          </section>

          {/* Cambio de contraseña */}
          <section className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPasswordSection(s => !s)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <KeyRound size={15} className="text-amber-500" />
                Restablecer contraseña
              </span>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full', showPasswordSection ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500')}>
                {showPasswordSection ? 'Ocultar' : 'Expandir'}
              </span>
            </button>

            {showPasswordSection && (
              <div className="px-4 pb-4 pt-1 bg-amber-50/40 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Deja vacío para no modificar la contraseña.</p>
                <label className="label">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-2 rounded-b-2xl">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

const ESTATUS_CONFIG = {
  ACTIVO:    { label: 'Activo',    bg: 'bg-green-100',  text: 'text-green-700'  },
  PENDIENTE: { label: 'Pendiente', bg: 'bg-amber-100',  text: 'text-amber-700'  },
  INACTIVO:  { label: 'Inactivo',  bg: 'bg-gray-100',   text: 'text-gray-600'   },
}

function EstatusBadge({ estatus }) {
  const config = ESTATUS_CONFIG[estatus] ?? ESTATUS_CONFIG.INACTIVO
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.bg, config.text)}>
      {config.label}
    </span>
  )
}

function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [editingUser, setEditingUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [dependencias, setDependencias] = useState([])

  useEffect(() => {
    userService.getRoles().then(setRoles).catch(() => {})
    catalogoService.getDependencias().then(setDependencias).catch(() => {})
  }, [])

  const cargarUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await userService.listarUsuarios(page, 10)
      setUsuarios(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch {
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { cargarUsuarios() }, [cargarUsuarios])

  const ejecutarAccion = async (id, accion, confirmarMsg) => {
    if (confirmarMsg && !window.confirm(confirmarMsg)) return
    setLoadingAction({ id, accion })
    try {
      await userService[accion](id)
      const labels = { aprobarUsuario: 'aprobado', activarUsuario: 'activado', desactivarUsuario: 'desactivado' }
      toast.success(`Usuario ${labels[accion]} correctamente`)
      await cargarUsuarios()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al ejecutar la acción')
    } finally {
      setLoadingAction(null)
    }
  }

  const isActioning = (id, accion) => loadingAction?.id === id && loadingAction?.accion === accion

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Gestión de usuarios</h2>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">{totalElements} usuario{totalElements !== 1 ? 's' : ''} registrado{totalElements !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            onClick={cargarUsuarios}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 pr-4 font-medium text-gray-600">Nombre</th>
                <th className="pb-3 pr-4 font-medium text-gray-600">Correo</th>
                <th className="pb-3 pr-4 font-medium text-gray-600">Rol</th>
                <th className="pb-3 pr-4 font-medium text-gray-600">Estatus</th>
                <th className="pb-3 pr-4 font-medium text-gray-600">Registro</th>
                <th className="pb-3 font-medium text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 pr-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 5 ? '80px' : '100%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {u.nombre} {u.apellidoPaterno}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{u.correo}</td>
                      <td className="py-3 pr-4 text-gray-600">{u.rol?.nombre ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <EstatusBadge estatus={u.estatus} />
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: es }) : '—'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Editar */}
                          <button
                            onClick={() => setEditingUser(u)}
                            disabled={!!loadingAction}
                            title="Editar usuario"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-xs font-medium transition-colors"
                          >
                            <Edit2 size={13} />
                            Editar
                          </button>

                          {/* Aprobar: solo para PENDIENTE */}
                          {u.estatus === 'PENDIENTE' && (
                            <button
                              onClick={() => ejecutarAccion(u.id, 'aprobarUsuario', null)}
                              disabled={!!loadingAction}
                              title="Aprobar usuario"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 text-xs font-medium transition-colors"
                            >
                              <ShieldCheck size={13} />
                              {isActioning(u.id, 'aprobarUsuario') ? 'Aprobando…' : 'Aprobar'}
                            </button>
                          )}

                          {/* Activar: solo para INACTIVO */}
                          {u.estatus === 'INACTIVO' && (
                            <button
                              onClick={() => ejecutarAccion(u.id, 'activarUsuario', null)}
                              disabled={!!loadingAction}
                              title="Activar usuario"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 text-xs font-medium transition-colors"
                            >
                              <CheckCircle size={13} />
                              {isActioning(u.id, 'activarUsuario') ? 'Activando…' : 'Activar'}
                            </button>
                          )}

                          {/* Desactivar: para ACTIVO y PENDIENTE, no para el usuario actual */}
                          {(u.estatus === 'ACTIVO' || u.estatus === 'PENDIENTE') && u.id !== currentUser?.id && (
                            <button
                              onClick={() => ejecutarAccion(
                                u.id,
                                'desactivarUsuario',
                                `¿Desactivar al usuario ${u.nombre} ${u.apellidoPaterno}? No podrá iniciar sesión.`
                              )}
                              disabled={!!loadingAction}
                              title="Desactivar usuario"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 text-xs font-medium transition-colors"
                            >
                              <XCircle size={13} />
                              {isActioning(u.id, 'desactivarUsuario') ? 'Desactivando…' : 'Desactivar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && usuarios.length === 0 && !error && (
            <p className="text-center text-gray-400 py-10 text-sm">No hay usuarios registrados.</p>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          usuario={editingUser}
          roles={roles}
          dependencias={dependencias}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); cargarUsuarios() }}
        />
      )}
    </div>
  )
}
