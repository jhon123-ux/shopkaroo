import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Add admin auth header to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('skr_admin_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

export const bannerAPI = {
  getAll: () => api.get('/api/banners'),
  getAllAdmin: () => api.get('/api/banners?all=true'),
  // @ts-ignore
  create: (data: Partial<any>) => api.post('/api/banners', data),
  // @ts-ignore
  update: (id: string, data: Partial<any>) => api.patch(`/api/banners/${id}`, data),
  delete: (id: string) => api.delete(`/api/banners/${id}`),
  toggle: (id: string) => api.patch(`/api/banners/${id}/toggle`),
  uploadImage: (formData: FormData) => 
    api.post('/api/upload/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  reorder: (banners: { id: string, sort_order: number }[]) => 
    api.patch('/api/banners/reorder', { banners })
}

export default api
