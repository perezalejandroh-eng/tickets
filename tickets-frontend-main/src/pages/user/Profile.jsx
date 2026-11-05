import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building2, MapPin, Layers, KeyRound, Eye, EyeOff, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import userService from '../../services/userService'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-primary-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user: authUser, updateUser } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNuevo, setPasswordNuevo] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showActual, setShowActual] = useState(false)
  const [showNuevo, setShowNuevo] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const cargarPerfil = async () => {
    setLoading(true)
    try {
      const data = await userService.obtenerPerfil()
      setPerfil(data)
      updateUser({ nombre: data.nombre, correo: data.correo })
    } catch {
      toast.error('No se pudo cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarPerfil() }, [])

  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    if (!passwordActual || !passwordNuevo) {
      toast.error('Completa todos los campos')
      return
    }
    if (passwordNuevo.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (passwordNuevo !== passwordConfirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setSavingPassword(true)
    try {
      await userService.cambiarPasswordPerfil(passwordActual, passwordNuevo)
      toast.success('Contraseña actualizada correctamente')
      setPasswordActual('')
      setPasswordNuevo('')
      setPasswordConfirm('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar la contraseña')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-5 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const nombreCompleto = perfil
    ? [perfil.nombre, perfil.apellidoPaterno, perfil.apellidoMaterno].filter(Boolean).join(' ')
    : authUser?.nombre ?? '—'

  const ESTATUS_COLORS = {
    ACTIVO:    'bg-green-100 text-green-700',
    PENDIENTE: 'bg-amber-100 text-amber-700',
    INACTIVO:  'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <button
          onClick={cargarPerfil}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tarjeta de identidad */}
        <div className="card p-6 flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={36} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{nombreCompleto}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{perfil?.correo}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 font-medium">
              {perfil?.rol?.nombre ?? authUser?.rol}
            </span>
            {perfil?.estatus && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ESTATUS_COLORS[perfil.estatus] ?? 'bg-gray-100 text-gray-600'}`}>
                {perfil.estatus}
              </span>
            )}
          </div>
          {perfil?.createdAt && (
            <p className="text-xs text-gray-400 mt-1">
              Registrado el {format(new Date(perfil.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          )}
        </div>

        {/* Datos de contacto */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Datos de contacto</h3>
          <p className="text-xs text-gray-400 mb-4">Para modificar tus datos, contacta al administrador.</p>
          <InfoRow icon={Mail}     label="Correo electrónico" value={perfil?.correo} />
          <InfoRow icon={Phone}    label="Teléfono"           value={perfil?.telefono} />
          <InfoRow icon={Phone}    label="Extensión"          value={perfil?.extension} />
          <InfoRow icon={Layers}   label="Área"               value={perfil?.area} />
          <InfoRow icon={Building2} label="Dependencia"       value={perfil?.dependencia?.nombre} />
          <InfoRow icon={Building2} label="Edificio"          value={perfil?.edificio?.nombre} />
          <InfoRow icon={MapPin}   label="Piso"               value={perfil?.piso?.nombre} />
        </div>

        {/* Cambiar contraseña */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-700">Cambiar contraseña</h3>
          </div>

          <form onSubmit={handleCambiarPassword} className="space-y-3">
            <div>
              <label className="label">Contraseña actual</label>
              <div className="relative">
                <input
                  type={showActual ? 'text' : 'password'}
                  value={passwordActual}
                  onChange={e => setPasswordActual(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Tu contraseña actual"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowActual(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showActual ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNuevo ? 'text' : 'password'}
                  value={passwordNuevo}
                  onChange={e => setPasswordNuevo(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNuevo(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNuevo ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirmar contraseña</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className="input-field"
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-1"
            >
              <Save size={15} />
              {savingPassword ? 'Guardando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
