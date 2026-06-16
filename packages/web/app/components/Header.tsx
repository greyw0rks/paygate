'use client'

import type { Role } from '../types'
import { StatusDot } from './StatusDot'

const ROLES: { id: Role; label: string; dot: string }[] = [
  { id: 'intern',  label: 'Intern',  dot: 'bg-yellow-400' },
  { id: 'manager', label: 'Manager', dot: 'bg-blue-400'   },
  { id: 'admin',   label: 'Admin',   dot: 'bg-green-400'  },
]

interface Props {
  role: Role
  online: boolean | null
  onRoleChange: (r: Role) => void
  onClear: () => void
}

export function Header({ role, online, onRoleChange, onClear }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] shrink-0">
      <div className="flex items-center gap-5">
        <div>
          <h1 className="text-base font-bold tracking-widest">
            <span className="text-[#c8f04a]">PAY</span>
            <span>GATE</span>
          </h1>
          <p className="text-[9px] text-[#333] uppercase tracking-widest mt-0.5">
            Hedera Treasury Agent
          </p>
        </div>
        <div className="w-px h-7 bg-[#1a1a1a]" />
        <StatusDot online={online} />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[10px] text-[#333] uppercase tracking-widest">Role</span>
        <div className="flex items-center gap-0.5 p-0.5 rounded border border-[#1a1a1a] bg-[#0c0c0c]">
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => onRoleChange(r.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all ${
                role === r.id
                  ? 'bg-[#1a1a1a] text-[#ededed]'
                  : 'text-[#444] hover:text-[#777]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${r.dot} ${role === r.id ? '' : 'opacity-40'}`} />
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClear}
          className="text-[10px] text-[#333] hover:text-[#666] uppercase tracking-widest transition-colors"
        >
          Clear
        </button>
      </div>
    </header>
  )
}
