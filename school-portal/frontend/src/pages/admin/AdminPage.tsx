import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Image, BarChart2, Plus, Search, Ban, Unlock, Edit2, Shield } from 'lucide-react'
import api from '@/api/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'
import type { User } from '@/types'

type Tab = 'users' | 'gallery' | 'statistics'

const roleBadge: Record<string, 'default' | 'brand' | 'success' | 'warning' | 'danger'> = {
  student: 'default', teacher: 'brand', librarian: 'success',
  admin: 'warning', vice_principal: 'warning', superadmin: 'danger',
}

export default function AdminPage() {
  const [tab, setTab]         = useState<Tab>('users')
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('')
  const [banTarget, setBanTarget] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')
  const qc = useQueryClient()

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/statistics'),
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter],
    queryFn: () => api.get('/admin/users', { params: { search: search || undefined, role: roleFilter || undefined, per_page: 30 } }),
    enabled: tab === 'users',
  })

  const { data: pendingData } = useQuery({
    queryKey: ['admin', 'gallery', 'pending'],
    queryFn: () => api.get('/admin/gallery/pending'),
    enabled: tab === 'gallery',
  })

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => api.post(`/admin/users/${id}/ban`, { reason }),
    onSuccess: () => { toast.success('User banned'); setBanTarget(null); qc.invalidateQueries({ queryKey: ['admin', 'users'] }) },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const unbanMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/users/${id}/unban`),
    onSuccess: () => { toast.success('User unbanned'); qc.invalidateQueries({ queryKey: ['admin', 'users'] }) },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/gallery/${id}/approve`),
    onSuccess: () => { toast.success('Approved'); qc.invalidateQueries({ queryKey: ['admin', 'gallery'] }) },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => api.post(`/admin/gallery/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Rejected'); qc.invalidateQueries({ queryKey: ['admin', 'gallery'] }) },
  })

  const stats   = statsData?.data
  const users   = usersData?.data?.data as User[] ?? []
  const pending = pendingData?.data?.data ?? []

  const tabs = [
    { id: 'users',      label: 'Users',      icon: <Users size={16} /> },
    { id: 'gallery',    label: 'Gallery Moderation', icon: <Image size={16} /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart2 size={16} /> },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Panel</h1>
        <p className="text-surface-500 text-sm mt-0.5">Manage users, content, and school data</p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',    value: stats.users?.total,          color: 'text-brand-600' },
            { label: 'Active Users',   value: stats.users?.active,         color: 'text-green-600' },
            { label: 'Gallery Items',  value: stats.content?.gallery,      color: 'text-purple-600' },
            { label: 'Library Files',  value: stats.content?.library,      color: 'text-orange-600' },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value ?? '—'}</p>
              <p className="text-sm text-surface-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <select value={roleFilter} onChange={e => setRole(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none">
              <option value="">All Roles</option>
              {['student', 'teacher', 'librarian', 'admin', 'vice_principal', 'superadmin'].map(r => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {usersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                  <Avatar src={u.avatar_path} name={u.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-surface-900 dark:text-white text-sm">{u.full_name}</p>
                      {u.is_banned && <Badge variant="danger">Banned</Badge>}
                      {!u.is_telegram_verified && <Badge variant="warning">Unverified</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-surface-400">{u.email}</span>
                      <Badge variant={roleBadge[u.role] ?? 'default'} className="text-xs">{u.role_label}</Badge>
                      {u.class_name && <Badge className="text-xs">{u.class_name}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {u.is_banned ? (
                      <button onClick={() => unbanMutation.mutate(u.id)}
                        className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Unban">
                        <Unlock size={14} />
                      </button>
                    ) : (
                      <button onClick={() => setBanTarget(u)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Ban">
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gallery moderation tab */}
      {tab === 'gallery' && (
        <div>
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Pending Approval ({pending.length})</h3>
          {pending.length === 0 ? (
            <div className="text-center py-16 text-surface-400">
              <Image size={40} className="mx-auto mb-3 opacity-50" />
              <p>No photos pending review</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pending.map((item: any) => (
                <div key={item.id} className="rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800">
                  <img src={item.thumbnail_url ?? item.image_url} alt="" className="w-full h-40 object-cover" />
                  <div className="p-3">
                    {item.caption && <p className="text-xs text-surface-600 dark:text-surface-400 mb-2 line-clamp-1">{item.caption}</p>}
                    <p className="text-xs text-surface-400 mb-3">by {item.uploaded_by?.full_name}</p>
                    <div className="flex gap-2">
                      <button onClick={() => approveMutation.mutate(item.id)}
                        className="flex-1 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600">
                        Approve
                      </button>
                      <button onClick={() => rejectMutation.mutate({ id: item.id, reason: 'Does not meet guidelines' })}
                        className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistics tab */}
      {tab === 'statistics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Users by Role</h3>
            <div className="space-y-2">
              {Object.entries(stats.users?.by_role ?? {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-surface-600 dark:text-surface-400 capitalize">{role.replace('_', ' ')}</span>
                  <Badge variant={roleBadge[role] ?? 'default'}>{String(count)}</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Content Overview</h3>
            <div className="space-y-2">
              {Object.entries(stats.content ?? {}).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-surface-600 dark:text-surface-400 capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-semibold text-surface-900 dark:text-white">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ban modal */}
      <Modal open={!!banTarget} onClose={() => setBanTarget(null)} title={`Ban ${banTarget?.full_name}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">Please provide a reason for banning this user.</p>
          <textarea
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            placeholder="Ban reason..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setBanTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={banMutation.isPending}
              onClick={() => banTarget && banMutation.mutate({ id: banTarget.id, reason: banReason })}>
              Ban User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
