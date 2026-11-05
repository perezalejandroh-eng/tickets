import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { authService } from '../../services/authService'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); return }
    authService.verificarCorreo(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [params])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto" />
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">¡Correo verificado!</h2>
            <p className="text-gray-600 mb-6">Tu cuenta ha sido activada. Ya puedes iniciar sesión.</p>
            <Link to="/login" className="btn-primary inline-block px-8 py-3">Ir al login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Enlace inválido</h2>
            <p className="text-gray-600 mb-6">El enlace de verificación es inválido o ya expiró.</p>
            <Link to="/login" className="btn-secondary inline-block px-8 py-3">Volver al login</Link>
          </>
        )}
      </div>
    </div>
  )
}
