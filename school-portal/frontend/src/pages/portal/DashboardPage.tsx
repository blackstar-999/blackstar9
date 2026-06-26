import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageSquare, Image, Award, BookOpen, Bell, Calendar, ArrowRight, Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { chatApi } from '@/api/chat'
import api from '@/api/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDistanceToNow, format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: unreadData } = useQuery({
    queryKey: ['chat', 'unread'],
    queryFn: chatApi.unreadCount,
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => api.get('/profile/notifications', { params: { per_page: 5 } }),
  })

  const { data: convsData } = useQuery({
    queryKey: ['chat', 'conversations', 'recent'],
    queryFn: chatApi.conversations,
  })

  const unread        = unreadData?.data?.unread_count ?? 0
  const notifications = notifData?.data?.data?.data ?? []
  const conversations = convsData?.data?.data?.slice(0, 4) ?? []

  const quickLinks = [
    { to: '/portal/chat',         icon: <MessageSquare size={22} />, label: 'Messages',    badge: unread,  color: 'from-blue-500 to-brand-600' },
    { to: '/portal/gallery',      icon: <Image size={22} />,         label: 'Gallery',     color: 'from-purple-500 to-pink-600' },
    { to: '/portal/certificates', icon: <Award size={22} />,          label: 'Achievements',color: 'from-amber-500 to-orange-600' },
    { to: '/portal/library',      icon: <BookOpen size={22} />,       label: 'Library',     color: 'from-green-500 to-emerald-600' },
    { to: '/portal/schedule',     icon: <Calendar size={22} />,       label: 'Schedule',    color: 'from-teal-500 to-cyan-600' },
    { to: '/portal/profile',      icon: <Bell size={22} />,           label: 'Notifications', color: 'from-rose-500 to-red-600' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/20"
      >
        <Avatar src={user?.avatar_path} name={user?.full_name} size="lg" className="border-2 border-white/30" />
        <div>
          <p className="text-brand-100 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-white/20 text-white border-0 text-xs">{user?.role_label}</Badge>
            {user?.class_name && <Badge className="bg-white/20 text-white border-0 text-xs">{user.class_name}</Badge>}
          </div>
        </div>
      </motion.div>

      {/* Quick links */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {quickLinks.map((link, i) => (
          <motion.div key={link.to} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Link
              to={link.to}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all text-center"
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform relative`}>
                {link.icon}
                {link.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{link.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent conversations */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-800">
            <h2 className="font-semibold text-surface-900 dark:text-white">Recent Messages</h2>
            <Link to="/portal/chat" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-surface-400 text-sm">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
                No conversations yet
              </div>
            ) : conversations.map((conv: any) => {
              const other = conv.type === 'direct'
                ? conv.participants?.find((p: any) => p.id !== user?.id)
                : null
              return (
                <Link key={conv.id} to="/portal/chat"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 text-sm font-semibold">
                    {(conv.name ?? other?.full_name ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                      {conv.name ?? other?.full_name ?? 'Chat'}
                    </p>
                    {conv.last_message && (
                      <p className="text-xs text-surface-400 truncate">{conv.last_message.body ?? 'Attachment'}</p>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="h-5 w-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-800">
            <h2 className="font-semibold text-surface-900 dark:text-white">Notifications</h2>
            <Link to="/portal/profile" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-surface-400 text-sm">
                <Bell size={28} className="mx-auto mb-2 opacity-40" />
                No notifications
              </div>
            ) : notifications.map((n: any) => (
              <div key={n.id} className={`px-5 py-3.5 flex items-start gap-3 ${!n.read_at ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}>
                <div className="h-8 w-8 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                  <Bell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-700 dark:text-surface-300 line-clamp-2">
                    {n.data?.message ?? n.data?.body_preview ?? 'New notification'}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.read_at && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
