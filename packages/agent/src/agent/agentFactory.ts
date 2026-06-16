import { Client, PrivateKey } from '@hiero-ledger/sdk';
import { AgentMode } from '@hashgraph/hedera-agent-kit';
import { HcsAuditTrailHook } from '@hashgraph/hedera-agent-kit/hooks';
import {
  coreAccountPlugin,
  coreAccountQueryPlugin,
  coreConsensusPlugin,
  coreConsensusQueryPlugin,
  coreTokenPlugin,
  coreTokenQueryPlugin,
  coreMiscQueriesPlugin,
} from '@hashgraph/hedera-agent-kit/plugins';
import { HederaLangchainToolkit } from '@hashgraph/hedera-agent-kit-langchain';

import { ROLE_POLICIES, type Role } from '../roles.js';
import { SpendingLimitPolicy } from '../policies/SpendingLimitPolicy.js';
import { AllowlistPolicy } from '../policies/AllowlistPolicy.js';
import { CapabilityPolicy } from '../policies/CapabilityPolicy.js';
import { PaygateAuditHook } from '../hooks/PaygateAuditHook.js';

// Every tool that should go through the audit trail.
// Names must match the SDK constants exactly (all lowercase, _tool suffix).
const ALL_AUDITED_TOOLS = [
  'transfer_hbar_tool',
  'create_fungible_token_tool',
  'create_non_fungible_token_tool',
  'mint_fungible_token_tool',
  'mint_non_fungible_token_tool',
  'create_topic_tool',
  'submit_topic_message_tool',
  'airdrop_fungible_token_tool',
  'create_erc20_tool',
  'create_erc721_tool',
  'mint_erc721_tool',
];

export function buildClientFromEnv(): Client {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  if (!accountId || !privateKey) {
    throw new Error('Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in environment');
  }
  return Client.forTestnet().setOperator(
    accountId,
    PrivateKey.fromStringECDSA(privateKey)
  );
}

export function buildToolkitForRole(role: Role, client: Client): HederaLangchainToolkit {
  const rolePolicy = ROLE_POLICIES[role];
  const auditTopicId = process.env.HEDERA_AUDIT_TOPIC_ID;

  const spendingPolicy  = new SpendingLimitPolicy(role, rolePolicy);
  const allowlistPolicy = new AllowlistPolicy(role, rolePolicy);
  const capabilityPolicy = new CapabilityPolicy(role, rolePolicy);
  const auditHook = new PaygateAuditHook(role, ALL_AUDITED_TOOLS);

  // HcsAuditTrailHook writes every action to an immutable HCS topic on-chain
  const hcsHook = auditTopicId
    ? new HcsAuditTrailHook(ALL_AUDITED_TOOLS, auditTopicId, client)
    : null;

  const hooks = [
    auditHook,       // logs first (pre-execution)
    spendingPolicy,  // AbstractPolicy extends AbstractHook — placed in hooks[]
    allowlistPolicy,
    capabilityPolicy,
    ...(hcsHook ? [hcsHook] : []),
  ];

  return new HederaLangchainToolkit({
    client,
    configuration: {
      plugins: [
        coreAccountPlugin,
        coreAccountQueryPlugin,
        coreConsensusPlugin,
        coreConsensusQueryPlugin,
        coreTokenPlugin,
        coreTokenQueryPlugin,
        coreMiscQueriesPlugin,
      ],
      context: {
        mode: AgentMode.AUTONOMOUS,
        hooks,
      },
    },
  });
}

export function buildSystemPrompt(role: Role): string {
  const rp = ROLE_POLICIES[role];
  const limits = [
    rp.maxHbarPerTx > 0
      ? `max ${rp.maxHbarPerTx} HBAR per single transaction`
      : 'no per-tx HBAR limit',
    rp.dailyHbarCap > 0
      ? `daily spending cap of ${rp.dailyHbarCap} HBAR`
      : 'no daily HBAR cap',
    rp.allowlistedAccounts.length > 0
      ? `HBAR transfers restricted to: ${rp.allowlistedAccounts.join(', ')}`
      : 'HBAR transfers to any account permitted',
    rp.canCreateTokens ? 'can create tokens' : 'CANNOT create tokens',
    rp.canMintTokens   ? 'can mint tokens'   : 'CANNOT mint tokens',
    rp.canCreateTopics ? 'can create topics' : 'CANNOT create topics',
  ];

  return `You are PayGate, a policy-constrained treasury agent on the Hedera testnet network.
You are operating as role: ${rp.label} (${role}).

Your active policy constraints:
${limits.map(l => `- ${l}`).join('\n')}

All your actions are logged to an immutable HCS audit trail.
If a policy blocks an action, clearly explain which policy fired and what the limit is.
When a transfer succeeds, always confirm the transaction ID and the amount sent.
Be concise and professional.`;
}
