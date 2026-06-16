# PayGate — Hedera Policy Agent

> Policy-constrained treasury agent on the Hedera network. Built for the [Hedera AI Agent Bounty Week 5](https://ai-bounties.hedera.com/).

PayGate demonstrates the Hedera Agent Kit v4 **Hooks & Policies** system by building a real-world multi-role treasury agent. Every HBAR transfer and on-chain action is governed by role-specific policies enforced at the tool lifecycle level — and every action is logged to an immutable HCS audit trail.

---

## Architecture

```
┌─────────────────────────────────┐    ┌──────────────────────────────────────────┐
│   Next.js Frontend              │    │   Express Agent Server                   │
│                                 │    │                                          │
│  ┌─────────────┐  ┌──────────┐  │    │  POST /api/chat                          │
│  │ Role        │  │ Audit    │  │───▶│    └── buildToolkitForRole(role)          │
│  │ Switcher    │  │ Log      │  │    │          ├── SpendingLimitPolicy          │
│  │ intern /    │  │ Panel    │  │    │          │     per-tx + daily HBAR cap    │
│  │ manager /   │  │ (live)   │  │    │          ├── AllowlistPolicy              │
│  │ admin       │  │          │  │    │          │     recipient allowlist        │
│  └─────────────┘  └──────────┘  │    │          ├── CapabilityPolicy             │
│                                 │    │          │     tool access by role        │
│  ┌──────────────────────────┐   │    │          ├── PaygateAuditHook             │
│  │  Chat Interface          │   │    │          │     in-memory audit log        │
│  │  (example prompts per    │   │    │          └── HcsAuditTrailHook            │
│  │   role, blocked/allowed  │   │    │                → HCS topic (on-chain)    │
│  │   response highlighting) │   │    │                                          │
│  └──────────────────────────┘   │    │  HederaLangchainToolkit                  │
└─────────────────────────────────┘    │    └── createReactAgent (LangGraph)      │
                                       │          └── Claude (claude-sonnet-4-6)  │
                                       └──────────────────────────────────────────┘
```

## Role Policies

| Role | Max HBAR/tx | Daily Cap | Allowlist | Create Tokens | Mint | Create Topics |
|------|-------------|-----------|-----------|---------------|------|---------------|
| 🟡 Intern | 5 HBAR | 20 HBAR | 1 account | ✗ | ✗ | ✗ |
| 🔵 Manager | 50 HBAR | 200 HBAR | 3 accounts | ✓ | ✗ | ✓ |
| 🟢 Admin | Unlimited | Unlimited | Any | ✓ | ✓ | ✓ |

## Hook & Policy Lifecycle

Every tool call passes through four stages. PayGate hooks into all of them:

```
1. preToolExecution       ← AllowlistPolicy, CapabilityPolicy, PaygateAuditHook (log start)
2. postParamNormalization ← SpendingLimitPolicy (reads normalised HBAR amount)
3. postCoreAction         ← (inspect tx before submission)
4. postToolExecution      ← PaygateAuditHook (log success), HcsAuditTrailHook (→ HCS)
```

Policies throw on violation — the error propagates up and the agent reports the block.

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- A free Hedera Testnet account: [portal.hedera.com](https://portal.hedera.com/dashboard)
- An Anthropic API key: [console.anthropic.com](https://console.anthropic.com)

### 1. Clone & install

```bash
git clone https://github.com/greyw0rks/paygate
cd paygate
npm install
```

### 2. Configure the agent

```bash
cp packages/agent/.env.example packages/agent/.env
```

Edit `packages/agent/.env`:

```env
HEDERA_ACCOUNT_ID=0.0.XXXXX
HEDERA_PRIVATE_KEY=0x...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: create a topic first with the Hedera Portal, then paste the ID here
# Without this, audit logging still works in-memory; HCS on-chain logging is skipped
HEDERA_AUDIT_TOPIC_ID=0.0.XXXXX
```

### 3. Configure the frontend

```bash
cp packages/web/.env.local.example packages/web/.env.local
```

Default `NEXT_PUBLIC_AGENT_URL=http://localhost:3001` — no changes needed for local dev.

### 4. Run

**Terminal 1 — Agent server:**
```bash
cd packages/agent
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd packages/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Creating an HCS Audit Topic

To enable on-chain logging, create a topic once using the Hedera Agent Kit or Portal:

```bash
# Using curl against your running agent (asks Claude to create it)
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a new topic called PayGate Audit Log", "role": "admin"}'
```

Copy the topic ID from the response and add it as `HEDERA_AUDIT_TOPIC_ID` in your `.env`.

---

## API

### `POST /api/chat`
```json
{ "message": "Transfer 3 HBAR to 0.0.5000001", "role": "intern" }
```
Response:
```json
{
  "response": "Transfer complete. Transaction ID: 0.0.12345@...",
  "role": "intern",
  "roleLabel": "🟡 Intern",
  "blocked": false
}
```

### `GET /api/audit`
Returns the last 50 audit entries (newest first).

### `GET /api/status`
Returns active policy config and daily spend summary per role.

---

## Project Structure

```
paygate/
├── packages/
│   ├── agent/                    # Node.js Express + Hedera Agent Kit
│   │   └── src/
│   │       ├── roles.ts               # Role definitions & limits
│   │       ├── policies/
│   │       │   ├── SpendingLimitPolicy.ts
│   │       │   ├── AllowlistPolicy.ts
│   │       │   └── CapabilityPolicy.ts
│   │       ├── hooks/
│   │       │   └── PaygateAuditHook.ts
│   │       ├── agent/
│   │       │   └── agentFactory.ts    # Toolkit builder per role
│   │       ├── routes/
│   │       │   └── chat.ts            # API routes
│   │       └── index.ts               # Express server
│   └── web/                      # Next.js frontend
│       └── app/
│           └── page.tsx              # Chat UI + audit panel
└── README.md
```

## Hedera Agent Kit v4 Features Used

- **`AbstractPolicy`** — base class for all three custom policies
- **`AbstractHook`** — base class for `PaygateAuditHook`
- **`HcsAuditTrailHook`** — built-in hook for on-chain HCS audit logging
- **`HederaLangchainToolkit`** — LangChain integration with explicit plugin loading
- **`AgentMode.AUTONOMOUS`** — full autonomous execution mode
- **Explicit plugin system** — only loads needed plugins (`coreAccountPlugin`, `coreConsensusPlugin`, etc.)
- **`context.hooks[]`** — hooks + policies injected per-role at runtime

## Tech Stack

| Layer | Tech |
|-------|------|
| Agent Kit | `@hashgraph/hedera-agent-kit` v4, `@hashgraph/hedera-agent-kit-langchain` |
| SDK | `@hiero-ledger/sdk` v2.85 |
| LLM | Claude Sonnet 4.6 via `@langchain/anthropic` |
| Agent Framework | LangGraph `createReactAgent` |
| Backend | Express + TypeScript |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |

## License

MIT
