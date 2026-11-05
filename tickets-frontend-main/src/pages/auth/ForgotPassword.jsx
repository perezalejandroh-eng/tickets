import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ correo }) => {
    setLoading(true)
    try {
      await authService.solicitarRecuperacion(correo)
      setSent(true)
    } catch { toast.error('Error al procesar la solicitud') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">¡Correo enviado!</h2>
              <p className="text-gray-600 mb-6">
                Si tu correo está registrado, recibirás las instrucciones para recuperar tu contraseña.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Volver al login
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft size={14} /> Volver
              </Link>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recuperar contraseña</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Ingresa tu correo institucional y te enviaremos las instrucciones.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Correo electrónico</label>
                  <input
                    type="email"
                    {...register('correo', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Inválido' } })}
                    className="input-field"
                    placeholder="usuario@institucion.edu.mx"
                  />
                  {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
