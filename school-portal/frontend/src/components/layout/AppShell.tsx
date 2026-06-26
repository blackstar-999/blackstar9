import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, Bell, User, Image, Award, BookOpen,
  Calendar, Settings, LogOut, Menu, X, ChevronDown, Shield
} from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { chatApi } from '@/api/chat'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface NavItem {
  to: string; label: string; icon: React.ReactNode; badge?: number; roles?: string[]
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()

  const { data: unreadData } = useQuery({
    queryKey: ['chat', 'unread'],
    queryFn: () => chatApi.unreadCount(),
    refetchInterval: 30_000,
    enabled: !!user,
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => { setUser(null); navigate('/login') },
  })

  const unread = unreadData?.data?.unread_count ?? 0

  const navItems: NavItem[] = [
    { to: '/portal',           label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/portal/chat',      label: 'Chat',      icon: <MessageSquare size={18} />, badge: unread },
    { to: '/portal/gallery',   label: 'Gallery',   icon: <Image size={18} /> },
    { to: '/portal/certificates', label: 'Certificates', icon: <Award size={18} /> },
    { to: '/portal/library',   label: 'Library',   icon: <BookOpen size={18} /> },
    { to: '/portal/schedule',  label: 'Schedule',  icon: <Calendar size={18} /> },
  ]

  const adminItems: NavItem[] = [
    { to: '/admin',            label: 'Admin Panel', icon: <Settings size={18} />, roles: ['admin', 'superadmin'] },
    { to: '/superadmin',       label: 'SuperAdmin',  icon: <Shield size={18} />,   roles: ['superadmin'] },
  ]

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isSuperAdmin = user?.role === 'superadmin'

  return (
    <div className="h-screen flex bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col',
          'bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800',
          'lg:relative lg:translate-x-0 lg:flex'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-200 dark:border-surface-800">
          <NavLink to="/portal" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-surface-900 dark:text-white">School Portal</span>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-surface-500">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/portal'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge ? <Badge variant="brand" className="text-xs px-1.5 py-0">{item.badge}</Badge> : null}
            </NavLink>
          ))}

          {(isAdmin || isSuperAdmin) && (
            <>
              <div className="my-3 border-t border-surface-200 dark:border-surface-800" />
              <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-surface-400">Administration</p>
              {adminItems
                .filter(i => !i.roles || (isSuperAdmin ? true : i.roles.includes(user?.role ?? '')))
                .map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-surface-200 dark:border-surface-800">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Avatar src={user?.avatar_path} name={user?.full_name} size="sm" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.full_name}</p>
                <p className="text-xs text-surface-500 truncate">{user?.role_label}</p>
              </div>
              <ChevronDown size={14} className={cn('text-surface-400 transition-transform', profileOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full mb-1 left-0 right-0 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-lg overflow-hidden"
                >
                  <NavLink to="/portal/profile" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface-50 dark:hover:bg-surface-800" onClick={() => setProfileOpen(false)}>
                    <User size={14} /> My Profile
                  </NavLink>
                  <button
                    onClick={() => logoutMutation.mutate()}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
          <button onClick={() => setSidebarOpen(true)} className="text-surface-600">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-surface-900 dark:text-white">School Portal</span>
          <NavLink to="/portal/notifications" className="relative text-surface-600">
            <Bell size={20} />
            {unread > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unread}</span>}
          </NavLink>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
