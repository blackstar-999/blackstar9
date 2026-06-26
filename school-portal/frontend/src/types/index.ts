export type Role = 'guest' | 'student' | 'teacher' | 'librarian' | 'admin' | 'vice_principal' | 'superadmin'

export interface User {
  id: number; first_name: string; last_name: string; full_name: string
  email: string; role: Role; role_label: string; phone: string | null
  class_name: string | null; avatar_path: string | null; bio: string | null
  telegram_username: string | null; is_telegram_verified: boolean
  is_active: boolean; is_banned: boolean; last_seen_at: string | null; created_at: string
}
export interface MessageAttachment {
  id: number; original_filename: string; mime_type: string
  file_size: number; type: 'file' | 'image' | 'video'; download_url: string
}
export interface Message {
  id: number; conversation_id: number; sender_id: number
  sender: { id: number; full_name: string; avatar_url: string | null } | null
  reply_to: { id: number; body: string | null; sender: { full_name: string } | null } | null
  body: string | null; status: 'sent' | 'edited' | 'deleted'
  edited_at: string | null; attachments: MessageAttachment[]; created_at: string
}
export interface Conversation {
  id: number; type: 'direct' | 'group'; name: string | null; avatar: string | null
  participants: { id: number; full_name: string; role: string }[] | null
  last_message: { id: number; body: string | null; sender_id: number; created_at: string } | null
  unread_count: number; is_archived: boolean; last_activity_at: string | null
}
export interface GalleryItem {
  id: number; image_url: string; thumbnail_url: string | null
  caption: string | null; album_name: string | null; status: 'pending' | 'approved' | 'rejected'
  likes_count: number; is_liked: boolean
  uploaded_by: { id: number; full_name: string } | null; created_at: string
}
export interface Certificate {
  id: number; first_name: string; last_name: string; full_name: string
  class_name: string; subject: string; level: string; level_label: string
  image_url: string; description: string | null; year: number | null
  likes_count: number; is_liked: boolean; created_at: string
}
export interface LibraryFile {
  id: number; title: string; original_filename: string; mime_type: string
  file_size: number; file_size_human: string; author: string | null
  description: string | null; class_name: string | null; subject: string | null
  year: number | null; download_count: number; download_url: string; created_at: string
}
export interface ScheduleSlot {
  id: number; day_of_week: number; period_number: number
  start_time: string; end_time: string; subject: string
  teacher_name: string | null; room: string | null
}
export interface News {
  id: number; title: string; slug: string; excerpt: string | null; body: string
  cover_url: string | null; status: string; published_at: string | null
  view_count: number; tags: string[] | null
  author: { id: number; full_name: string } | null; created_at: string
}
export interface SchoolStat {
  id: number; key: string; label: string; value: string; unit: string | null; icon: string | null
}
export interface PaginatedResponse<T> {
  data: T[]; meta: { current_page: number; last_page: number; total: number }
}
export interface ApiError { message: string; errors?: Record<string, string[]> }
