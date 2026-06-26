import { useState, useCallback } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, X, ImagePlus } from 'lucide-react'
import { galleryApi } from '@/api/gallery'
import { GalleryGrid } from '@/components/features/gallery/GalleryGrid'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/stores/auth.store'
import toast from 'react-hot-toast'

export default function GalleryPage() {
  const { user } = useAuthStore()
  const [showUpload, setShowUpload] = useState(false)
  const [caption, setCaption]       = useState('')
  const [preview, setPreview]       = useState<string | null>(null)
  const [file, setFile]             = useState<File | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['gallery', 'approved'],
    queryFn:  ({ pageParam = 1 }) => galleryApi.list(pageParam, 24),
    getNextPageParam: (last) => {
      const meta = last.data.meta
      return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined
    },
    initialPageParam: 1,
  })

  const uploadMutation = useMutation({
    mutationFn: (form: FormData) => galleryApi.upload(form),
    onSuccess: () => {
      toast.success('Photo submitted for review!')
      setShowUpload(false); setFile(null); setPreview(null); setCaption('')
      qc.invalidateQueries({ queryKey: ['gallery'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Upload failed'),
  })

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxSize: 5 * 1024 * 1024, multiple: false,
  })

  const handleUpload = () => {
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    if (caption) form.append('caption', caption)
    uploadMutation.mutate(form)
  }

  const allItems = data?.pages.flatMap(p => p.data.data) ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Gallery</h1>
          <p className="text-surface-500 text-sm mt-0.5">School memories and moments</p>
        </div>
        {user && (
          <Button onClick={() => setShowUpload(true)} icon={<ImagePlus size={16} />}>
            Upload Photo
          </Button>
        )}
      </div>

      <GalleryGrid items={allItems} isLoading={isLoading} canLike={!!user} />

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => { setShowUpload(false); setFile(null); setPreview(null) }} title="Upload Photo" size="md">
        <div className="space-y-4">
          {!preview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-surface-300 dark:border-surface-700 hover:border-brand-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={32} className="mx-auto text-surface-400 mb-3" />
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Drop photo here or click to browse</p>
              <p className="text-xs text-surface-400 mt-1">JPG, PNG, WebP up to 5MB</p>
            </div>
          ) : (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full rounded-2xl object-contain max-h-64" />
              <button
                onClick={() => { setFile(null); setPreview(null) }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <p className="text-xs text-surface-400">📋 Photos require admin approval before appearing in the gallery.</p>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setShowUpload(false); setFile(null); setPreview(null) }}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!file} loading={uploadMutation.isPending}>Submit for Review</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
