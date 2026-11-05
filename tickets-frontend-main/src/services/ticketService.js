import api from '../api/axiosConfig'

export const ticketService = {
  async crearTicket(ticketData, archivos) {
    const formData = new FormData()
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], { type: 'application/json' }))
    if (archivos?.length) {
      archivos.forEach(f => formData.append('archivos', f))
    }
    const { data } = await api.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.data
  },

  async misTickets(page = 0, size = 10, sort = 'createdAt,desc') {
    const { data } = await api.get('/tickets/mis-tickets', { params: { page, size, sort } })
    return data.data
  },

  async obtenerDetalle(id) {
    const { data } = await api.get(`/tickets/${id}`)
    return data.data
  },

  async cambiarEstatus(id, nuevoEstatusId, comentario, solucion) {
    const { data } = await api.patch(`/tickets/${id}/estatus`, { nuevoEstatusId, comentario, solucion })
    return data.data
  },

  async asignar(id, agenteId) {
    const { data } = await api.patch(`/tickets/${id}/asignar`, { agenteId })
    return data.data
  },

  async comentar(id, comentario, esInterno, archivos) {
    const formData = new FormData()
    formData.append('comentario', new Blob([JSON.stringify({ comentario, esInterno })], { type: 'application/json' }))
    if (archivos?.length) {
      archivos.forEach(f => formData.append('archivos', f))
    }
    const { data } = await api.post(`/tickets/${id}/comentarios`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.data
  },

  // Soporte
  async bandeja(page = 0, size = 20) {
    const { data } = await api.get('/soporte/bandeja', { params: { page, size } })
    return data.data
  },

  async nuevos() {
    const { data } = await api.get('/soporte/nuevos')
    return data.data
  },

  async misAsignados(page = 0, size = 20) {
    const { data } = await api.get('/soporte/mis-tickets', { params: { page, size } })
    return data.data
  },

  async dashboard() {
    const { data } = await api.get('/soporte/dashboard')
    return data.data
  },
}
