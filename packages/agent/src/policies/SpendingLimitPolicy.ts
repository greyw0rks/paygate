import {
  AbstractPolicy,
  type PostCoreActionParams,
  type PostParamsNormalizationParams,
} from '@hashgraph/hedera-agent-kit';
import type { Role, RolePolicy } from '../roles.js';

// Daily spend tracker — in production this would be Redis/DB
const dailySpend: Record<Role, { amount: number; date: string }> = {
  intern:  { amount: 0, date: '' },
  manager: { amount: 0, date: '' },
  admin:   { amount: 0, date: '' },
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getRoleDailySpend(role: Role): number {
  const today = todayStr();
  if (dailySpend[role].date !== today) {
    dailySpend[role] = { amount: 0, date: today };
  }
  return dailySpend[role].amount;
}

export function recordSpend(role: Role, amount: number) {
  const today = todayStr();
  if (dailySpend[role].date !== today) {
    dailySpend[role] = { amount: 0, date: today };
  }
  dailySpend[role].amount += amount;
}

export function getDailySpendSummary(role: Role): { spent: number; date: string } {
  const today = todayStr();
  if (dailySpend[role].date !== today) return { spent: 0, date: today };
  return { spent: dailySpend[role].amount, date: today };
}

function extractHbarAmount(params: Record<string, unknown>): number | null {
  // transferHbar normalised params may use 'amount', 'hbarAmount', or 'hbars'
  for (const key of ['amount', 'hbarAmount', 'hbars']) {
    if (typeof params[key] === 'number') return params[key] as number;
    if (typeof params[key] === 'string') {
      const n = parseFloat(params[key] as string);
      if (!isNaN(n)) return n;
    }
  }
  // Check nested transfers array (outgoing = negative amounts)
  if (Array.isArray(params['transfers'])) {
    const transfers = params['transfers'] as Array<{ amount?: number }>;
    const outgoing = transfers
      .filter(t => typeof t.amount === 'number' && t.amount < 0)
      .reduce((acc, t) => acc + Math.abs(t.amount!), 0);
    if (outgoing > 0) return outgoing;
  }
  return null;
}

export class SpendingLimitPolicy extends AbstractPolicy {
  name = 'Spending Limit Policy';
  description: string;
  relevantTools = ['transfer_hbar_tool'];

  private rolePolicy: RolePolicy;
  private role: Role;

  constructor(role: Role, rolePolicy: RolePolicy) {
    super();
    this.role = role;
    this.rolePolicy = rolePolicy;
    this.description =
      `${rolePolicy.label}: max ${rolePolicy.maxHbarPerTx > 0 ? rolePolicy.maxHbarPerTx + ' HBAR/tx' : 'unlimited'}, ` +
      `${rolePolicy.dailyHbarCap > 0 ? rolePolicy.dailyHbarCap + ' HBAR/day' : 'no daily cap'}`;
  }

  protected override shouldBlockPostParamsNormalization(
    params: PostParamsNormalizationParams,
    _method: string
  ): boolean | Promise<boolean> {
    const normalised = params.normalisedParams as Record<string, unknown> | undefined;
    const raw = params.rawParams as Record<string, unknown> | undefined;
    const amount = extractHbarAmount(normalised ?? raw ?? {});
    if (amount === null) return false;

    const { maxHbarPerTx, dailyHbarCap } = this.rolePolicy;

    if (maxHbarPerTx > 0 && amount > maxHbarPerTx) {
      throw new Error(
        `[SpendingLimitPolicy] Blocked: ${amount} HBAR exceeds per-tx limit of ${maxHbarPerTx} HBAR for role "${this.role}"`
      );
    }

    if (dailyHbarCap > 0) {
      const spent = getRoleDailySpend(this.role);
      if (spent + amount > dailyHbarCap) {
        throw new Error(
          `[SpendingLimitPolicy] Blocked: ${amount} HBAR would exceed daily cap of ${dailyHbarCap} HBAR ` +
          `for role "${this.role}" (already spent: ${spent} HBAR today)`
        );
      }
    }

    return false;
  }

  // Record spend after the core action succeeds so the daily cap stays accurate.
  protected override shouldBlockPostCoreAction(
    params: PostCoreActionParams,
    _method: string
  ): boolean | Promise<boolean> {
    const normalised = params.normalisedParams as Record<string, unknown> | undefined;
    const raw = params.rawParams as Record<string, unknown> | undefined;
    const amount = extractHbarAmount(normalised ?? raw ?? {});
    if (amount !== null) recordSpend(this.role, amount);
    return false;
  }
}
