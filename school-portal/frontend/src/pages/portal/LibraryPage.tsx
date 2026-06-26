import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { BookOpen, Upload, Search, ExternalLink, FileText, Trash2, X } from 'lucide-react'
import api from '@/api/client'
import { publicApi } from '@/api/public'
import { useAuthStore } from '@/stores/auth.store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import type { LibraryFile } from '@/types'

const mimeIcon = (mime: string) => {
  if (mime.includes('pdf'))   return '📄'
  if (mime.includes('word'))  return '📝'
  if (mime.includes('sheet')) return '📊'
  if (mime.includes('image')) return '🖼️'
  return '📁'
}

export default function PortalLibraryPage() {
  const { user } = useAuthStore()
  const [search, setSearch]   = useState('')
  const [className, setClass] = useState(user?.class_name ?? '')
  const [page, setPage]       = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [file, setFile]       = useState<File | null>(null)
  const [form, setForm]       = useState({ title: '', author: '', description: '', class_name: '', subject: '', year: '' })
  const qc = useQueryClient()

  const canUpload = user && ['librarian', 'admin', 'vice_principal', 'superadmin'].includes(user.role)
  const canDelete = user && ['librarian', 'admin', 'superadmin'].includes(user.role)

  const { data, isLoading } = useQuery({
    queryKey: ['portal-library', { search, className, page }],
    queryFn: () => publicApi.library({ search: search || undefined, class_name: className || undefined, page }),
    placeholderData: (prev) => prev,
  })

  const uploadMutation = useMutation({
    mutationFn: (fd: FormData) => api.post('/library', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      toast.success('File uploaded successfully')
      setShowUpload(false); setFile(null); setForm({ title: '', author: '', description: '', class_name: '', subject: '', year: '' })
      qc.invalidateQueries({ queryKey: ['portal-library'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Upload failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/library/${id}`),
    onSuccess: () => { toast.success('File deleted'); qc.invalidateQueries({ queryKey: ['portal-library'] }) },
  })

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (f) { setFile(f); if (!form.title) setForm(v => ({ ...v, title: f.name.replace(/\.[^.]+$/, '') })) }
  }, [form.title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  })

  const handleUpload = () => {
    if (!file || !form.title) return toast.error('Title and file are required')
    const fd = new FormData()
    fd.append('file', file)
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    uploadMutation.mutate(fd)
  }

  const files    = data?.data?.data as LibraryFile[] ?? []
  const classes  = data?.data?.classes as string[] ?? []
  const meta     = data?.data?.meta

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Library</h1>
          <p className="text-surface-500 text-sm mt-0.5">Books, documents and learning resources</p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUpload(true)} icon={<Upload size={16} />} size="sm">Upload File</Button>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search books, authors, subjects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={className} onChange={e => { setClass(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-2xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none">
          <option value="">All Classes</option>
          {classes.map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>No files found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
            >
              <span className="text-3xl shrink-0">{mimeIcon(file.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-white truncate">{file.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {file.author && <span className="text-xs text-surface-400">{file.author}</span>}
                  {file.class_name && <Badge variant="brand" className="text-xs">{file.class_name}</Badge>}
                  {file.subject && <Badge className="text-xs">{file.subject}</Badge>}
                  <span className="text-xs text-surface-400">{file.file_size_human}</span>
                  <span className="text-xs text-surface-400">{file.download_count} downloads</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canDelete && (
                  <button
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <a href={file.download_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">
                  <ExternalLink size={14} /> Open
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-surface-500">{page} / {meta.last_page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page}
            className="px-4 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            Next
          </button>
        </div>
      )}

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload File" size="md">
        <div className="space-y-4">
          {!file ? (
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-surface-300 dark:border-surface-700 hover:border-brand-400'
              }`}>
              <input {...getInputProps()} />
              <Upload size={32} className="mx-auto text-surface-400 mb-3" />
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Drop file here or click to browse</p>
              <p className="text-xs text-surface-400 mt-1">PDF, Word, Excel, PowerPoint, Images up to 50MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <FileText size={20} className="text-brand-500 shrink-0" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-surface-400 hover:text-surface-600"><X size={14} /></button>
            </div>
          )}

          <input value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
            placeholder="Title *"
            className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={form.author} onChange={e => setForm(v => ({ ...v, author: e.target.value }))}
            placeholder="Author (optional)"
            className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="grid grid-cols-3 gap-3">
            <input value={form.class_name} onChange={e => setForm(v => ({ ...v, class_name: e.target.value }))}
              placeholder="Class"
              className="px-3 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <input value={form.subject} onChange={e => setForm(v => ({ ...v, subject: e.target.value }))}
              placeholder="Subject"
              className="px-3 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <input type="number" value={form.year} onChange={e => setForm(v => ({ ...v, year: e.target.value }))}
              placeholder="Year"
              className="px-3 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <textarea value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
            rows={2} placeholder="Description (optional)"
            className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploadMutation.isPending} disabled={!file || !form.title}>Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
