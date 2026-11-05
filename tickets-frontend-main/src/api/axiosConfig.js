import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
	baseURL: '/api',
  //baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Error de conexión'

    if (status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (status === 403) {
      toast.error('No tienes permiso para realizar esta acción')
    } else if (status >= 500) {
      toast.error('Error del servidor. Intenta más tarde.')
    }

    return Promise.reject(error)
  }
)

export default api
