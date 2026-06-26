import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react'
import { publicApi } from '@/api/public'
import { Skeleton } from '@/components/ui/Skeleton'
import { format } from 'date-fns'

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => publicApi.newsSlug(slug!),
    enabled: !!slug,
  })

  const article = data?.data?.news

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    )
  }

  if (!article) return (
    <div className="text-center py-20 text-surface-400">
      <p>Article not found.</p>
      <Link to="/news" className="text-brand-500 hover:underline mt-2 inline-block">← Back to news</Link>
    </div>
  )

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 transition-colors mb-8">
        <ArrowLeft size={14} /> Back to News
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400 mb-4">
        {article.published_at && (
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {format(new Date(article.published_at), 'MMMM d, yyyy')}
          </span>
        )}
        {article.author && (
          <span className="flex items-center gap-1">
            <User size={11} /> {article.author.full_name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Eye size={11} /> {article.view_count} views
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white leading-tight mb-6">
        {article.title}
      </h1>

      {article.cover_url && (
        <div className="rounded-2xl overflow-hidden mb-8">
          <img src={article.cover_url} alt={article.title} className="w-full max-h-96 object-cover" />
        </div>
      )}

      {article.tags && article.tags.length > 0 && (
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {article.tags.map((tag: string) => (
            <span key={tag} className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-medium">#{tag}</span>
          ))}
        </div>
      )}

      {/* Body */}
      <div
        className="prose prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-600 dark:prose-a:text-brand-400"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
    </article>
  )
}
