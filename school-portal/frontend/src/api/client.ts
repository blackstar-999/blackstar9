import axios, { AxiosError } from 'axios'


const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

// CSRF token injection for mutating requests
api.interceptors.request.use(async (config) => {
  const mutating = ['post', 'put', 'patch', 'delete']
  if (config.method && mutating.includes(config.method)) {
    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
    } catch {}
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    if (error.response?.status === 403 && error.response?.data?.requires_telegram_verification) {
      window.location.href = '/verify-telegram'
    }
    return Promise.reject(error)
  }
)

export default api
