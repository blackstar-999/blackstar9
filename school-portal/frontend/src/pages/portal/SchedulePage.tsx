import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import api from '@/api/client'
import { publicApi } from '@/api/public'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'
import type { ScheduleSlot } from '@/types'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Physics: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  Chemistry: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Biology: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  History: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  English: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'Uzbek Language': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'Computer Science': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  'Physical Education': 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
}
const defaultColor = 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'

const emptySlot = { day_of_week: 1, period_number: 1, start_time: '08:00', end_time: '08:45', subject: '', teacher_name: '', room: '' }

export default function PortalSchedulePage() {
  const { user } = useAuthStore()
  const [selectedClass, setClass] = useState(user?.class_name ?? '')
  const [selectedDay, setDay]     = useState(1)
  const [editingSlot, setEditing] = useState<Partial<ScheduleSlot> | null>(null)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const qc = useQueryClient()

  const canEdit = user && ['admin', 'vice_principal', 'superadmin'].includes(user.role)

  const { data: classesData } = useQuery({
    queryKey: ['schedule', 'classes'],
    queryFn:  publicApi.classes,
  })

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['schedule', selectedClass],
    queryFn:  () => publicApi.schedule(selectedClass),
    enabled:  !!selectedClass,
  })

  const schedule = scheduleData?.data?.schedule
  const slots: Record<number, ScheduleSlot[]> = schedule?.slots ?? {}
  const daySlots = slots[selectedDay] ?? []
  const classes = classesData?.data?.classes ?? []

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.put(`/schedule/${schedule?.id}/slots`, data),
    onSuccess: () => {
      toast.success('Schedule updated')
      setShowSlotModal(false)
      setEditing(null)
      qc.invalidateQueries({ queryKey: ['schedule', selectedClass] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (slotId: number) => api.delete(`/schedule/slots/${slotId}`),
    onSuccess: () => {
      toast.success('Slot deleted')
      qc.invalidateQueries({ queryKey: ['schedule', selectedClass] })
    },
  })

  const openAdd = () => {
    setEditing({ ...emptySlot, day_of_week: selectedDay })
    setShowSlotModal(true)
  }

  const openEdit = (slot: ScheduleSlot) => {
    setEditing(slot)
    setShowSlotModal(true)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Schedule</h1>
          <p className="text-surface-500 text-sm mt-0.5">Weekly class timetable</p>
        </div>
        {canEdit && selectedClass && schedule && (
          <Button onClick={openAdd} icon={<Plus size={16} />} size="sm">Add Slot</Button>
        )}
      </div>

      {/* Class selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Show user's own class first for students */}
        {user?.class_name && !classes.includes(user.class_name) && (
          <button
            onClick={() => setClass(user.class_name!)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition-all',
              selectedClass === user.class_name
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700'
            )}
          >
            {user.class_name} (My Class)
          </button>
        )}
        {classes.map((cls: string) => (
          <button
            key={cls}
            onClick={() => setClass(cls)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition-all',
              selectedClass === cls
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700'
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
                  'flex-1 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-w-[72px]',
                  selectedDay === i + 1
                    ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                )}
              >
                <span className="hidden md:inline">{day}</span>
                <span className="md:hidden">{day.slice(0, 3)}</span>
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
              <p>No classes scheduled for {DAYS[selectedDay - 1]}</p>
              {canEdit && schedule && (
                <Button variant="secondary" onClick={openAdd} className="mt-4" icon={<Plus size={14} />} size="sm">
                  Add slot
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {daySlots.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'group flex items-center gap-4 p-4 rounded-2xl border',
                    subjectColors[slot.subject] ?? defaultColor
                  )}
                >
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center font-bold text-sm">
                    {slot.period_number}
                  </div>
                  <div className="shrink-0 text-center min-w-[76px]">
                    <p className="text-sm font-semibold">{slot.start_time}</p>
                    <p className="text-xs opacity-60">{slot.end_time}</p>
                  </div>
                  <div className="h-8 w-px bg-current opacity-20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{slot.subject}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs opacity-60">
                      {slot.teacher_name && <span>{slot.teacher_name}</span>}
                      {slot.room && <span>Room {slot.room}</span>}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(slot)}
                        className="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-black/20">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(slot.id)}
                        className="p-2 rounded-lg hover:bg-red-100/50 text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedClass && (
        <div className="text-center py-20 text-surface-400">
          <p>Select a class to view the schedule</p>
        </div>
      )}

      {/* Edit/Add slot modal */}
      <Modal open={showSlotModal} onClose={() => { setShowSlotModal(false); setEditing(null) }} title={editingSlot?.id ? 'Edit Slot' : 'Add Slot'} size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400">Period</label>
              <input type="number" min={1} max={10} value={editingSlot?.period_number ?? 1}
                onChange={e => setEditing(v => ({ ...v, period_number: +e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400">Day</label>
              <select value={editingSlot?.day_of_week ?? 1}
                onChange={e => setEditing(v => ({ ...v, day_of_week: +e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500">
                {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['start_time', 'end_time'].map(field => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 capitalize">{field.replace('_', ' ')}</label>
                <input type="time" value={(editingSlot as any)?.[field] ?? ''}
                  onChange={e => setEditing(v => ({ ...v, [field]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400">Subject</label>
            <input value={editingSlot?.subject ?? ''}
              onChange={e => setEditing(v => ({ ...v, subject: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Mathematics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400">Teacher</label>
              <input value={editingSlot?.teacher_name ?? ''}
                onChange={e => setEditing(v => ({ ...v, teacher_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400">Room</label>
              <input value={editingSlot?.room ?? ''}
                onChange={e => setEditing(v => ({ ...v, room: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 text-sm bg-white dark:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 301" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => { setShowSlotModal(false); setEditing(null) }}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate(editingSlot)}
              loading={saveMutation.isPending}
              icon={<Save size={14} />}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
