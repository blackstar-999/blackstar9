import { Outlet, NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react'
import { cn } from '@/utils/cn'

const navLinks = [
  { to: '/',            label: 'Home',    end: true },
  { to: '/news',        label: 'News' },
  { to: '/events',      label: 'Events' },
  { to: '/gallery',     label: 'Gallery' },
  { to: '/library',     label: 'Library' },
  { to: '/certificates',label: 'Achievements' },
  { to: '/schedule',    label: 'Schedule' },
  { to: '/contact',     label: 'Contact' },
]

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200/50 dark:border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">S</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-surface-900 dark:text-white leading-tight text-sm">Maktab № 1</p>
                <p className="text-xs text-surface-500">School Portal</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Login
              </Link>
              <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden p-2 text-surface-600 dark:text-surface-400">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => cn(
                      'block px-3 py-2.5 rounded-xl text-sm font-medium',
                      isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                               : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                    )}
                  >
                    {link.label}
                  </NavLink>
                ))}
                <Link to="/login" className="block px-3 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white text-center mt-2">
                  Login to Portal
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-900 dark:bg-surface-950 text-surface-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-white">Maktab № 1</span>
              </div>
              <p className="text-sm leading-relaxed">Providing quality education since 1965. Building tomorrow's leaders today.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                {navLinks.slice(0, 5).map(l => (
                  <Link key={l.to} to={l.to} className="block text-sm hover:text-white transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><MapPin size={14} /> Tashkent, Uzbekistan</div>
                <div className="flex items-center gap-2"><Phone size={14} /> +998 71 123 45 67</div>
                <div className="flex items-center gap-2"><Mail size={14} /> info@maktab1.uz</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-surface-800 text-center text-sm text-surface-500">
            © {new Date().getFullYear()} Maktab № 1. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
