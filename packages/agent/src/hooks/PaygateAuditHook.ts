import {
  AbstractHook,
  type PreToolExecutionParams,
  type PostSecondaryActionParams,
} from '@hashgraph/hedera-agent-kit';
import type { Role } from '../roles.js';

export interface AuditEntry {
  timestamp: string;
  role: Role;
  tool: string;
  status: 'started' | 'success' | 'blocked' | 'error';
  detail?: string;
  txId?: string;
}

const auditLog: AuditEntry[] = [];

export function getAuditLog(): AuditEntry[] {
  return [...auditLog].reverse(); // newest first
}

export function recordBlockedAction(role: Role, tool: string, reason: string) {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    role,
    tool,
    status: 'blocked',
    detail: reason,
  };
  auditLog.push(entry);
  console.log(`[AUDIT] ${entry.timestamp} | ${role} | ${tool} | BLOCKED | ${reason.slice(0, 80)}`);
}

export class PaygateAuditHook extends AbstractHook {
  name = 'PayGate Audit Hook';
  description = 'Logs every tool invocation with role context to in-memory audit trail';
  relevantTools: string[];
  private role: Role;

  constructor(role: Role, relevantTools: string[]) {
    super();
    this.role = role;
    this.relevantTools = relevantTools;
  }

  override async preToolExecutionHook(
    _params: PreToolExecutionParams,
    method: string
  ): Promise<void> {
    if (!this.relevantTools.includes(method)) return;
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      role: this.role,
      tool: method,
      status: 'started',
      detail: `Executing ${method} as role "${this.role}"`,
    };
    auditLog.push(entry);
    console.log(`[AUDIT] ${entry.timestamp} | ${this.role} | ${method} | STARTED`);
  }

  override async postToolExecutionHook(
    params: PostSecondaryActionParams,
    method: string
  ): Promise<void> {
    if (!this.relevantTools.includes(method)) return;

    const result = params.toolResult as Record<string, unknown> | undefined;
    const txId = result?.['transactionId'] as string | undefined
      ?? result?.['status'] as string | undefined;

    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      role: this.role,
      tool: method,
      status: 'success',
      detail: txId ? `Completed: ${txId}` : `Completed ${method}`,
      txId,
    };
    auditLog.push(entry);
    console.log(
      `[AUDIT] ${entry.timestamp} | ${this.role} | ${method} | SUCCESS` +
      (txId ? ` | ${txId}` : '')
    );
  }
}
