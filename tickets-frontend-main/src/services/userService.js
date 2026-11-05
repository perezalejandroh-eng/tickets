import api from '../api/axiosConfig'

const userService = {
  // ── Admin: listado y gestión ─────────────────────────────────────────
  async listarUsuarios(page = 0, size = 10) {
    const response = await api.get('/usuarios/all', { params: { page, size, sort: 'createdAt,desc' } })
    return response.data.data
  },

  async getRoles() {
    const { data } = await api.get('/usuarios/roles')
    return data.data
  },

  async aprobarUsuario(id) {
    const response = await api.patch(`/usuarios/${id}/aprobar`)
    return response.data.data
  },

  async activarUsuario(id) {
    const response = await api.patch(`/usuarios/${id}/activar`)
    return response.data.data
  },

  async desactivarUsuario(id) {
    const response = await api.patch(`/usuarios/${id}/desactivar`)
    return response.data.data
  },

  async actualizarUsuario(id, payload) {
    const { data } = await api.put(`/usuarios/${id}`, payload)
    return data.data
  },

  async resetearPassword(id, password) {
    await api.patch(`/usuarios/${id}/password`, { password })
  },

  // ── Perfil propio ────────────────────────────────────────────────────
  async obtenerPerfil() {
    const { data } = await api.get('/usuarios/me')
    return data.data
  },

  async cambiarPasswordPerfil(passwordActual, passwordNuevo) {
    await api.patch('/usuarios/me/password', { passwordActual, passwordNuevo })
  },
}

export default userService
