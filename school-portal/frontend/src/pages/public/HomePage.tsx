import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/api/public'
import { Users, GraduationCap, Trophy, Calendar, ArrowRight, BookOpen, Image, Award } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { format } from 'date-fns'

const iconMap: Record<string, React.ReactNode> = {
  users: <Users size={28} />, graduation: <GraduationCap size={28} />,
  trophy: <Trophy size={28} />, calendar: <Calendar size={28} />,
  building: <div className="text-2xl">🏫</div>, diploma: <div className="text-2xl">🎓</div>,
}

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'home'],
    queryFn:  publicApi.home,
    staleTime: 5 * 60_000,
  })

  const home       = data?.data
  const stats      = home?.stats      ?? []
  const latestNews = home?.latest_news ?? []
  const events     = home?.upcoming_events ?? []
  const info       = home?.school_info ?? {}

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-brand-950 via-brand-900 to-surface-900">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              {info.academic_year ?? '2024-2025'} Academic Year
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              {info.school_name ?? 'Maktab № 1'}
            </h1>
            <p className="text-xl text-brand-200 max-w-2xl mx-auto mb-4 font-medium italic">
              "{info.school_motto ?? 'Bilim — kuch!'}"
            </p>
            <p className="text-surface-400 max-w-xl mx-auto mb-10">
              Providing quality education since {info.school_founded ?? '1965'}. Empowering students to reach their full potential.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/portal" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-lg shadow-brand-600/30">
                Enter Portal <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 transition-all">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-surface-950" />
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              : stats.map((stat: any, i: number) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center text-center p-5 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-800 hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
                >
                  <div className="text-brand-500 mb-3">
                    {iconMap[stat.icon] ?? <span className="text-2xl">📊</span>}
                  </div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
                </motion.div>
              ))
            }
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-16 bg-surface-50 dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-surface-900 dark:text-white mb-10">Explore the Portal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { to: '/gallery',      icon: <Image size={32} />,   title: 'Gallery',      desc: 'Browse school photos and memories' },
              { to: '/library',      icon: <BookOpen size={32} />, title: 'Library',      desc: 'Access books and learning materials' },
              { to: '/certificates', icon: <Award size={32} />,    title: 'Achievements', desc: 'Celebrate student accomplishments' },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={card.to} className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition-all">
                  <div className="text-brand-500 group-hover:scale-110 transition-transform mb-4">{card.icon}</div>
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-surface-500">{card.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest news */}
      {latestNews.length > 0 && (
        <section className="py-16 bg-white dark:bg-surface-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Latest News</h2>
              <Link to="/news" className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.slice(0, 3).map((article: any, i: number) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/news/${article.slug}`} className="group block rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-lg transition-all">
                    {article.cover_url && (
                      <div className="overflow-hidden h-44">
                        <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-xs text-surface-400 mb-2">{article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : ''}</p>
                      <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-2">{article.title}</h3>
                      {article.excerpt && <p className="text-sm text-surface-500 mt-2 line-clamp-2">{article.excerpt}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
