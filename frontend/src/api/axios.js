import axios from 'axios'

const TOKEN_KEY = 'sikawan_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  localStorage.removeItem(TOKEN_KEY)
  delete api.defaults.headers.common.Authorization
}

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setToken(null)
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    return Promise.reject(error)
  },
)

setToken(getToken())

export default api
