import api from './client'
import type { User } from '@/types'

export const authApi = {
  login:   (email: string, password: string) =>
    api.post<{ user: User; requires_telegram_verification?: boolean }>('/auth/login', { email, password }),

  logout:  () => api.post('/auth/logout'),
  me:      () => api.get<{ user: User }>('/auth/me'),

  initTelegram: () => api.post<{ token: string; expires_at: string }>('/auth/telegram/initiate'),
  verifyTelegram: (otp: string) => api.post<{ user: User }>('/auth/telegram/verify', { otp }),

  superAdminLogin: (email: string, password: string, path: string) =>
    api.post<{ user: User }>(`/${path}/login`, { email, password }),
}
