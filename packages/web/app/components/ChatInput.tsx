'use client'

import { useState, type KeyboardEvent } from 'react'
import type { Role } from '../types'

const ROLE_LABEL: Record<Role, string> = {
  intern: 'Intern',
  manager: 'Manager',
  admin: 'Admin',
}

interface Props {
  role: Role
  loading: boolean
  onSend: (text: string) => void
}

export function ChatInput({ role, loading, onSend }: Props) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setValue('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  return (
    <div className="px-6 py-4 border-t border-[#1a1a1a] shrink-0">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          placeholder={`Message as ${ROLE_LABEL[role]}…`}
          className="flex-1 bg-[#0c0c0c] border border-[#1a1a1a] rounded px-4 py-2.5 text-sm text-[#ededed] placeholder-[#2a2a2a] focus:outline-none focus:border-[#282828] disabled:opacity-40 transition-colors"
        />
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className="px-5 py-2.5 bg-[#c8f04a] text-black text-[10px] font-bold tracking-widest rounded hover:bg-[#d4f55a] active:bg-[#b8e03a] disabled:opacity-20 disabled:cursor-not-allowed transition-all uppercase"
        >
          {loading ? '···' : 'Send'}
        </button>
      </div>
    </div>
  )
}
