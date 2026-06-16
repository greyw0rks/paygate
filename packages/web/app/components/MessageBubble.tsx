import type { Message } from '../types'

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const segments = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={i}>
        {i > 0 && <br />}
        {segments.map((seg, j) =>
          seg.startsWith('**') && seg.endsWith('**')
            ? <strong key={j} className="text-[#ededed] font-bold">{seg.slice(2, -2)}</strong>
            : <span key={j}>{seg}</span>
        )}
      </span>
    )
  })
}

interface Props { message: Message }

export function MessageBubble({ message }: Props) {
  const isUser = message.from === 'user'
  const time = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        <span className={`text-[10px] uppercase tracking-widest font-bold ${
          isUser ? 'text-[#555]' : 'text-[#c8f04a]'
        }`}>
          {isUser ? 'you' : 'paygate'}
        </span>
        <span className="text-[10px] text-[#2a2a2a]">{time}</span>
      </div>
      <div className={`
        max-w-[76%] px-4 py-3 rounded text-sm leading-relaxed
        ${isUser
          ? 'bg-[#111] border border-[#222] text-[#ccc]'
          : message.blocked
            ? 'bg-[#180808] border border-[#3a1010] text-[#cc7777]'
            : 'bg-[#0d0d0d] border border-[#1a1a1a] text-[#aaa]'
        }
      `}>
        {message.blocked && (
          <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-[#3a1010]">
            <span className="text-[#ff4444] text-[10px] font-bold uppercase tracking-widest">
              ◼ Policy Violation
            </span>
          </div>
        )}
        <div>{renderContent(message.content)}</div>
      </div>
    </div>
  )
}
