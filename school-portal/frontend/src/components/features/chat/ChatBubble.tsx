import { useState } from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Edit2, Trash2, Reply, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'
import type { Message } from '@/types'

interface Props {
  message: Message
  isOwn: boolean
  onEdit?: (message: Message) => void
  onDelete?: (message: Message) => void
  onReply?: (message: Message) => void
  isRead?: boolean
}

export function ChatBubble({ message, isOwn, onEdit, onDelete, onReply, isRead }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const isDeleted = message.status === 'deleted'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn('flex gap-2 group', isOwn ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isOwn && (
        <Avatar src={message.sender?.avatar_url} name={message.sender?.full_name} size="sm" className="mt-auto mb-1 shrink-0" />
      )}

      <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
        {!isOwn && message.sender && (
          <span className="text-xs text-surface-500 mb-1 ml-1">{message.sender.full_name}</span>
        )}

        {/* Reply preview */}
        {message.reply_to && !isDeleted && (
          <div className={cn(
            'mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-brand-400 bg-surface-100 dark:bg-surface-800',
            isOwn && 'border-l-0 border-r-2'
          )}>
            <p className="font-medium text-brand-600 dark:text-brand-400">{message.reply_to.sender?.full_name}</p>
            <p className="text-surface-500 truncate">{message.reply_to.body ?? 'Attachment'}</p>
          </div>
        )}

        <div className="flex items-end gap-1.5">
          <div
            className={cn(
              'relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
              isOwn
                ? 'bg-brand-600 text-white rounded-br-md'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-bl-md',
              isDeleted && 'opacity-50 italic'
            )}
          >
            {isDeleted
              ? <span className="text-xs">Message deleted</span>
              : <>
                  {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}

                  {/* Attachments */}
                  {message.attachments?.map(att => (
                    <a
                      key={att.id}
                      href={att.download_url}
                      download={att.original_filename}
                      className={cn(
                        'flex items-center gap-2 mt-2 p-2 rounded-lg text-xs hover:opacity-80 transition-opacity',
                        isOwn ? 'bg-brand-700/50' : 'bg-surface-200 dark:bg-surface-700'
                      )}
                    >
                      <span>📎</span>
                      <span className="truncate max-w-32">{att.original_filename}</span>
                    </a>
                  ))}

                  {message.status === 'edited' && (
                    <span className={cn('text-xs mt-1 block', isOwn ? 'text-brand-200' : 'text-surface-400')}>edited</span>
                  )}
                </>
            }
          </div>

          {/* Context menu */}
          {!isDeleted && (
            <div className={cn('opacity-0 group-hover:opacity-100 transition-opacity flex items-center', isOwn && 'flex-row-reverse')}>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400"
                >
                  <MoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <div
                    className={cn(
                      'absolute bottom-8 z-10 bg-white dark:bg-surface-900 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800 py-1 min-w-32',
                      isOwn ? 'right-0' : 'left-0'
                    )}
                  >
                    <button onClick={() => { onReply?.(message); setShowMenu(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-surface-50 dark:hover:bg-surface-800">
                      <Reply size={12} /> Reply
                    </button>
                    {isOwn && <>
                      <button onClick={() => { onEdit?.(message); setShowMenu(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-surface-50 dark:hover:bg-surface-800">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => { onDelete?.(message); setShowMenu(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 size={12} /> Delete
                      </button>
                    </>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={cn('flex items-center gap-1 mt-0.5 px-1', isOwn && 'flex-row-reverse')}>
          <span className="text-xs text-surface-400">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {isOwn && !isDeleted && (
            isRead ? <CheckCheck size={12} className="text-brand-400" /> : <Check size={12} className="text-surface-400" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
