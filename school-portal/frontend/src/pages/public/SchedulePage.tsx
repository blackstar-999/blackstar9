import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { publicApi } from '@/api/public'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { ScheduleSlot } from '@/types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const subjectColors: Record<string, string> = {
  Mathematics:      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Physics:          'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Chemistry:        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  Biology:          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  History:          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Geography:        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Literature:       'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  English:          'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  'Uzbek Language': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  'Computer Science':'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  'Physical Education':'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800',
  Art:              'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
}

const defaultColor = 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700'

export default function SchedulePage() {
  const [selectedClass, setClass] = useState('')
  const [selectedDay, setDay]     = useState(0)

  const { data: classesData } = useQuery({
    queryKey: ['schedule', 'classes'],
    queryFn:  publicApi.classes,
    staleTime: 10 * 60_000,
  })

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['schedule', selectedClass],
    queryFn:  () => publicApi.schedule(selectedClass),
    enabled:  !!selectedClass,
    staleTime: 5 * 60_000,
  })

  const classes  = classesData?.data?.classes ?? []
  const schedule = scheduleData?.data?.schedule
  const slots    = schedule?.slots ?? {}

  // Group slots by day
  const daySlots: ScheduleSlot[] = selectedDay === 0
    ? []
    : (slots[selectedDay] ?? [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <Calendar size={40} className="mx-auto text-brand-500 mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Class Schedule</h1>
        <p className="text-surface-500 mt-2">Weekly timetable for all classes</p>
      </div>

      {/* Class selector */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {classes.length === 0 && (
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-16 rounded-xl" />)}
          </div>
        )}
        {classes.map((cls: string) => (
          <button
            key={cls}
            onClick={() => { setClass(cls); setDay(1) }}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
              selectedClass === cls
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                : 'bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700'
            )}
          >
            {cls}
          </button>
        ))}
      </div>

      {selectedClass && (
        <>
          {/* Day tabs */}
          <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl mb-6 overflow-x-auto">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setDay(i + 1)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-w-[80px]',
                  selectedDay === i + 1
                    ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                )}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </button>
            ))}
          </div>

          {/* Slots */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : daySlots.length === 0 ? (
            <div className="text-center py-16 text-surface-400">
              <Clock size={36} className="mx-auto mb-3 opacity-50" />
              <p>No classes scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {daySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm',
                    subjectColors[slot.subject] ?? defaultColor
                  )}
                >
                  {/* Period number */}
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
                    <span className="font-bold text-sm">{slot.period_number}</span>
                  </div>

                  {/* Time */}
                  <div className="shrink-0 text-center min-w-[80px]">
                    <p className="text-sm font-semibold">{slot.start_time}</p>
                    <p className="text-xs opacity-70">{slot.end_time}</p>
                  </div>

                  {/* Divider */}
                  <div className="h-10 w-px bg-current opacity-20 shrink-0" />

                  {/* Subject info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{slot.subject}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs opacity-70">
                      {slot.teacher_name && <span>{slot.teacher_name}</span>}
                      {slot.room && <span>Room {slot.room}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedClass && classes.length > 0 && (
        <div className="text-center py-20 text-surface-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Select a class to view the schedule</p>
        </div>
      )}
    </div>
  )
}
