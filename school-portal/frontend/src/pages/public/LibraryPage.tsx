import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen, Download, FileText, ExternalLink } from 'lucide-react'
import { publicApi } from '@/api/public'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'
import type { LibraryFile } from '@/types'

export default function LibraryPage() {
  const [search, setSearch]   = useState('')
  const [className, setClass] = useState('')
  const [page, setPage]       = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['library', { search, className, page }],
    queryFn: () => publicApi.library({ search, class_name: className || undefined, page }),
    placeholderData: (prev) => prev,
  })

  const { data: autocompleteData } = useQuery({
    queryKey: ['library', 'autocomplete', search],
    queryFn: () => publicApi.libraryAutocomplete(search),
    enabled: search.length >= 2,
  })

  const files    = data?.data?.data as LibraryFile[] ?? []
  const classes  = data?.data?.classes as string[] ?? []
  const meta     = data?.data?.meta

  const mimeIcon = (mime: string) => {
    if (mime.includes('pdf'))  return '📄'
    if (mime.includes('word')) return '📝'
    if (mime.includes('sheet') || mime.includes('excel')) return '📊'
    if (mime.includes('image')) return '🖼️'
    return '📁'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <BookOpen size={40} className="mx-auto text-brand-500 mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">School Library</h1>
        <p className="text-surface-500 mt-2">Browse books, documents, and learning materials</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search books, authors, subjects..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={className}
          onChange={e => { setClass(e.target.value); setPage(1) }}
          className="px-4 py-3 rounded-2xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <FileText size={40} className="mx-auto mb-3 opacity-50" />
          <p>No files found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-800 transition-colors">
              <span className="text-3xl shrink-0">{mimeIcon(file.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-white truncate">{file.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {file.author && <span className="text-xs text-surface-400">{file.author}</span>}
                  {file.class_name && <Badge variant="brand" className="text-xs">{file.class_name}</Badge>}
                  {file.subject && <Badge className="text-xs">{file.subject}</Badge>}
                  <span className="text-xs text-surface-400">{file.file_size_human}</span>
                  {file.year && <span className="text-xs text-surface-400">{file.year}</span>}
                </div>
              </div>
              <a
                href={file.download_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
              >
                <ExternalLink size={14} /> Open
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm disabled:opacity-40 hover:bg-surface-100 dark:hover:bg-surface-800">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-surface-500">{page} / {meta.last_page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page}
            className="px-4 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm disabled:opacity-40 hover:bg-surface-100 dark:hover:bg-surface-800">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
