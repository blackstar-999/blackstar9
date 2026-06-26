import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, Settings, HardDrive, ClipboardList, TrendingUp } from 'lucide-react'
import api from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'

type Tab = 'analytics' | 'audit' | 'settings' | 'storage'

export default function SuperAdminPage() {
  const [tab, setTab] = useState<Tab>('analytics')

  const { data: analyticsData } = useQuery({
    queryKey: ['superadmin', 'analytics'],
    queryFn: () => api.get('/superadmin/analytics', { params: { days: 30 } }),
    enabled: tab === 'analytics',
  })

  const { data: auditData } = useQuery({
    queryKey: ['superadmin', 'audit'],
    queryFn: () => api.get('/superadmin/audit-logs', { params: { per_page: 50 } }),
    enabled: tab === 'audit',
  })

  const { data: settingsData } = useQuery({
    queryKey: ['superadmin', 'settings'],
    queryFn: () => api.get('/superadmin/settings'),
    enabled: tab === 'settings',
  })

  const { data: storageData } = useQuery({
    queryKey: ['superadmin', 'storage'],
    queryFn: () => api.get('/superadmin/storage'),
    enabled: tab === 'storage',
  })

  const analytics = analyticsData?.data
  const audit     = auditData?.data
  const settings  = settingsData?.data?.settings ?? {}
  const storage   = storageData?.data

  const tabs = [
    { id: 'analytics', label: 'Analytics',  icon: <TrendingUp size={15} /> },
    { id: 'audit',     label: 'Audit Logs', icon: <ClipboardList size={15} /> },
    { id: 'settings',  label: 'Settings',   icon: <Settings size={15} /> },
    { id: 'storage',   label: 'Storage',    icon: <HardDrive size={15} /> },
  ]

  const actionBadge: Record<string, 'default' | 'brand' | 'success' | 'warning' | 'danger'> = {
    created: 'success', updated: 'brand', deleted: 'danger',
    login: 'default', logout: 'default', role_changed: 'warning',
    setting_changed: 'warning', downloaded: 'default', uploaded: 'success',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-brand-600 flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">SuperAdmin</h1>
          <p className="text-surface-500 text-sm">Full system control and analytics</p>
        </div>
      </div>

      {/* Key metrics */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users',        value: analytics.total_users,     color: 'bg-brand-500' },
            { label: 'Active (7d)',         value: analytics.active_users_7d, color: 'bg-green-500' },
            { label: 'Banned Users',        value: analytics.banned_users,    color: 'bg-red-500' },
            { label: 'Storage Used',        value: storage?.total_human,      color: 'bg-purple-500' },
          ].map((m, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
              <div className={cn('h-1.5 w-12 rounded-full mb-3', m.color)} />
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{m.value ?? '—'}</p>
              <p className="text-xs text-surface-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl mb-6 w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              tab === t.id
                ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {tab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">User Growth (30d)</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {analytics.user_growth?.map((d: any) => (
                <div key={d.date} className="flex items-center justify-between text-sm py-1">
                  <span className="text-surface-500">{format(new Date(d.date), 'MMM d')}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${Math.max(4, d.count * 8)}px` }} />
                    <span className="font-medium text-surface-900 dark:text-white w-6 text-right">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Message Volume (30d)</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {analytics.message_volume?.map((d: any) => (
                <div key={d.date} className="flex items-center justify-between text-sm py-1">
                  <span className="text-surface-500">{format(new Date(d.date), 'MMM d')}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `${Math.max(4, Math.min(d.count, 100))}px` }} />
                    <span className="font-medium text-surface-900 dark:text-white w-8 text-right">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {tab === 'audit' && (
        <div className="space-y-2">
          {!audit ? (
            Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)
          ) : (
            audit.data?.map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-sm">
                <div className="shrink-0">
                  <Badge variant={actionBadge[log.action] ?? 'default'} className="text-xs">{log.action}</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-surface-700 dark:text-surface-300 truncate">
                    <span className="font-medium text-surface-900 dark:text-white">
                      {log.user?.first_name} {log.user?.last_name}
                    </span>
                    {' · '}{log.auditable_type?.split('\\').pop()}
                    {log.auditable_id && <span className="text-surface-400"> #{log.auditable_id}</span>}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">{log.ip_address} · {log.url}</p>
                </div>
                <span className="text-xs text-surface-400 shrink-0">
                  {format(new Date(log.created_at), 'MMM d, HH:mm')}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="space-y-6">
          {Object.entries(settings).map(([group, groupSettings]: [string, any]) => (
            <div key={group} className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
              <h3 className="font-semibold text-surface-900 dark:text-white capitalize mb-4">{group} Settings</h3>
              <div className="space-y-3">
                {groupSettings.map((s: any) => (
                  <div key={s.key} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{s.description ?? s.key}</p>
                      <p className="text-xs text-surface-400">{s.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-surface-900 dark:text-white font-mono bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{s.value}</span>
                      {s.is_public && <Badge variant="success" className="text-xs">Public</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage */}
      {tab === 'storage' && storage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(storage.breakdown ?? {}).map(([disk, data]: [string, any]) => {
            const totalBytes = data.public_size + data.private_size
            const maxDisplay = 100 * 1024 * 1024 // 100MB display max
            const pct = Math.min((totalBytes / maxDisplay) * 100, 100)
            return (
              <div key={disk} className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-surface-900 dark:text-white capitalize">{disk}</span>
                  <span className="text-xs text-surface-400">{data.total_files} files</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 mb-2">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-surface-400">
                  <span>Public: {(data.public_size / 1048576).toFixed(1)}MB</span>
                  <span>Private: {(data.private_size / 1048576).toFixed(1)}MB</span>
                </div>
              </div>
            )
          })}
          <div className="md:col-span-2 p-5 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
            <p className="font-semibold text-brand-700 dark:text-brand-300">Total Storage Used</p>
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mt-1">{storage.total_human}</p>
          </div>
        </div>
      )}
    </div>
  )
}
