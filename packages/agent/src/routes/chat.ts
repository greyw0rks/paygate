import { Router, type Request, type Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';

import { buildClientFromEnv, buildToolkitForRole, buildSystemPrompt } from '../agent/agentFactory.js';
import { type Role, ROLE_POLICIES } from '../roles.js';
import { getAuditLog, recordBlockedAction } from '../hooks/PaygateAuditHook.js';
import { getDailySpendSummary } from '../policies/SpendingLimitPolicy.js';

const router = Router();

let hederaClient: ReturnType<typeof buildClientFromEnv> | null = null;
function getClient() {
  if (!hederaClient) hederaClient = buildClientFromEnv();
  return hederaClient;
}

function isValidRole(r: unknown): r is Role {
  return r === 'intern' || r === 'manager' || r === 'admin';
}

// POST /api/chat
router.post('/chat', async (req: Request, res: Response) => {
  const { message, role } = req.body as { message?: string; role?: string };

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const activeRole: Role = isValidRole(role) ? role : 'intern';

  try {
    const client = getClient();
    const toolkit = buildToolkitForRole(activeRole, client);

    // HederaAgentKitTool extends StructuredTool — cast needed because
    // the toolkit's bundled @langchain/core types differ from ours at the type level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = toolkit.getTools() as any[];

    // Build a pre-configured Anthropic client with a custom fetch that injects
    // the user-agent required by the DashScope proxy endpoint.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patchedFetch = async (url: any, init?: any) => {
      const headers = new Headers(init?.headers);
      headers.set('user-agent', 'claude-code/1.2.0');
      return globalThis.fetch(url, { ...init, headers });
    };

    const anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetch: patchedFetch as any,
    });

    const llm = new ChatAnthropic({
      model: process.env.LLM_MODEL ?? 'qwen3-coder-plus',
      temperature: 0,
      createClient: () => anthropicClient,
    });

    const agent = createReactAgent({
      llm,
      tools,
      prompt: buildSystemPrompt(activeRole),
    });

    const result = await agent.invoke({
      messages: [new HumanMessage(message)],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const content =
      typeof lastMessage.content === 'string'
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    return res.json({
      response: content,
      role: activeRole,
      roleLabel: ROLE_POLICIES[activeRole].label,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const isPolicy =
      errMsg.includes('[SpendingLimitPolicy]') ||
      errMsg.includes('[AllowlistPolicy]') ||
      errMsg.includes('[CapabilityPolicy]');

    if (isPolicy) {
      recordBlockedAction(activeRole, 'tool', errMsg);
      return res.json({
        response: `❌ **Policy Violation**\n\n${errMsg}`,
        role: activeRole,
        roleLabel: ROLE_POLICIES[activeRole].label,
        blocked: true,
      });
    }

    console.error('[/api/chat error]', errMsg);
    return res.status(500).json({ error: errMsg });
  }
});

// GET /api/audit
router.get('/audit', (_req: Request, res: Response) => {
  return res.json({ entries: getAuditLog().slice(0, 50) });
});

// GET /api/status
router.get('/status', (_req: Request, res: Response) => {
  const roles: Role[] = ['intern', 'manager', 'admin'];
  const status = Object.fromEntries(
    roles.map(r => [r, {
      policy: ROLE_POLICIES[r],
      dailySpend: getDailySpendSummary(r),
    }])
  );
  return res.json({
    status,
    auditTopicId: process.env.HEDERA_AUDIT_TOPIC_ID ?? null,
  });
});

export default router;
