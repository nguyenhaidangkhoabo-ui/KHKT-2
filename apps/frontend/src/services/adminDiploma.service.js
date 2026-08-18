// Module Diploma — endpoint theo Phụ lục A. Backend cần được bổ sung trước khi dùng.
import { apiClient } from './api/apiClient'

export const adminDiplomaService = {
  getDiplomas: (params) => apiClient('/diploma/diplomas', { params }),
  getStats: () => apiClient('/diploma/diplomas/stats'),
  receiveDiploma: (id) => apiClient(`/diploma/diplomas/${id}/receive`, { method: 'POST' }),
  bulkReceive: (diploma_ids) => apiClient('/diploma/diplomas/bulk-receive', { method: 'POST', body: { diploma_ids } }),
  handoverDiploma: (id) => apiClient(`/diploma/diplomas/${id}/handover`, { method: 'POST' }),
  bulkHandover: (diploma_ids) => apiClient('/diploma/diplomas/bulk-handover', { method: 'POST', body: { diploma_ids } }),
}