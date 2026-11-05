import api from '../api/axiosConfig'

export const authService = {
  async login(correo, password) {
    const { data } = await api.post('/auth/login', { correo, password })
    return data.data
  },

  async register(userData) {
    const { data } = await api.post('/auth/register', userData)
    return data
  },

  async verificarCorreo(token) {
    const { data } = await api.get(`/auth/verificar?token=${token}`)
    return data
  },

  async solicitarRecuperacion(correo) {
    const { data } = await api.post('/auth/recuperar', { correo })
    return data
  },

  async resetPassword(token, password) {
    const { data } = await api.post('/auth/reset-password', { token, password })
    return data
  },

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  saveSession(jwtData) {
    localStorage.setItem('accessToken', jwtData.accessToken)
    localStorage.setItem('refreshToken', jwtData.refreshToken)
    localStorage.setItem('user', JSON.stringify({
      id: jwtData.id,
      nombre: jwtData.nombre,
      correo: jwtData.correo,
      rol: jwtData.rol,
    }))
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  },
}
