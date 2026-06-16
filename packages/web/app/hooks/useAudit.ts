'use client'

import { useState, useEffect } from 'react'
import type { AuditEntry } from '../types'

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL ?? 'http://localhost:3001'

export function useAudit(intervalMs = 3000) {
  const [entries, setEntries] = useState<AuditEntry[]>([])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(`${AGENT_URL}/api/audit`)
        if (!cancelled && res.ok) {
          const data = await res.json()
          setEntries(data.entries ?? [])
        }
      } catch { /* agent offline */ }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => { cancelled = true; clearInterval(id) }
  }, [intervalMs])

  return entries
}
