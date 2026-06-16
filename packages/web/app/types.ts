export type Role = 'intern' | 'manager' | 'admin'

export interface Message {
  id: string
  from: 'user' | 'agent'
  content: string
  blocked?: boolean
  agentRole?: Role
  timestamp: Date
}

export interface AuditEntry {
  timestamp: string
  role: Role
  tool: string
  status: 'started' | 'success' | 'blocked' | 'error'
  detail?: string
  txId?: string
}

export interface RoleStatus {
  policy: {
    role: Role
    label: string
    maxHbarPerTx: number
    dailyHbarCap: number
    allowlistedAccounts: string[]
    canCreateTokens: boolean
    canMintTokens: boolean
    canCreateTopics: boolean
  }
  dailySpend: {
    spent: number
    date: string
  }
}

export interface StatusResponse {
  status: Record<Role, RoleStatus>
  auditTopicId: string | null
}
