import api from '../api/axiosConfig'

export const catalogoService = {
  // ── Endpoints públicos (solo activos) ──────────────────────────────
  async getDependencias() {
    const { data } = await api.get('/catalogo/publico/dependencias')
    return data.data
  },
  async getEdificios() {
    const { data } = await api.get('/catalogo/publico/edificios')
    return data.data
  },
  async getPisos(edificioId) {
    const params = edificioId ? { edificioId } : {}
    const { data } = await api.get('/catalogo/publico/pisos', { params })
    return data.data
  },
  async getTiposSolicitud() {
    const { data } = await api.get('/catalogo/publico/tipos-solicitud')
    return data.data
  },
  async getCategorias() {
    const { data } = await api.get('/catalogo/publico/categorias')
    return data.data
  },
  async getSubcategorias(categoriaId) {
    const { data } = await api.get('/catalogo/publico/subcategorias', { params: { categoriaId } })
    return data.data
  },
  async getImpactos() {
    const { data } = await api.get('/catalogo/publico/impactos')
    return data.data
  },
  async getUrgencias() {
    const { data } = await api.get('/catalogo/publico/urgencias')
    return data.data
  },
  async getPrioridades() {
    const { data } = await api.get('/catalogo/publico/prioridades')
    return data.data
  },
  async getEstatus() {
    const { data } = await api.get('/catalogo/publico/estatus')
    return data.data
  },
  async getAgentes() {
    const { data } = await api.get('/catalogo/agentes')
    return data.data
  },

  // ── Admin: listar todo (incluye inactivos) ──────────────────────────
  async adminListar(tipo, params = {}) {
    const { data } = await api.get(`/catalogo/admin/${tipo}`, { params })
    return data.data
  },

  // ── Admin: CRUD ─────────────────────────────────────────────────────
  async crear(tipo, payload) {
    const { data } = await api.post(`/catalogo/${tipo}`, payload)
    return data.data
  },

  async actualizar(tipo, id, payload) {
    const { data } = await api.put(`/catalogo/${tipo}/${id}`, payload)
    return data.data
  },

  async eliminar(tipo, id) {
    await api.patch(`/catalogo/${tipo}/${id}/eliminar`)
  },

  async activar(tipo, id) {
    await api.patch(`/catalogo/${tipo}/${id}/activar`)
  },
}
