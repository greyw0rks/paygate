import {
  AbstractPolicy,
  type PreToolExecutionParams,
} from '@hashgraph/hedera-agent-kit';
import type { Role, RolePolicy } from '../roles.js';

function extractRecipient(params: Record<string, unknown>): string | null {
  for (const key of ['toAccountId', 'recipientId', 'recipient', 'accountId', 'to']) {
    if (typeof params[key] === 'string') return params[key] as string;
  }
  if (Array.isArray(params['transfers'])) {
    const transfers = params['transfers'] as Array<{ accountId?: string; amount?: number }>;
    const receiving = transfers.find(t => typeof t.amount === 'number' && t.amount > 0);
    if (receiving?.accountId) return receiving.accountId;
  }
  return null;
}

export class AllowlistPolicy extends AbstractPolicy {
  name = 'Allowlist Policy';
  description: string;
  relevantTools = ['transfer_hbar_tool'];

  private rolePolicy: RolePolicy;
  private role: Role;

  constructor(role: Role, rolePolicy: RolePolicy) {
    super();
    this.role = role;
    this.rolePolicy = rolePolicy;
    const { allowlistedAccounts } = rolePolicy;
    this.description =
      allowlistedAccounts.length === 0
        ? `${rolePolicy.label}: transfers to any account allowed`
        : `${rolePolicy.label}: transfers restricted to ${allowlistedAccounts.length} allowlisted account(s)`;
  }

  protected override shouldBlockPreToolExecution(
    params: PreToolExecutionParams,
    _method: string
  ): boolean | Promise<boolean> {
    const { allowlistedAccounts } = this.rolePolicy;
    if (allowlistedAccounts.length === 0) return false; // admin: no restriction

    const raw = params.rawParams as Record<string, unknown> | undefined;
    if (!raw) return false;

    const recipient = extractRecipient(raw);
    if (!recipient) return false;

    // Normalize account IDs: strip shard.realm prefix for comparison
    const normalize = (id: string) => id.split('.').pop() ?? id;
    const allowed = allowlistedAccounts.some(a => normalize(a) === normalize(recipient));

    if (!allowed) {
      throw new Error(
        `[AllowlistPolicy] Blocked: account "${recipient}" is not on the allowlist for role "${this.role}". ` +
        `Allowed accounts: ${allowlistedAccounts.join(', ')}`
      );
    }

    return false;
  }
}
