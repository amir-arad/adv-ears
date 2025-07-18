import { DocumentNode, RequirementNode, RequirementType } from '../types/ast-types.js';

export interface UMLGeneratorOptions {
  includeTitle?: boolean;
  includeStatistics?: boolean;
  includeRelationships?: boolean;
}

export class UMLGenerator {
  
  public generatePlantUML(ast: DocumentNode, options: UMLGeneratorOptions = {}): string {
    const {
      includeTitle = true,
      includeStatistics = false,
      includeRelationships = true
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
    const actors = this.extractActors(ast);
    const useCases = this.extractUseCases(ast);
    
    // Define actors
    if (actors.length > 0) {
      lines.push('!-- Actors --');
      for (const actor of actors) {
        lines.push(`actor "${this.sanitizeForPlantUML(actor)}" as ${this.actorAlias(actor)}`);
      }
      lines.push('');
    }

    // Define use cases
    if (useCases.length > 0) {
      lines.push('!-- Use Cases --');
      for (let i = 0; i < useCases.length; i++) {
        const useCase = useCases[i];
        const useCaseAlias = `UC${i + 1}`;
        lines.push(`usecase "${this.sanitizeForPlantUML(useCase.useCase)}" as ${useCaseAlias}`);
      }
      lines.push('');
    }

    // Define relationships
    if (includeRelationships && useCases.length > 0) {
      lines.push('!-- Relationships --');
      for (let i = 0; i < useCases.length; i++) {
        const useCase = useCases[i];
        const useCaseAlias = `UC${i + 1}`;
        const actorAlias = this.actorAlias(useCase.actor);
        
        // Determine relationship type based on requirement type
        const requirement = ast.requirements[i];
        const relationshipType = this.getRelationshipType(requirement);
        
        lines.push(`${actorAlias} ${relationshipType} ${useCaseAlias}`);
      }
      lines.push('');
    }

    // Add statistics as notes if requested
    if (includeStatistics) {
      const stats = this.getStatistics(ast);
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

  private extractActors(ast: DocumentNode): string[] {
    const actors = new Set<string>();
    
    for (const req of ast.requirements) {
      actors.add(req.entity);
    }
    
    return Array.from(actors).sort();
  }

  private extractUseCases(ast: DocumentNode): Array<{actor: string, useCase: string}> {
    const useCases: Array<{actor: string, useCase: string}> = [];
    
    for (const req of ast.requirements) {
      useCases.push({
        actor: req.entity,
        useCase: req.functionality
      });
    }
    
    return useCases;
  }

  private getStatistics(ast: DocumentNode): Record<RequirementType, number> {
    const stats: Record<RequirementType, number> = {
      [RequirementType.UB]: 0,
      [RequirementType.EV]: 0,
      [RequirementType.UW]: 0,
      [RequirementType.ST]: 0,
      [RequirementType.OP]: 0,
      [RequirementType.HY]: 0
    };

    for (const req of ast.requirements) {
      stats[req.requirementType]++;
    }

    return stats;
  }

  private sanitizeForPlantUML(text: string): string {
    // Escape special characters for PlantUML
    return text
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  private actorAlias(actorName: string): string {
    // Create a valid PlantUML alias from actor name
    return actorName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^([0-9])/, '_$1'); // Prefix with underscore if starts with number
  }

  private getRelationshipType(requirement: RequirementNode): string {
    // Determine relationship arrow based on requirement type
    switch (requirement.requirementType) {
      case RequirementType.UB:
        return '-->';  // Basic functionality
      case RequirementType.EV:
        return '..>';  // Event-driven (dashed)
      case RequirementType.UW:
        return '--x';  // Unwanted behavior (blocked)
      case RequirementType.ST:
        return '==>';  // State-based (bold)
      case RequirementType.OP:
        return '-.>';  // Conditional (dash-dot)
      case RequirementType.HY:
        return '-->';  // Hybrid (default)
      default:
        return '-->';
    }
  }

  // Generate detailed text report
  public generateReport(ast: DocumentNode): string {
    const lines: string[] = [];
    
    lines.push('=== EARS Requirements Analysis Report ===');
    lines.push('');
    
    // Summary statistics
    const stats = this.getStatistics(ast);
    const totalRequirements = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
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
    const actors = this.extractActors(ast);
    lines.push(`Actors Identified: ${actors.length}`);
    actors.forEach(actor => {
      lines.push(`  - ${actor}`);
    });
    lines.push('');
    
    // Use cases
    const useCases = this.extractUseCases(ast);
    lines.push(`Use Cases Identified: ${useCases.length}`);
    useCases.forEach((useCase, index) => {
      lines.push(`  ${index + 1}. ${useCase.actor} -> ${useCase.useCase}`);
    });
    lines.push('');
    
    return lines.join('\n');
  }
}