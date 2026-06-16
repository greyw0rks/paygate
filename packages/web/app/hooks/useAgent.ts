'use client'

import { useState, useCallback } from 'react'
import type { Message, Role } from '../types'

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL ?? 'http://localhost:3001'

export function useAgent(role: Role) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      from: 'user',
      content: trimmed,
      timestamp: new Date(),
    }])
    setLoading(true)

    try {
      const res = await fetch(`${AGENT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, role }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        from: 'agent',
        content: data.error ?? data.response ?? 'No response',
        blocked: data.blocked ?? false,
        agentRole: role,
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        from: 'agent',
        content: 'Could not reach agent server. Make sure it is running on port 3001.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [role, loading])

  const clear = useCallback(() => setMessages([]), [])

  return { messages, loading, send, clear }
}
