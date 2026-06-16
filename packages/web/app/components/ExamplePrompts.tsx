import type { Role } from '../types'

const EXAMPLES: Record<Role, { text: string; expectBlock?: true }[]> = {
  intern: [
    { text: 'What is my HBAR balance?' },
    { text: 'Transfer 3 HBAR to 0.0.5000001' },
    { text: 'Transfer 10 HBAR to 0.0.5000001', expectBlock: true },
    { text: 'Transfer 3 HBAR to 0.0.9999999',  expectBlock: true },
    { text: 'Create a token called GoldCoin',   expectBlock: true },
  ],
  manager: [
    { text: 'What is my HBAR balance?' },
    { text: 'Transfer 30 HBAR to 0.0.5000002' },
    { text: 'Transfer 100 HBAR to 0.0.5000001', expectBlock: true },
    { text: 'Create a topic for treasury announcements' },
    { text: 'Create a token called SilverCoin with symbol SC' },
  ],
  admin: [
    { text: 'What is my HBAR balance?' },
    { text: 'Transfer 200 HBAR to 0.0.5000003' },
    { text: 'Create a topic called PayGate Audit Log' },
    { text: 'Create a fungible token called AdminToken, symbol ADM, 1000 supply' },
    { text: 'Show account info for 0.0.5000001' },
  ],
}

interface Props {
  role: Role
  onSelect: (text: string) => void
}

export function ExamplePrompts({ role, onSelect }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 py-16">
      <div className="text-center">
        <p className="text-[10px] text-[#333] uppercase tracking-widest mb-2">Try a prompt</p>
        <p className="text-[11px] text-[#222]">
          Prompts marked ◼ are expected to be blocked by policy
        </p>
      </div>
      <div className="w-full max-w-sm space-y-1">
        {EXAMPLES[role].map((ex, i) => (
          <button
            key={i}
            onClick={() => onSelect(ex.text)}
            className={`w-full text-left text-xs px-4 py-2.5 rounded border transition-all group ${
              ex.expectBlock
                ? 'border-[#1e0e0e] text-[#4a2a2a] hover:border-[#3a1a1a] hover:text-[#6a3a3a]'
                : 'border-[#171717] text-[#555] hover:border-[#242424] hover:text-[#777]'
            }`}
          >
            <span className={`mr-2.5 ${ex.expectBlock ? 'text-[#4a1a1a]' : 'text-[#2a2a2a] group-hover:text-[#444]'}`}>
              {ex.expectBlock ? '◼' : '›'}
            </span>
            {ex.text}
          </button>
        ))}
      </div>
    </div>
  )
}
