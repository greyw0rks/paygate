'use client'

import { useState, useEffect } from 'react'
import type { StatusResponse } from '../types'

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL ?? 'http://localhost:3001'

export function useStatus(intervalMs = 5000) {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const [healthRes, statusRes] = await Promise.all([
          fetch(`${AGENT_URL}/health`),
          fetch(`${AGENT_URL}/api/status`),
        ])
        if (cancelled) return
        setOnline(healthRes.ok)
        if (statusRes.ok) setStatus(await statusRes.json())
      } catch {
        if (!cancelled) setOnline(false)
      }
    }

    poll()
    const id = setInterval(poll, intervalMs)
    return () => { cancelled = true; clearInterval(id) }
  }, [intervalMs])

  return { status, online }
}
