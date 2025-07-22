import {
  DocumentNode,
  RequirementNode,
  RequirementType,
} from '../types/ast-types.js';

export class SimpleParser {
  // Simple regex-based parser for Phase 1 MVP
  parseDocument(content: string): {
    ast: DocumentNode;
    errors: { line: number; message: string }[];
  } {
    const lines = content.split('\n');
    const requirements: RequirementNode[] = [];
    const errors: { line: number; message: string }[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      try {
        const requirement = this.parseRequirement(trimmed);
        if (requirement) {
          requirements.push({
            ...requirement,
            location: { line: index + 1, column: 1 },
          });
        } else {
          errors.push({
            line: index + 1,
            message: `Malformed requirement: ${trimmed}`,
          });
        }
      } catch (error) {
        errors.push({
          line: index + 1,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    const ast: DocumentNode = {
      type: 'document',
      requirements,
    };

    return { ast, errors };
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

    // If no pattern matches, return null (error handled in parseDocument)
    return null;
  }
}
