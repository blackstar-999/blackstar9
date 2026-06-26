import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { Send, Paperclip, Smile, X, Search, Plus, Archive, MoreVertical } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { chatApi } from '@/api/chat'
import { useChatStore } from '@/stores/chat.store'
import { useConversationChannel } from '@/hooks/useEcho'
import { useAuthStore } from '@/stores/auth.store'
import { ChatBubble } from '@/components/features/chat/ChatBubble'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { format, isToday, isYesterday } from 'date-fns'
import type { Conversation, Message } from '@/types'

function formatConvTime(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const {
    conversations, setConversations,
    activeConversationId, setActiveConversation,
    messages, setMessages, prependMessages, appendMessage,
  } = useChatStore()

  const [body, setBody]             = useState('')
  const [showEmoji, setShowEmoji]   = useState(false)
  const [replyTo, setReplyTo]       = useState<Message | null>(null)
  const [editMsg, setEditMsg]       = useState<Message | null>(null)
  const [search, setSearch]         = useState('')
  const [files, setFiles]           = useState<File[]>([])
  const messagesEndRef               = useRef<HTMLDivElement>(null)
  const fileInputRef                 = useRef<HTMLInputElement>(null)
  const qc                           = useQueryClient()

  // Subscribe to active conversation's WebSocket channel
  useConversationChannel(activeConversationId)

  // Load conversations
  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: chatApi.conversations,
  })

  useEffect(() => {
    if (convsData?.data?.data) setConversations(convsData.data.data)
  }, [convsData])

  // Load messages for active conversation
  const { data: msgsData, isLoading: msgsLoading } = useQuery({
    queryKey: ['chat', 'messages', activeConversationId],
    queryFn:  () => chatApi.messages(activeConversationId!),
    enabled:  !!activeConversationId,
  })

  useEffect(() => {
    if (msgsData?.data?.data && activeConversationId) {
      setMessages(activeConversationId, msgsData.data.data)
      chatApi.markRead(activeConversationId)
    }
  }, [msgsData, activeConversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[activeConversationId ?? 0]?.length])

  // Send message
  const sendMutation = useMutation({
    mutationFn: (form: FormData) => chatApi.send(form),
    onSuccess: (res) => {
      appendMessage(res.data.message)
      setBody(''); setReplyTo(null); setFiles([])
    },
  })

  // Edit message
  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => chatApi.edit(id, body),
    onSuccess: () => { setEditMsg(null); setBody('') },
  })

  // Delete message
  const deleteMutation = useMutation({
    mutationFn: (id: number) => chatApi.delete(id),
  })

  // Archive conversation
  const archiveMutation = useMutation({
    mutationFn: (id: number) => chatApi.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
  })

  const handleSend = () => {
    if (!activeConversationId) return
    const trimmed = body.trim()
    if (!trimmed && files.length === 0) return

    if (editMsg) {
      if (trimmed) editMutation.mutate({ id: editMsg.id, body: trimmed })
      return
    }

    const form = new FormData()
    form.append('conversation_id', String(activeConversationId))
    if (trimmed) form.append('body', trimmed)
    if (replyTo) form.append('reply_to_id', String(replyTo.id))
    files.forEach(f => form.append('attachments[]', f))
    sendMutation.mutate(form)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const activeConv = conversations.find(c => c.id === activeConversationId)
  const convMessages = activeConversationId ? (messages[activeConversationId] ?? []) : []
  const filtered = conversations.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))

  const otherParticipant = (conv: Conversation) =>
    conv.type === 'direct' ? conv.participants?.find(p => p.id !== user?.id) : null

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen overflow-hidden bg-white dark:bg-surface-950">
      {/* Conversations sidebar */}
      <div className={cn(
        'w-full lg:w-80 flex-shrink-0 flex flex-col border-r border-surface-200 dark:border-surface-800',
        activeConversationId && 'hidden lg:flex'
      )}>
        {/* Search header */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-surface-900 dark:text-white">Messages</h2>
            <button className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))
            : filtered.map(conv => {
                const other = otherParticipant(conv)
                const isActive = conv.id === activeConversationId
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      isActive ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-900'
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar src={other ? null : conv.avatar} name={conv.name ?? other?.full_name} size="md" />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn('text-sm truncate', conv.unread_count ? 'font-semibold text-surface-900 dark:text-white' : 'font-medium text-surface-700 dark:text-surface-300')}>
                          {conv.name ?? other?.full_name ?? 'Conversation'}
                        </p>
                        {conv.last_activity_at && (
                          <span className="text-xs text-surface-400 shrink-0 ml-2">{formatConvTime(conv.last_activity_at)}</span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-xs text-surface-400 truncate mt-0.5">
                          {conv.last_message.sender_id === user?.id ? 'You: ' : ''}
                          {conv.last_message.body ?? 'Attachment'}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
          }
        </div>
      </div>

      {/* Chat area */}
      <div className={cn('flex-1 flex flex-col', !activeConversationId && 'hidden lg:flex')}>
        {activeConversationId && activeConv ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
              <button onClick={() => setActiveConversation(null)} className="lg:hidden text-surface-500 mr-1">←</button>
              <Avatar
                src={otherParticipant(activeConv) ? null : activeConv.avatar}
                name={activeConv.name ?? otherParticipant(activeConv)?.full_name}
                size="sm"
              />
              <div className="flex-1">
                <p className="font-semibold text-surface-900 dark:text-white text-sm">
                  {activeConv.name ?? otherParticipant(activeConv)?.full_name ?? 'Chat'}
                </p>
                {activeConv.type === 'group' && (
                  <p className="text-xs text-surface-400">{activeConv.participants?.length ?? 0} members</p>
                )}
              </div>
              <button
                onClick={() => archiveMutation.mutate(activeConversationId)}
                className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
                title="Archive conversation"
              >
                <Archive size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {msgsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'flex-row' : 'flex-row-reverse')}>
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className={cn('h-16 rounded-2xl', i % 3 === 0 ? 'w-64' : 'w-48')} />
                    </div>
                  ))
                : convMessages.map(msg => (
                    <ChatBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.sender_id === user?.id}
                      onEdit={m => { setEditMsg(m); setBody(m.body ?? '') }}
                      onDelete={m => deleteMutation.mutate(m.id)}
                      onReply={m => setReplyTo(m)}
                    />
                  ))
              }
              <div ref={messagesEndRef} />
            </div>

            {/* Compose area */}
            <div className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
              {/* Reply / edit banner */}
              <AnimatePresence>
                {(replyTo || editMsg) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 border-b border-brand-100 dark:border-brand-900"
                  >
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-brand-600 dark:text-brand-400">{editMsg ? 'Editing message' : `Replying to ${replyTo?.sender?.full_name}`}</p>
                      <p className="text-surface-500 truncate">{(editMsg ?? replyTo)?.body ?? 'Attachment'}</p>
                    </div>
                    <button onClick={() => { setReplyTo(null); setEditMsg(null); setBody('') }} className="text-surface-400 hover:text-surface-600">
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File previews */}
              {files.length > 0 && (
                <div className="flex gap-2 px-4 py-2 overflow-x-auto">
                  {files.map((f, i) => (
                    <div key={i} className="relative shrink-0 flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-lg px-3 py-2 text-xs">
                      <span className="truncate max-w-24">{f.name}</span>
                      <button onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} className="text-surface-400">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 p-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                >
                  <Paperclip size={18} />
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={e => setFiles(Array.from(e.target.files ?? []))} />

                <div className="relative flex-1">
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={editMsg ? 'Edit message...' : 'Write a message...'}
                    rows={1}
                    className="w-full resize-none rounded-2xl bg-surface-100 dark:bg-surface-800 px-4 py-2.5 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32 overflow-y-auto"
                    style={{ height: 'auto' }}
                    onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowEmoji(v => !v)}
                    className="p-2.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                  >
                    <Smile size={18} />
                  </button>
                  {showEmoji && (
                    <div className="absolute bottom-12 right-0 z-20">
                      <EmojiPicker
                        onEmojiClick={e => { setBody(b => b + e.emoji); setShowEmoji(false) }}
                        height={350}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || editMutation.isPending || (!body.trim() && files.length === 0)}
                  className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-20 w-20 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <Send size={32} className="text-surface-400" />
            </div>
            <h3 className="font-semibold text-surface-900 dark:text-white">Select a conversation</h3>
            <p className="text-surface-400 text-sm mt-1">Choose a conversation from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
