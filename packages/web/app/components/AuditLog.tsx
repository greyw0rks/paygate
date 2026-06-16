import type { AuditEntry } from '../types'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const STATUS_STYLES: Record<AuditEntry['status'], string> = {
  started: 'text-yellow-500 border-yellow-900/30 bg-yellow-950/10',
  success: 'text-[#44ff88] border-green-900/30 bg-green-950/10',
  blocked: 'text-[#ff6666] border-red-900/30 bg-red-950/10',
  error:   'text-[#ff6666] border-red-900/30 bg-red-950/10',
}

const ROLE_COLOR: Record<string, string> = {
  intern:  'text-yellow-700',
  manager: 'text-blue-700',
  admin:   'text-green-700',
}

interface Props {
  entries: AuditEntry[]
  auditTopicId?: string | null
}

export function AuditLog({ entries, auditTopicId }: Props) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] text-[#2a2a2a] uppercase tracking-widest">Audit Trail</p>
        {entries.length > 0 && (
          <span className="text-[9px] text-[#222]">{entries.length}</span>
        )}
      </div>

      {auditTopicId && auditTopicId !== '0.0.XXXXX' && (
        <div className="mb-3 px-3 py-2 rounded border border-[#171717] bg-[#0a0a0a]">
          <p className="text-[8px] text-[#2a2a2a] uppercase tracking-widest mb-0.5">HCS Topic</p>
          <p className="text-[10px] text-[#c8f04a]/50 font-mono">{auditTopicId}</p>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-[10px] text-[#1e1e1e] text-center py-8">
          No events yet
        </p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry, i) => (
            <div
              key={i}
              className={`text-[10px] px-2.5 py-2 rounded border ${STATUS_STYLES[entry.status] ?? 'border-[#1a1a1a]'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[8px] uppercase tracking-widest">
                  {entry.status}
                </span>
                <span className="text-[#2a2a2a] text-[9px]">{relativeTime(entry.timestamp)}</span>
              </div>
              <div className="font-mono text-[#444] mb-1">{entry.tool}</div>
              <span className={`text-[8px] uppercase tracking-widest ${ROLE_COLOR[entry.role] ?? 'text-[#333]'}`}>
                {entry.role}
              </span>
              {entry.detail && (
                <div className="mt-1 text-[#333] leading-relaxed break-all">
                  {entry.detail.length > 110 ? entry.detail.slice(0, 110) + '…' : entry.detail}
                </div>
              )}
              {entry.txId && (
                <div className="mt-1 font-mono text-[#c8f04a]/30 break-all">{entry.txId}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
