import axios from 'axios'
import { APP_CONFIG } from '../config/app.config'

export class ApiError extends Error {
  constructor(message, status = 500, code = 'UNKNOWN_ERROR', data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

const axiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONFIG.storageKeys.token)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        localStorage.removeItem(APP_CONFIG.storageKeys.token)
        localStorage.removeItem(APP_CONFIG.storageKeys.user)
      }

      const errorMessage =
        (typeof data === 'object' && (data.message || data.error)) ||
        error.message ||
        'Có lỗi xảy ra trong quá trình xử lý'

      const errorCode = (typeof data === 'object' && data.code) || 'HTTP_ERROR'

      return Promise.reject(new ApiError(errorMessage, status, errorCode, data))
    }

    if (error.request) {
      return Promise.reject(
        new ApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.', 0, 'NETWORK_ERROR')
      )
    }

    return Promise.reject(new ApiError(error.message || 'Lỗi không xác định', 500, 'CLIENT_ERROR'))
  }
)

export const httpClient = {
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data = {}, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
  instance: axiosInstance,
}

export default httpClient


