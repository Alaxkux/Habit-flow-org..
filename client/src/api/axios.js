import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

if (!BASE_URL) {
  console.error("❌ VITE_API_URL is missing in environment variables")
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// 🔐 Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hf_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 🚨 Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hf_token')
      localStorage.removeItem('hf_user')
      window.location.href = '/auth'
    }

    return Promise.reject(err)
  }
)

export default api