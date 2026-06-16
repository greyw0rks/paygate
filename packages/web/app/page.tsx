'use client'

import { useState } from 'react'
import type { Role } from './types'
import { useAgent } from './hooks/useAgent'
import { useStatus } from './hooks/useStatus'
import { useAudit } from './hooks/useAudit'
import { Header } from './components/Header'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import { Sidebar } from './components/Sidebar'

export default function Home() {
  const [role, setRole] = useState<Role>('intern')
  const { messages, loading, send, clear } = useAgent(role)
  const { status, online } = useStatus()
  const auditEntries = useAudit()

  function handleRoleChange(next: Role) {
    setRole(next)
    clear()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-[#ededed]">
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          role={role}
          online={online}
          onRoleChange={handleRoleChange}
          onClear={clear}
        />
        <MessageList
          messages={messages}
          loading={loading}
          role={role}
          onPrompt={send}
        />
        <ChatInput role={role} loading={loading} onSend={send} />
      </div>
      <Sidebar
        activeRole={role}
        status={status}
        auditEntries={auditEntries}
      />
    </div>
  )
}
