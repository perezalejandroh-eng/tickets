import api from '../api/axiosConfig'

export const notificacionService = {
  async listar(page = 0, size = 20) {
    const { data } = await api.get('/notificaciones', { params: { page, size } })
    return data.data
  },
  async noLeidas() {
    const { data } = await api.get('/notificaciones/no-leidas')
    return data.data
  },
  async contador() {
    const { data } = await api.get('/notificaciones/contador')
    return data.data.noLeidas
  },
  async marcarLeida(id) {
    await api.patch(`/notificaciones/${id}/leer`)
  },
  async marcarTodasLeidas() {
    await api.patch('/notificaciones/leer-todas')
  },
}
