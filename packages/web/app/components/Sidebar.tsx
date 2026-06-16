'use client'

import { useState } from 'react'
import type { Role, AuditEntry, StatusResponse } from '../types'
import { PolicyPanel } from './PolicyPanel'
import { AuditLog } from './AuditLog'

type Tab = 'policy' | 'audit'

interface Props {
  activeRole: Role
  status: StatusResponse | null
  auditEntries: AuditEntry[]
}

export function Sidebar({ activeRole, status, auditEntries }: Props) {
  const [tab, setTab] = useState<Tab>('policy')

  return (
    <aside className="w-[270px] flex flex-col border-l border-[#141414] bg-[#070707] shrink-0">
      <div className="flex shrink-0 border-b border-[#141414]">
        {(['policy', 'audit'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[9px] uppercase tracking-widest transition-colors ${
              tab === t
                ? 'text-[#c8f04a] border-b border-[#c8f04a] -mb-px'
                : 'text-[#2a2a2a] hover:text-[#444]'
            }`}
          >
            {t}
            {t === 'audit' && auditEntries.length > 0 && (
              <span className="ml-1 text-[#333]">· {auditEntries.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'policy'
        ? <PolicyPanel activeRole={activeRole} status={status} />
        : <AuditLog entries={auditEntries} auditTopicId={status?.auditTopicId} />
      }
    </aside>
  )
}
