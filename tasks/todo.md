# PayGate — Hedera Policy Agent Bounty (Week 5)

## Concept
Multi-role treasury agent with policy-constrained HBAR payments.
Three roles (intern/manager/admin) each have different spending limits,
allowlists, and all actions are logged to an HCS audit topic.

## Stack
- `@hashgraph/hedera-agent-kit` v4 + `@hashgraph/hedera-agent-kit-langchain`
- `@hiero-ledger/sdk` (peer dep, replaces @hashgraph/sdk in v4)
- LangChain + Claude (Anthropic) as LLM
- Custom hooks: AuditLogHook (HCS), SpendingLimitHook, AllowlistHook
- Custom policy: RoleBasedPolicy
- Next.js 14 frontend — chat UI + live policy enforcement log panel
- Deploy: Railway (backend agent API) + Vercel (frontend)

## Architecture
```
Frontend (Next.js)
  └── /api/chat  →  Agent Server (Node.js)
                      ├── RoleBasedPolicy (selects active policy set by role)
                      ├── SpendingLimitPolicy (per-tx + daily rolling limit)
                      ├── AllowlistPolicy (recipient must be in role's allowlist)
                      └── AuditLogHook (every action → HCS topic message)
```

## Key v4 API Notes (from docs)
- Import from `@hashgraph/hedera-agent-kit/plugins` (explicit, no auto-loading)
- SDK is now `@hiero-ledger/sdk` (peer dep >=2.80.0)
- Tools must extend `BaseTool` to be visible to hooks/policies
- Hooks fire at: preExecution, postParamNormalization, postCoreAction, postToolExecution
- Policies are plain TS objects composed into the config

## Todo

### Phase 1 — Backend Agent
- [ ] Init monorepo: `packages/agent` (Node/TS) + `packages/web` (Next.js)
- [ ] Install v4 deps correctly
- [ ] Implement RoleBasedPolicy (intern: 5 HBAR, manager: 50 HBAR, admin: unlimited)
- [ ] Implement AllowlistPolicy (per-role allowlisted account IDs)
- [ ] Implement SpendingLimitPolicy (daily rolling cap per role)
- [ ] Implement AuditLogHook → HCS topic submission
- [ ] Wire up HederaLangchainToolkit with coreAccountPlugin + coreConsensusPlugin
- [ ] Build Express API: POST /api/chat (role + message → agent response)
- [ ] Test on testnet: blocked transfer, allowed transfer, audit log visible

### Phase 2 — Frontend
- [ ] Next.js chat interface (role switcher: intern/manager/admin)
- [ ] Real-time policy enforcement log panel (right sidebar)
- [ ] Live HCS audit feed (poll mirror node for topic messages)
- [ ] Visual policy badge per role (spending limit, allowlist count)

### Phase 3 — Polish & Submit
- [ ] README with architecture diagram, demo walkthrough
- [ ] .env.example
- [ ] Record demo video / tweet
- [ ] Submit GitHub feedback issue on hedera-agent-kit-js
- [ ] Fill bounty form

## Review
_TBD after build_
