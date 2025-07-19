import {
  actorAlias,
  extractActors,
  extractUseCases,
  getRelationshipType,
  getStatistics,
  sanitizeForPlantUML,
} from './uml-utils.js';

import { DocumentNode } from '../types/ast-types.js';

interface UMLGeneratorOptions {
  includeTitle?: boolean;
  includeStatistics?: boolean;
  includeRelationships?: boolean;
}

export class UMLGenerator {
  public generatePlantUML(
    ast: DocumentNode,
    options: UMLGeneratorOptions = {}
  ): string {
    const {
      includeTitle = true,
      includeStatistics = false,
      includeRelationships = true,
    } = options;

    const lines: string[] = [];

    // Start PlantUML use case diagram
    lines.push('@startuml');
    lines.push('');

    if (includeTitle) {
      lines.push('title Requirements Use Case Diagram');
      lines.push('');
    }

    // Extract actors and use cases
    const actors = extractActors(ast);
    const useCases = extractUseCases(ast);

    // Define actors
    if (actors.length > 0) {
      lines.push('!-- Actors --');
      for (const actor of actors) {
        lines.push(
          `actor "${sanitizeForPlantUML(actor)}" as ${actorAlias(actor)}`
        );
      }
      lines.push('');
    }

    // Define use cases
    if (useCases.length > 0) {
      lines.push('!-- Use Cases --');
      for (let i = 0; i < useCases.length; i++) {
        const useCase = useCases[i];
        const useCaseAlias = `UC${i + 1}`;
        lines.push(
          `usecase "${sanitizeForPlantUML(useCase.useCase)}" as ${useCaseAlias}`
        );
      }
      lines.push('');
    }

    // Define relationships
    if (includeRelationships && useCases.length > 0) {
      lines.push('!-- Relationships --');
      for (let i = 0; i < useCases.length; i++) {
        const useCase = useCases[i];
        const useCaseAlias = `UC${i + 1}`;
        const actorAliasName = actorAlias(useCase.actor);

        // Determine relationship type based on requirement type
        const requirement = ast.requirements[i];
        const relationshipType = getRelationshipType(requirement);

        lines.push(`${actorAliasName} ${relationshipType} ${useCaseAlias}`);
      }
      lines.push('');
    }

    // Add statistics as notes if requested
    if (includeStatistics) {
      const stats = getStatistics(ast);
      lines.push('!-- Statistics --');
      lines.push('note right');
      lines.push('Requirements Statistics:');
      Object.entries(stats).forEach(([type, count]) => {
        if (count > 0) {
          lines.push(`${type}: ${count}`);
        }
      });
      lines.push('end note');
      lines.push('');
    }

    // End PlantUML
    lines.push('@enduml');

    return lines.join('\n');
  }

  // Generate detailed text report
  public generateReport(ast: DocumentNode): string {
    const lines: string[] = [];

    lines.push('=== EARS Requirements Analysis Report ===');
    lines.push('');

    // Summary statistics
    const stats = getStatistics(ast);
    const totalRequirements = Object.values(stats).reduce(
      (sum, count) => sum + count,
      0
    );

    lines.push(`Total Requirements: ${totalRequirements}`);
    lines.push('');

    lines.push('Requirements by Type:');
    Object.entries(stats).forEach(([type, count]) => {
      if (count > 0) {
        lines.push(`  ${type}: ${count}`);
      }
    });
    lines.push('');

    // Actors
    const actors = extractActors(ast);
    lines.push(`Actors Identified: ${actors.length}`);
    actors.forEach(actor => {
      lines.push(`  - ${actor}`);
    });
    lines.push('');

    // Use cases
    const useCases = extractUseCases(ast);
    lines.push(`Use Cases Identified: ${useCases.length}`);
    useCases.forEach((useCase, index) => {
      lines.push(`  ${index + 1}. ${useCase.actor} -> ${useCase.useCase}`);
    });
    lines.push('');

    return lines.join('\n');
  }
}
