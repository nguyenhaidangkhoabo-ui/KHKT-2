import { apiClient } from './api/apiClient'

export const adminDiplomaService = {
  getDiplomas: (params) => apiClient('/diploma/diplomas', { params }),
  getStats: () => apiClient('/diploma/diplomas/stats'),
  receiveDiploma: (id) => apiClient(`/diploma/diplomas/${id}/receive`, { method: 'POST' }),
  bulkReceive: (ids) => apiClient('/diploma/diplomas/bulk-receive', { method: 'POST', body: { ids } }),
  handoverDiploma: (id) => apiClient(`/diploma/diplomas/${id}/handover`, { method: 'POST' }),
  bulkHandover: (ids) => apiClient('/diploma/diplomas/bulk-handover', { method: 'POST', body: { ids } }),
}