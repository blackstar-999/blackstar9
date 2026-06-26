import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { galleryApi } from '@/api/gallery'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { GalleryItem } from '@/types'

interface Props {
  items: GalleryItem[]
  isLoading?: boolean
  canLike?: boolean
}

export function GalleryGrid({ items, isLoading, canLike }: Props) {
  const [viewer, setViewer] = useState<{ item: GalleryItem; index: number } | null>(null)
  const qc = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: (id: number) => galleryApi.like(id),
    onSuccess: (res, id) => {
      qc.setQueriesData({ queryKey: ['gallery'] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages?.map((p: any) => ({
            ...p,
            data: p.data.map((item: GalleryItem) =>
              item.id === id ? { ...item, ...res.data } : item
            ),
          })),
        }
      })
    },
  })

  const navigate = (dir: 1 | -1) => {
    if (!viewer) return
    const next = viewer.index + dir
    if (next >= 0 && next < items.length) setViewer({ item: items[next], index: next })
  }

  if (isLoading) return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className={cn('w-full rounded-xl break-inside-avoid', i % 3 === 0 ? 'h-56' : 'h-40')} />
      ))}
    </div>
  )

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, duration: 0.2 }}
            className="relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setViewer({ item, index })}
          >
            <img
              src={item.thumbnail_url ?? item.image_url}
              alt={item.caption ?? ''}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
              {item.caption && <p className="text-white text-xs font-medium line-clamp-2">{item.caption}</p>}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-white/90">
                  <Heart size={12} fill={item.is_liked ? 'currentColor' : 'none'} />
                  <span className="text-xs">{item.likes_count}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {viewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setViewer(null)}
          >
            <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2" onClick={() => setViewer(null)}>
              <X size={28} />
            </button>

            {viewer.index > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 bg-white/10 rounded-full backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); navigate(-1) }}
              >
                <ChevronLeft size={28} />
              </button>
            )}
            {viewer.index < items.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 bg-white/10 rounded-full backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); navigate(1) }}
              >
                <ChevronRight size={28} />
              </button>
            )}

            <motion.img
              key={viewer.item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={viewer.item.image_url}
              alt={viewer.item.caption ?? ''}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Bottom bar */}
            <div
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 flex items-end justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {viewer.item.caption && <p className="text-white font-medium">{viewer.item.caption}</p>}
                {viewer.item.uploaded_by && <p className="text-white/60 text-sm">{viewer.item.uploaded_by.full_name}</p>}
              </div>
              <div className="flex items-center gap-3">
                {canLike && (
                  <button
                    onClick={() => likeMutation.mutate(viewer.item.id)}
                    className={cn('flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                      viewer.item.is_liked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30')}
                  >
                    <Heart size={16} fill={viewer.item.is_liked ? 'currentColor' : 'none'} />
                    {viewer.item.likes_count}
                  </button>
                )}
                <a href={viewer.item.image_url} download className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
                  <Download size={18} />
                </a>
              </div>
            </div>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {viewer.index + 1} / {items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
