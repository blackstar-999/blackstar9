import api from './client'
import type { GalleryItem, PaginatedResponse } from '@/types'

export const galleryApi = {
  list:     (page = 1, perPage = 24) => api.get<PaginatedResponse<GalleryItem>>('/public/gallery', { params: { page, per_page: perPage } }),
  show:     (id: number) => api.get<{ item: GalleryItem }>(`/public/gallery/${id}`),
  upload:   (form: FormData) => api.post<{ item: GalleryItem }>('/gallery', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  like:     (id: number) => api.post<{ liked: boolean; likes_count: number }>(`/gallery/${id}/like`),
  delete:   (id: number) => api.delete(`/gallery/${id}`),
  pending:  () => api.get<{ data: GalleryItem[] }>('/admin/gallery/pending'),
  approve:  (id: number) => api.post(`/admin/gallery/${id}/approve`),
  reject:   (id: number, reason: string) => api.post(`/admin/gallery/${id}/reject`, { reason }),
}
