'use client'

import { useEffect, useRef } from 'react'
import type { Message, Role } from '../types'
import { MessageBubble } from './MessageBubble'
import { ExamplePrompts } from './ExamplePrompts'

interface Props {
  messages: Message[]
  loading: boolean
  role: Role
  onPrompt: (text: string) => void
}

export function MessageList({ messages, loading, role, onPrompt }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
      {messages.length === 0 && !loading ? (
        <ExamplePrompts role={role} onSelect={onPrompt} />
      ) : (
        <div className="space-y-5">
          {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
          {loading && (
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] text-[#c8f04a] uppercase tracking-widest font-bold">paygate</span>
              <div className="flex items-center gap-1.5 px-4 py-3 rounded border border-[#1a1a1a] bg-[#0d0d0d]">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-[#333] animate-pulse"
                    style={{ animationDelay: `${i * 160}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
