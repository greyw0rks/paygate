interface Props { online: boolean | null }

export function StatusDot({ online }: Props) {
  const dot =
    online === null ? 'bg-[#333]' :
    online ? 'bg-[#44ff88] shadow-[0_0_5px_#44ff88]' :
    'bg-[#ff4444]'

  const label =
    online === null ? 'connecting' :
    online ? 'online' :
    'offline'

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-[10px] text-[#444] uppercase tracking-widest">{label}</span>
    </div>
  )
}
