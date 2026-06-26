import { create } from 'zustand'
import type { Conversation, Message } from '@/types'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: number | null
  messages: Record<number, Message[]>
  unreadTotal: number
  setConversations: (c: Conversation[]) => void
  setActiveConversation: (id: number | null) => void
  setMessages: (conversationId: number, msgs: Message[]) => void
  prependMessages: (conversationId: number, msgs: Message[]) => void
  appendMessage: (msg: Message) => void
  updateMessage: (msg: Message) => void
  removeMessage: (id: number, conversationId: number) => void
  setUnread: (n: number) => void
  markConversationRead: (id: number) => void
  updateConversationLastMessage: (msg: Message) => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadTotal: 0,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (cid, msgs) => set((s) => ({ messages: { ...s.messages, [cid]: msgs } })),
  prependMessages: (cid, msgs) =>
    set((s) => ({ messages: { ...s.messages, [cid]: [...msgs, ...(s.messages[cid] ?? [])] } })),
  appendMessage: (msg) =>
    set((s) => ({ messages: { ...s.messages, [msg.conversation_id]: [...(s.messages[msg.conversation_id] ?? []), msg] } })),
  updateMessage: (msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [msg.conversation_id]: (s.messages[msg.conversation_id] ?? []).map((m) => m.id === msg.id ? msg : m),
      },
    })),
  removeMessage: (id, cid) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [cid]: (s.messages[cid] ?? []).map((m) => m.id === id ? { ...m, status: 'deleted', body: null } : m),
      },
    })),
  setUnread: (n) => set({ unreadTotal: n }),
  markConversationRead: (id) =>
    set((s) => ({
      conversations: s.conversations.map((c) => c.id === id ? { ...c, unread_count: 0 } : c),
    })),
  updateConversationLastMessage: (msg) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === msg.conversation_id
          ? { ...c, last_message: { id: msg.id, body: msg.body, sender_id: msg.sender_id, created_at: msg.created_at }, last_activity_at: msg.created_at }
          : c
      ).sort((a, b) => {
        const ta = a.last_activity_at ?? ''
        const tb = b.last_activity_at ?? ''
        return tb.localeCompare(ta)
      }),
    })),
}))
