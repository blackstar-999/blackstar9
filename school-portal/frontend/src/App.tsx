import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Skeleton } from '@/components/ui/Skeleton'

// ── Public pages ──────────────────────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/public/HomePage'))
const NewsPage           = lazy(() => import('@/pages/public/NewsPage'))
const NewsDetailPage     = lazy(() => import('@/pages/public/NewsDetailPage'))
const EventsPage         = lazy(() => import('@/pages/public/EventsPage'))
const CertificatesPage   = lazy(() => import('@/pages/public/CertificatesPage'))
const PublicGalleryPage  = lazy(() => import('@/pages/public/GalleryPage'))
const LibraryPage        = lazy(() => import('@/pages/public/LibraryPage'))
const SchedulePage       = lazy(() => import('@/pages/public/SchedulePage'))
const ContactPage        = lazy(() => import('@/pages/public/ContactPage'))

// ── Auth pages ────────────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('@/pages/LoginPage'))
const TelegramVerifyPage = lazy(() => import('@/pages/TelegramVerifyPage'))

// ── Portal pages ──────────────────────────────────────────────────────────────
const DashboardPage      = lazy(() => import('@/pages/portal/DashboardPage'))
const ChatPage           = lazy(() => import('@/pages/portal/ChatPage'))
const PortalGalleryPage  = lazy(() => import('@/pages/portal/GalleryPage'))
const PortalCertsPage    = lazy(() => import('@/pages/public/CertificatesPage'))
const PortalLibraryPage  = lazy(() => import('@/pages/portal/LibraryPage'))
const PortalSchedulePage = lazy(() => import('@/pages/portal/SchedulePage'))
const ProfilePage        = lazy(() => import('@/pages/portal/ProfilePage'))

// ── Admin / SuperAdmin ────────────────────────────────────────────────────────
const AdminPage          = lazy(() => import('@/pages/admin/AdminPage'))
const SuperAdminPage     = lazy(() => import('@/pages/superadmin/SuperAdminPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 2 * 60_000, refetchOnWindowFocus: false },
  },
})

function PageLoader() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public website ─────────────────────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path="/"               element={<HomePage />} />
              <Route path="/news"           element={<NewsPage />} />
              <Route path="/news/:slug"     element={<NewsDetailPage />} />
              <Route path="/events"         element={<EventsPage />} />
              <Route path="/gallery"        element={<PublicGalleryPage />} />
              <Route path="/certificates"   element={<CertificatesPage />} />
              <Route path="/library"        element={<LibraryPage />} />
              <Route path="/schedule"       element={<SchedulePage />} />
              <Route path="/contact"        element={<ContactPage />} />
            </Route>

            {/* ── Auth ────────────────────────────────────────────────────── */}
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/verify-telegram"  element={<TelegramVerifyPage />} />

            {/* ── Portal (authenticated + telegram verified) ─────────────── */}
            <Route element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }>
              <Route path="/portal"               element={<DashboardPage />} />
              <Route path="/portal/chat"          element={<ChatPage />} />
              <Route path="/portal/gallery"       element={<PortalGalleryPage />} />
              <Route path="/portal/certificates"  element={<PortalCertsPage />} />
              <Route path="/portal/library"       element={<PortalLibraryPage />} />
              <Route path="/portal/schedule"      element={<PortalSchedulePage />} />
              <Route path="/portal/profile"       element={<ProfilePage />} />

              {/* ── Admin ─────────────────────────────────────────────────── */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin', 'vice_principal', 'superadmin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />

              {/* ── SuperAdmin ────────────────────────────────────────────── */}
              <Route path="/superadmin" element={
                <ProtectedRoute roles={['superadmin']}>
                  <SuperAdminPage />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
