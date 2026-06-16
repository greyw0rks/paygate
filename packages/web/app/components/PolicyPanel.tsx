import type { Role, StatusResponse } from '../types'
import { SpendBar } from './SpendBar'

interface RoleMeta {
  label: string
  dot: string
  color: string
  maxHbar: number
  dailyCap: number
  allowlistCount: number
  can: string[]
  cannot: string[]
}

const ROLE_META: Record<Role, RoleMeta> = {
  intern: {
    label: 'Intern',
    dot: 'bg-yellow-400',
    color: 'text-yellow-400',
    maxHbar: 5,
    dailyCap: 20,
    allowlistCount: 1,
    can: ['Query balance', 'Transfer ≤5 ℏ to 1 account'],
    cannot: ['Token creation', 'Topic creation', 'Minting'],
  },
  manager: {
    label: 'Manager',
    dot: 'bg-blue-400',
    color: 'text-blue-400',
    maxHbar: 50,
    dailyCap: 200,
    allowlistCount: 3,
    can: ['Query balance', 'Transfer ≤50 ℏ to 3 accounts', 'Create tokens', 'Create topics'],
    cannot: ['Minting', 'Unlimited transfers'],
  },
  admin: {
    label: 'Admin',
    dot: 'bg-green-400',
    color: 'text-green-400',
    maxHbar: 0,
    dailyCap: 0,
    allowlistCount: 0,
    can: ['All operations', 'Unlimited ℏ', 'Any recipient'],
    cannot: [],
  },
}

interface Props {
  activeRole: Role
  status: StatusResponse | null
}

export function PolicyPanel({ activeRole, status }: Props) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
      <p className="text-[9px] text-[#2a2a2a] uppercase tracking-widest mb-4">Policy Matrix</p>

      <div className="space-y-2">
        {(Object.entries(ROLE_META) as [Role, RoleMeta][]).map(([r, meta]) => {
          const isActive = r === activeRole
          const liveSpend = status?.status[r]?.dailySpend

          return (
            <div
              key={r}
              className={`rounded border transition-all duration-200 ${
                isActive
                  ? 'border-[#222] bg-[#0f0f0f]'
                  : 'border-[#0f0f0f] opacity-25'
              }`}
            >
              <div className={`flex items-center justify-between px-3 py-2.5 ${isActive ? 'border-b border-[#161616]' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${!isActive ? 'opacity-40' : ''}`} />
                  <span className={`text-xs font-bold ${isActive ? meta.color : 'text-[#444]'}`}>
                    {meta.label}
                  </span>
                </div>
                {isActive && (
                  <span className="text-[8px] text-[#2a2a2a] uppercase tracking-widest">active</span>
                )}
              </div>

              {isActive && (
                <div className="px-3 py-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#0a0a0a] rounded p-2">
                      <p className="text-[8px] text-[#333] uppercase tracking-widest mb-1">Per TX</p>
                      <p className="text-sm font-bold text-[#ededed]">
                        {meta.maxHbar > 0 ? `${meta.maxHbar} ℏ` : '∞'}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded p-2">
                      <p className="text-[8px] text-[#333] uppercase tracking-widest mb-1">Allowlist</p>
                      <p className="text-sm font-bold text-[#ededed]">
                        {meta.allowlistCount > 0 ? `${meta.allowlistCount} acct` : '∞'}
                      </p>
                    </div>
                  </div>

                  {liveSpend !== undefined && (
                    <SpendBar spent={liveSpend.spent} cap={meta.dailyCap} />
                  )}

                  <div>
                    <p className="text-[8px] text-[#2a2a2a] uppercase tracking-widest mb-1.5">Permitted</p>
                    {meta.can.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#444] mb-0.5">
                        <span className="text-[#44ff88] text-[8px]">✓</span>
                        {c}
                      </div>
                    ))}
                  </div>

                  {meta.cannot.length > 0 && (
                    <div>
                      <p className="text-[8px] text-[#2a2a2a] uppercase tracking-widest mb-1.5">Blocked</p>
                      {meta.cannot.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#333] mb-0.5">
                          <span className="text-[#ff4444] text-[8px]">✗</span>
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-[#111]">
        <p className="text-[8px] text-[#2a2a2a] uppercase tracking-widest mb-2">Enforcement Chain</p>
        {[
          'SpendingLimitPolicy',
          'AllowlistPolicy',
          'CapabilityPolicy',
          'PaygateAuditHook → HCS',
        ].map((h, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#333] mb-1">
            <span className="text-[#c8f04a] text-[8px]">›</span>
            {h}
          </div>
        ))}
      </div>
    </div>
  )
}
