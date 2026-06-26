import { useEffect, useRef } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { useChatStore } from '@/stores/chat.store'
import type { Message } from '@/types'

declare global {
  interface Window { Pusher: typeof Pusher }
}
window.Pusher = Pusher

let echoInstance: any = null

export function getEcho(): any {
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster:  'reverb',
      key:          import.meta.env.VITE_REVERB_APP_KEY,
      wsHost:       import.meta.env.VITE_REVERB_HOST,
      wsPort:       import.meta.env.VITE_REVERB_PORT ?? 8080,
      wssPort:      import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS:     (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
    })
  }
  return echoInstance
}

export function useConversationChannel(conversationId: number | null) {
  const { appendMessage, updateMessage, removeMessage, updateConversationLastMessage } = useChatStore()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!conversationId) return
    const echo = getEcho()
    const channel = echo.private(`conversation.${conversationId}`)
    channelRef.current = channel

    channel
      .listen('.message.sent', (data: Message) => {
        appendMessage(data)
        updateConversationLastMessage(data)
      })
      .listen('.message.edited', (data: Partial<Message> & { id: number }) => {
        updateMessage(data as Message)
      })
      .listen('.message.deleted', (data: { id: number; conversation_id: number }) => {
        removeMessage(data.id, data.conversation_id)
      })

    return () => {
      channel.stopListening('.message.sent')
      channel.stopListening('.message.edited')
      channel.stopListening('.message.deleted')
      echo.leave(`conversation.${conversationId}`)
    }
  }, [conversationId])
}
