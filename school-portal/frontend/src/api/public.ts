import api from './client'
import type { News, SchoolStat } from '@/types'

export const publicApi = {
  home:    () => api.get('/public/home'),
  contact: () => api.get('/public/contact'),
  events:  (upcoming = false) => api.get('/public/events', { params: { upcoming } }),
  news:    (page = 1) => api.get('/public/news', { params: { page } }),
  newsSlug:(slug: string) => api.get(`/public/news/${slug}`),
  schedule:(className: string) => api.get(`/public/schedule/${className}`),
  classes: () => api.get('/public/schedule/classes'),
  library: (params: Record<string, unknown>) => api.get('/public/library', { params }),
  libraryAutocomplete: (q: string) => api.get('/public/library/autocomplete', { params: { q } }),
  certificates: (params: Record<string, unknown>) => api.get('/public/certificates', { params }),
}
