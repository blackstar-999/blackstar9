import { useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Heart, Search, X, Filter } from 'lucide-react'
import { publicApi } from '@/api/public'
import { galleryApi } from '@/api/gallery'
import api from '@/api/client'
import { useAuthStore } from '@/stores/auth.store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { Certificate } from '@/types'

const LEVELS = ['school', 'district', 'regional', 'national', 'international']
const levelLabel: Record<string, string> = {
  school: 'School', district: 'District', regional: 'Regional',
  national: 'National', international: 'International',
}
const levelVariant: Record<string, 'default' | 'brand' | 'success' | 'warning' | 'danger'> = {
  school: 'default', district: 'brand', regional: 'success',
  national: 'warning', international: 'danger',
}

export default function CertificatesPage() {
  const { user } = useAuthStore()
  const [search, setSearch]     = useState('')
  const [level, setLevel]       = useState('')
  const [selected, setSelected] = useState<Certificate | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['certificates', { search, level }],
    queryFn: ({ pageParam = 1 }) =>
      publicApi.certificates({ page: pageParam, search: search || undefined, level: level || undefined, per_page: 20 }),
    getNextPageParam: (last: any) => {
      const meta = last.data.meta
      return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined
    },
    initialPageParam: 1,
  })

  const likeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/certificates/${id}/like`),
    onSuccess: (res, id) => {
      qc.setQueriesData({ queryKey: ['certificates'] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            data: { ...p.data, data: p.data.data.map((c: Certificate) =>
              c.id === id ? { ...c, ...res.data } : c
            )},
          })),
        }
      })
    },
  })

  const all = data?.pages.flatMap(p => p.data.data) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <Award size={40} className="mx-auto text-brand-500 mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Student Achievements</h1>
        <p className="text-surface-500 mt-2">Celebrating excellence and dedication</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students, subjects..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setLevel('')}
            className={cn('px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap border transition-all',
              !level ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border-surface-300 dark:border-surface-700'
            )}
          >All</button>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l === level ? '' : l)}
              className={cn('px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap border transition-all',
                level === l ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border-surface-300 dark:border-surface-700'
              )}
            >{levelLabel[l]}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : all.length === 0 ? (
        <div className="text-center py-20 text-surface-400">
          <Award size={48} className="mx-auto mb-4 opacity-30" />
          <p>No certificates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {all.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer"
              onClick={() => setSelected(cert)}
            >
              <div className="relative overflow-hidden h-48">
                <img src={cert.image_url} alt={cert.full_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2">
                  <Badge variant={levelVariant[cert.level] ?? 'default'} className="text-xs shadow-sm">{cert.level_label}</Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-surface-900 dark:text-white text-sm">{cert.full_name}</p>
                <p className="text-xs text-surface-500 mt-0.5">{cert.subject} · {cert.class_name}</p>
                {cert.year && <p className="text-xs text-surface-400 mt-0.5">{cert.year}</p>}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={e => { e.stopPropagation(); user && likeMutation.mutate(cert.id) }}
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-medium transition-colors',
                      cert.is_liked ? 'text-red-500' : 'text-surface-400 hover:text-red-400'
                    )}
                  >
                    <Heart size={13} fill={cert.is_liked ? 'currentColor' : 'none'} />
                    {cert.likes_count}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load more</Button>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white dark:bg-surface-900 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/30 text-white rounded-full hover:bg-black/50">
                <X size={16} />
              </button>
              <img src={selected.image_url} alt={selected.full_name} className="w-full aspect-[3/4] object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-surface-900 dark:text-white">{selected.full_name}</p>
                    <p className="text-sm text-surface-500 mt-0.5">{selected.subject} · {selected.class_name}</p>
                  </div>
                  <Badge variant={levelVariant[selected.level] ?? 'default'}>{selected.level_label}</Badge>
                </div>
                {selected.description && <p className="text-sm text-surface-600 dark:text-surface-400 mt-3">{selected.description}</p>}
                {selected.year && <p className="text-xs text-surface-400 mt-2">Year: {selected.year}</p>}
                <button
                  onClick={() => user && likeMutation.mutate(selected.id)}
                  className={cn(
                    'mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all w-full justify-center',
                    selected.is_liked ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                  )}
                >
                  <Heart size={16} fill={selected.is_liked ? 'currentColor' : 'none'} />
                  {selected.likes_count} {selected.likes_count === 1 ? 'Like' : 'Likes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
