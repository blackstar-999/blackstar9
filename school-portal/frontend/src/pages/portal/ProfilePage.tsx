import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Lock, Bell, Send } from 'lucide-react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const [activeTab, setTab] = useState<'profile' | 'password' | 'notifications'>('profile')
  const [form, setForm]     = useState({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', phone: user?.phone ?? '', bio: user?.bio ?? '' })
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (res) => { setUser(res.data.user); toast.success('Profile updated!') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Update failed'),
  })

  const pwMutation = useMutation({
    mutationFn: (data: object) => api.post('/profile/change-password', data),
    onSuccess: () => { toast.success('Password changed!'); setPwForm({ current_password: '', password: '', password_confirmation: '' }) },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/profile/notifications'),
    enabled: activeTab === 'notifications',
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/profile/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    updateMutation.mutate(fd)
  }

  const handleAvatarChange = (file: File) => {
    const fd = new FormData()
    fd.append('avatar', file)
    updateMutation.mutate(fd)
  }

  const notifications = notifData?.data?.data?.data ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-8 p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
        <div className="relative">
          <Avatar src={user?.avatar_path} name={user?.full_name} size="xl" />
          <label className="absolute -bottom-1 -right-1 h-7 w-7 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors">
            <Camera size={12} className="text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarChange(e.target.files[0])} />
          </label>
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-white">{user?.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="brand">{user?.role_label}</Badge>
            {user?.class_name && <Badge>{user.class_name}</Badge>}
            {user?.is_telegram_verified
              ? <Badge variant="success">✓ Telegram</Badge>
              : <Badge variant="warning">Telegram not linked</Badge>
            }
          </div>
          <p className="text-sm text-surface-400 mt-1">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl mb-6 w-fit">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'password', label: 'Password', icon: <Lock size={13} /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell size={13} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'first_name', label: 'First Name' },
              { key: 'last_name',  label: 'Last Name' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Phone</label>
            <input value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(v => ({ ...v, bio: e.target.value }))} rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <Button type="submit" loading={updateMutation.isPending}>Save Changes</Button>
        </form>
      )}

      {/* Password form */}
      {activeTab === 'password' && (
        <form onSubmit={e => { e.preventDefault(); pwMutation.mutate(pwForm) }}
          className="space-y-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          {[
            { key: 'current_password', label: 'Current Password' },
            { key: 'password',         label: 'New Password' },
            { key: 'password_confirmation', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{f.label}</label>
              <input type="password" value={pwForm[f.key as keyof typeof pwForm]}
                onChange={e => setPwForm(v => ({ ...v, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          ))}
          <Button type="submit" loading={pwMutation.isPending}>Change Password</Button>
        </form>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-surface-400">
              <Bell size={36} className="mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n: any) => (
              <div key={n.id} onClick={() => !n.read_at && markReadMutation.mutate(n.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-colors ${
                  n.read_at ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800'
                            : 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                }`}>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 shrink-0">
                    {n.data.type === 'new_message' ? <Send size={14} /> : <Bell size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-900 dark:text-white">{n.data.message ?? n.data.body_preview ?? 'New notification'}</p>
                    <p className="text-xs text-surface-400 mt-1">{n.created_at}</p>
                  </div>
                  {!n.read_at && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
