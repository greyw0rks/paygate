// PayGate — Role definitions
// Each role defines spending limits, daily caps, and allowlisted accounts

export type Role = 'intern' | 'manager' | 'admin';

export interface RolePolicy {
  role: Role;
  label: string;
  maxHbarPerTx: number;       // max HBAR per single transaction
  dailyHbarCap: number;       // max HBAR total per day (0 = unlimited)
  allowlistedAccounts: string[]; // accountId strings — empty = any allowed (admin)
  canCreateTokens: boolean;
  canMintTokens: boolean;
  canCreateTopics: boolean;
}

// Testnet demo accounts (these will be your test recipient accounts)
// In a real deployment, these are configured per-org
const DEMO_SAFE_ACCOUNTS = [
  '0.0.5000001',
  '0.0.5000002',
  '0.0.5000003',
];

export const ROLE_POLICIES: Record<Role, RolePolicy> = {
  intern: {
    role: 'intern',
    label: '🟡 Intern',
    maxHbarPerTx: 5,
    dailyHbarCap: 20,
    allowlistedAccounts: DEMO_SAFE_ACCOUNTS.slice(0, 1), // only first account
    canCreateTokens: false,
    canMintTokens: false,
    canCreateTopics: false,
  },
  manager: {
    role: 'manager',
    label: '🔵 Manager',
    maxHbarPerTx: 50,
    dailyHbarCap: 200,
    allowlistedAccounts: DEMO_SAFE_ACCOUNTS, // all safe accounts
    canCreateTokens: true,
    canMintTokens: false,
    canCreateTopics: true,
  },
  admin: {
    role: 'admin',
    label: '🟢 Admin',
    maxHbarPerTx: 0,      // unlimited
    dailyHbarCap: 0,      // unlimited
    allowlistedAccounts: [], // any account allowed
    canCreateTokens: true,
    canMintTokens: true,
    canCreateTopics: true,
  },
};
