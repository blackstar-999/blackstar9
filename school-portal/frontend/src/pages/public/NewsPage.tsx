import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Newspaper, Calendar, Eye } from 'lucide-react'
import { publicApi } from '@/api/public'
import { Skeleton } from '@/components/ui/Skeleton'
import { format } from 'date-fns'
import type { News } from '@/types'

export default function NewsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['news', page],
    queryFn: () => publicApi.news(page),
    placeholderData: (prev) => prev,
  })

  const articles = data?.data?.data as News[] ?? []
  const meta     = data?.data?.meta

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <Newspaper size={40} className="mx-auto text-brand-500 mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">School News</h1>
        <p className="text-surface-500 mt-2">Stay up-to-date with school announcements and events</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-28 w-40 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2 py-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {articles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/news/${article.slug}`}
                className="group flex gap-4 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all"
              >
                {article.cover_url && (
                  <div className="shrink-0 w-36 h-28 rounded-xl overflow-hidden">
                    <img src={article.cover_url} alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-3 text-xs text-surface-400 mb-2">
                    {article.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {format(new Date(article.published_at), 'MMM d, yyyy')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={11} /> {article.view_count}
                    </span>
                    {article.author && <span>by {article.author.full_name}</span>}
                  </div>
                  <h2 className="font-semibold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-surface-500 mt-1.5 line-clamp-2">{article.excerpt}</p>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs text-surface-500">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm disabled:opacity-40 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            Previous
          </button>
          <span className="px-4 py-2.5 text-sm text-surface-500">{page} / {meta.last_page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page}
            className="px-5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 text-sm disabled:opacity-40 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
