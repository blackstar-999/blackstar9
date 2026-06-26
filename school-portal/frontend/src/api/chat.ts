import api from './client'
import type { Conversation, Message, PaginatedResponse } from '@/types'

export const chatApi = {
  conversations: () => api.get<{ data: Conversation[] }>('/chat/conversations'),
  archived:      () => api.get<{ data: Conversation[] }>('/chat/conversations/archived'),
  startDirect:   (userId: number) => api.post<{ conversation: Conversation }>('/chat/conversations/direct', { user_id: userId }),
  createGroup:   (name: string, participantIds: number[]) =>
    api.post<{ conversation: Conversation }>('/chat/conversations/group', { name, participant_ids: participantIds }),
  archive:       (id: number) => api.post(`/chat/conversations/${id}/archive`),
  unarchive:     (id: number) => api.post(`/chat/conversations/${id}/unarchive`),

  messages:    (conversationId: number, page = 1) =>
    api.get<PaginatedResponse<Message>>(`/chat/conversations/${conversationId}/messages`, { params: { page } }),
  send:        (data: FormData) => api.post<{ message: Message }>('/chat/messages', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  edit:        (id: number, body: string) => api.put<{ message: Message }>(`/chat/messages/${id}`, { body }),
  delete:      (id: number) => api.delete(`/chat/messages/${id}`),
  markRead:    (conversationId: number) => api.post(`/chat/conversations/${conversationId}/read`),
  unreadCount: () => api.get<{ unread_count: number }>('/chat/unread-count'),
}
