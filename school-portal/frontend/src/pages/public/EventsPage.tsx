import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react'
import { publicApi } from '@/api/public'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { format, isPast, isFuture, isToday } from 'date-fns'

export default function EventsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['events', filter],
    queryFn:  () => publicApi.events(filter === 'upcoming'),
    staleTime: 2 * 60_000,
  })

  const events = data?.data?.data ?? []

  const filtered = filter === 'past'
    ? events.filter((e: any) => isPast(new Date(e.starts_at)))
    : events

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <Calendar size={40} className="mx-auto text-brand-500 mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">School Events</h1>
        <p className="text-surface-500 mt-2">Stay informed about upcoming activities</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 justify-center mb-8">
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all border',
              filter === f
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border-surface-300 dark:border-surface-700 hover:border-brand-400'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-surface-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p>No events found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event: any, i: number) => {
            const startsAt  = new Date(event.starts_at)
            const isUpcoming = isFuture(startsAt)
            const isNow      = isToday(startsAt)

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'flex gap-5 p-5 rounded-2xl border transition-all hover:shadow-md',
                  isNow
                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                    : isUpcoming
                    ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700'
                    : 'bg-surface-50 dark:bg-surface-900/50 border-surface-200 dark:border-surface-800 opacity-70'
                )}
              >
                {/* Date block */}
                <div className={cn(
                  'shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white',
                  isNow ? 'bg-brand-600' : isUpcoming ? 'bg-brand-500' : 'bg-gray-400'
                )}>
                  <span className="text-xl font-bold leading-none">{format(startsAt, 'd')}</span>
                  <span className="text-xs uppercase tracking-wide mt-0.5">{format(startsAt, 'MMM')}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-surface-900 dark:text-white">{event.title}</h3>
                    {isNow && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-medium">Today</span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-surface-500 mt-1 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {format(startsAt, 'HH:mm')}
                      {event.ends_at && ` – ${format(new Date(event.ends_at), 'HH:mm')}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
