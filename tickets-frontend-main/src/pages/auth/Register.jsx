import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { catalogoService } from '../../services/catalogoService'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dependencias, setDependencias] = useState([])
  const [edificios, setEdificios] = useState([])
  const [pisos, setPisos] = useState([])

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const edificioId = watch('edificioId')

  useEffect(() => {
    Promise.all([catalogoService.getDependencias(), catalogoService.getEdificios()])
      .then(([deps, edifs]) => { setDependencias(deps); setEdificios(edifs) })
  }, [])

  useEffect(() => {
    if (edificioId) {
      catalogoService.getPisos(edificioId).then(setPisos)
    } else {
      setPisos([])
    }
  }, [edificioId])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.register(data)
      toast.success('¡Registro exitoso! Verifica tu correo para activar tu cuenta.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-lg mb-3">
            <span className="text-primary-700 font-bold text-xl">ST</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Registro de usuario</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre */}
              <div>
                <label className="label">Nombre *</label>
                <input {...register('nombre', { required: 'Requerido' })} className="input-field" />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
              </div>
              {/* Apellido paterno */}
              <div>
                <label className="label">Apellido paterno *</label>
                <input {...register('apellidoPaterno', { required: 'Requerido' })} className="input-field" />
                {errors.apellidoPaterno && <p className="text-red-500 text-xs mt-1">{errors.apellidoPaterno.message}</p>}
              </div>
              {/* Apellido materno */}
              <div>
                <label className="label">Apellido materno</label>
                <input {...register('apellidoMaterno')} className="input-field" />
              </div>
              {/* Correo */}
              <div>
                <label className="label">Correo institucional *</label>
                <input
                  type="email"
                  {...register('correo', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Inválido' } })}
                  className="input-field"
                />
                {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
              </div>
              {/* Contraseña */}
              <div>
                <label className="label">Contraseña *</label>
                <input
                  type="password"
                  {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                  className="input-field"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              {/* Teléfono */}
              <div>
                <label className="label">Teléfono</label>
                <input {...register('telefono')} className="input-field" />
              </div>
              {/* Extensión */}
              <div>
                <label className="label">Extensión</label>
                <input {...register('extension')} className="input-field" />
              </div>
              {/* Dependencia */}
              <div>
                <label className="label">Dependencia / Departamento</label>
                <select {...register('dependenciaId')} className="input-field">
                  <option value="">-- Selecciona --</option>
                  {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              {/* Edificio */}
              <div>
                <label className="label">Edificio</label>
                <select {...register('edificioId')} className="input-field">
                  <option value="">-- Selecciona --</option>
                  {edificios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              {/* Piso */}
              <div>
                <label className="label">Piso</label>
                <select {...register('pisoId')} className="input-field" disabled={!edificioId}>
                  <option value="">-- Selecciona edificio primero --</option>
                  {pisos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              {/* Área */}
              <div className="md:col-span-2">
                <label className="label">Área / Oficina</label>
                <input {...register('area')} className="input-field" placeholder="Ej. Oficina 301, Sala de juntas..." />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : <UserPlus size={18} />}
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
