import {
  AbstractPolicy,
  type PreToolExecutionParams,
} from '@hashgraph/hedera-agent-kit';
import type { Role, RolePolicy } from '../roles.js';

export class CapabilityPolicy extends AbstractPolicy {
  name = 'Capability Policy';
  description: string;
  relevantTools: string[];

  private role: Role;

  constructor(role: Role, rolePolicy: RolePolicy) {
    super();
    this.role = role;

    const blocked: string[] = [];
    if (!rolePolicy.canCreateTokens) {
      blocked.push(
        'create_fungible_token_tool',
        'create_non_fungible_token_tool',
        'create_erc20_tool',
        'create_erc721_tool',
      );
    }
    if (!rolePolicy.canMintTokens) {
      blocked.push(
        'mint_fungible_token_tool',
        'mint_non_fungible_token_tool',
        'mint_erc721_tool',
      );
    }
    if (!rolePolicy.canCreateTopics) {
      blocked.push('create_topic_tool');
    }

    this.relevantTools = blocked;
    this.description =
      blocked.length === 0
        ? `${rolePolicy.label}: full capabilities`
        : `${rolePolicy.label}: ${blocked.length} tool(s) restricted`;
  }

  protected override shouldBlockPreToolExecution(
    _params: PreToolExecutionParams,
    method: string
  ): boolean | Promise<boolean> {
    if (this.relevantTools.includes(method)) {
      throw new Error(
        `[CapabilityPolicy] Blocked: role "${this.role}" does not have permission to use "${method}". ` +
        `This action requires a higher privilege level.`
      );
    }
    return false;
  }
}
