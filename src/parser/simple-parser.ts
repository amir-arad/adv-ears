import {
  RequirementType,
  RequirementNode,
  DocumentNode,
} from '../types/ast-types.js';

export class SimpleParser {
  // Simple regex-based parser for Phase 1 MVP
  parseDocument(content: string): DocumentNode {
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);
    const requirements: RequirementNode[] = [];

    for (const line of lines) {
      const requirement = this.parseRequirement(line);
      if (requirement) {
        requirements.push(requirement);
      }
    }

    return {
      type: 'document',
      requirements,
    };
  }

  private parseRequirement(line: string): RequirementNode | null {
    // Try each pattern in order

    // EV: When <preconditions> the <entity> shall <functionality>
    let match = line.match(/^When\s+(.+?)\s+the\s+(.+?)\s+shall\s+(.+)$/i);
    if (match) {
      return {
        type: 'requirement',
        requirementType: RequirementType.EV,
        entity: match[2],
        functionality: match[3],
        precondition: match[1],
      };
    }

    // ST: While <state> the <entity> shall <functionality>
    match = line.match(/^While\s+(.+?)\s+the\s+(.+?)\s+shall\s+(.+)$/i);
    if (match) {
      return {
        type: 'requirement',
        requirementType: RequirementType.ST,
        entity: match[2],
        functionality: match[3],
        state: match[1],
      };
    }

    // OP: If <condition> then the <entity> shall <functionality>
    match = line.match(/^If\s+(.+?)\s+then\s+the\s+(.+?)\s+shall\s+(.+)$/i);
    if (match) {
      return {
        type: 'requirement',
        requirementType: RequirementType.OP,
        entity: match[2],
        functionality: match[3],
        condition: match[1],
      };
    }

    // OP: Where <condition> the <entity> shall <functionality>
    match = line.match(/^Where\s+(.+?)\s+the\s+(.+?)\s+shall\s+(.+)$/i);
    if (match) {
      return {
        type: 'requirement',
        requirementType: RequirementType.OP,
        entity: match[2],
        functionality: match[3],
        condition: match[1],
      };
    }

    // UW: The <entity> shall not <functionality>
    match = line.match(/^The\s+(.+?)\s+shall\s+not\s+(.+)$/i);
    if (match) {
      return {
        type: 'requirement',
        requirementType: RequirementType.UW,
        entity: match[1],
        functionality: match[2],
        negated: true,
      };
    }

    // UB: The <entity> shall <functionality>
    match = line.match(/^The\s+(.+?)\s+shall\s+(.+)$/i);
    if (match) {
      return {
        type: 'requirement',
        requirementType: RequirementType.UB,
        entity: match[1],
        functionality: match[2],
      };
    }

    // If no pattern matches, throw an error for malformed input
    throw new Error(`Malformed requirement: ${line}`);
  }
}
