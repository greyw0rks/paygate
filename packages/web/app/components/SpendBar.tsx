interface Props {
  spent: number
  cap: number
}

export function SpendBar({ spent, cap }: Props) {
  if (cap === 0) return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] text-[#333] uppercase tracking-widest">Daily spend</span>
      <span className="text-[10px] text-[#444]">∞ unlimited</span>
    </div>
  )

  const pct = Math.min((spent / cap) * 100, 100)
  const barColor =
    pct > 80 ? '#ff4444' :
    pct > 50 ? '#f0a030' :
    '#44ff88'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-[#333] uppercase tracking-widest">Daily spend</span>
        <span className="text-[10px] text-[#444]">{spent} / {cap} ℏ</span>
      </div>
      <div className="h-px bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
