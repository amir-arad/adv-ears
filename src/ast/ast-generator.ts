import {
  RequirementNode,
  DocumentNode,
  RequirementType,
} from '../types/ast-types.js';
import { CSTDocument, CSTRequirement } from '../types/cst-types.js';

export class ASTGenerator {
  // Convert CST to AST
  public generateAST(cst: CSTDocument): DocumentNode {
    const requirements: RequirementNode[] = [];

    if (cst.requirements) {
      for (const req of cst.requirements) {
        if (req && req.type === 'requirement') {
          requirements.push(this.convertRequirement(req));
        }
      }
    }

    return {
      type: 'document',
      requirements,
    };
  }

  private convertRequirement(req: CSTRequirement): RequirementNode {
    const baseNode: RequirementNode = {
      type: 'requirement',
      requirementType: req.requirementType,
      entity: req.entity,
      functionality: req.functionality,
    };

    // Add optional fields based on requirement type
    if (req.precondition) {
      baseNode.precondition = req.precondition;
    }

    if (req.state) {
      baseNode.state = req.state;
    }

    if (req.condition) {
      baseNode.condition = req.condition;
    }

    if (req.negated) {
      baseNode.negated = req.negated;
    }

    return baseNode;
  }

  // Helper method to extract actors from requirements
  public extractActors(ast: DocumentNode): string[] {
    const actors = new Set<string>();

    for (const req of ast.requirements) {
      // Simple heuristic: entity is the actor
      actors.add(req.entity);
    }

    return Array.from(actors);
  }

  // Helper method to extract use cases from requirements
  public extractUseCases(
    ast: DocumentNode
  ): Array<{ actor: string; useCase: string }> {
    const useCases: Array<{ actor: string; useCase: string }> = [];

    for (const req of ast.requirements) {
      useCases.push({
        actor: req.entity,
        useCase: req.functionality,
      });
    }

    return useCases;
  }

  // Helper method to get requirement statistics
  public getStatistics(ast: DocumentNode): Record<RequirementType, number> {
    const stats: Record<RequirementType, number> = {
      [RequirementType.UB]: 0,
      [RequirementType.EV]: 0,
      [RequirementType.UW]: 0,
      [RequirementType.ST]: 0,
      [RequirementType.OP]: 0,
      [RequirementType.HY]: 0,
    };

    for (const req of ast.requirements) {
      stats[req.requirementType]++;
    }

    return stats;
  }
}
