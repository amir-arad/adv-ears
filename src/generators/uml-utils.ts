import {
  DocumentNode,
  RequirementNode,
  RequirementType,
} from '../types/ast-types.js';

/**
 * Sanitizes text for PlantUML compatibility
 */
export function sanitizeForPlantUML(text: string): string {
  return text
    .replace(/"/g, '\\"') // Escape quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r'); // Escape carriage returns
}

/**
 * Creates an alias for an actor name suitable for PlantUML
 */
export function actorAlias(actorName: string): string {
  return actorName.replace(/[^a-zA-Z0-9]/g, '_').replace(/^([0-9])/, '_$1'); // Prefix with underscore if starts with number
}

/**
 * Determines the PlantUML relationship type for a requirement
 */
export function getRelationshipType(requirement: RequirementNode): string {
  switch (requirement.requirementType) {
    case RequirementType.UB:
      return '-->'; // Basic functionality
    case RequirementType.EV:
      return '..>'; // Event-driven (dashed)
    case RequirementType.UW:
      return '--x'; // Unwanted behavior (blocked)
    case RequirementType.ST:
      return '==>'; // State-based (bold)
    case RequirementType.OP:
      return '-.>'; // Conditional (dash-dot)
    case RequirementType.HY:
      return '-->'; // Hybrid (default)
    default:
      return '-->';
  }
}

/**
 * Extracts unique actors from the AST
 */
export function extractActors(ast: DocumentNode): string[] {
  const actors = new Set<string>();
  ast.requirements.forEach(req => {
    if (req.entity) {
      actors.add(req.entity);
    }
  });
  return Array.from(actors);
}

/**
 * Extracts use cases (actor-action pairs) from the AST
 */
export function extractUseCases(
  ast: DocumentNode
): Array<{ actor: string; useCase: string }> {
  const useCases: Array<{ actor: string; useCase: string }> = [];
  ast.requirements.forEach(req => {
    if (req.entity && req.functionality) {
      useCases.push({
        actor: req.entity,
        useCase: req.functionality,
      });
    }
  });
  return useCases;
}

/**
 * Gets statistics about requirement types in the AST
 */
export function getStatistics(
  ast: DocumentNode
): Record<RequirementType, number> {
  const stats: Record<RequirementType, number> = {
    UB: 0,
    EV: 0,
    UW: 0,
    ST: 0,
    OP: 0,
    HY: 0,
  };

  ast.requirements.forEach(req => {
    stats[req.requirementType]++;
  });

  return stats;
}
