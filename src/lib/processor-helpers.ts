import {
  ProcessedRequirement,
  QualityMetrics,
  RequirementGroup,
  CoverageReport,
  SUPPORTED_DOMAINS,
  PATTERN_TYPES,
} from '../types/library-types.js';
import { RequirementType, RequirementNode } from '../types/ast-types.js';
import { ProcessorCategorization } from './processor-categorization.js';

export class ProcessorHelpers {
  private categorization: ProcessorCategorization;

  constructor() {
    this.categorization = new ProcessorCategorization();
  }

  generateId(index: number): string {
    return `req_${String(index + 1).padStart(3, '0')}`;
  }

  mapRequirementTypeToPattern(type: RequirementType): string {
    return type.toString();
  }

  extractTrigger(req: RequirementNode): string | undefined {
    if (req.precondition) {
      return req.precondition;
    }
    if (req.condition) {
      return req.condition;
    }
    if (req.state) {
      return req.state;
    }
    return undefined;
  }

  categorizeRequirement(req: RequirementNode, context?: string): string {
    return this.categorization.categorizeRequirement(req, context);
  }

  calculatePriority(req: RequirementNode): 'low' | 'medium' | 'high' {
    // Simple priority calculation
    if (req.requirementType === RequirementType.UW) {
      return 'high';
    } // Unwanted behavior is high priority
    if (req.requirementType === RequirementType.EV) {
      return 'medium';
    } // Event-driven is medium
    return 'low'; // Default
  }

  calculateConfidence(req: RequirementNode): number {
    // Simple confidence calculation based on completeness
    let confidence = 0.5; // base confidence

    if (req.entity && req.functionality) {
      confidence += 0.3;
    }
    if (req.precondition || req.condition || req.state) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  filterByDomains(
    requirements: ProcessedRequirement[],
    domains: string[]
  ): ProcessedRequirement[] {
    return requirements.filter(req => domains.includes(req.category));
  }

  generateGroups(requirements: ProcessedRequirement[]): RequirementGroup[] {
    const groups: Record<string, ProcessedRequirement[]> = {};

    // Group by category
    for (const req of requirements) {
      if (!groups[req.category]) {
        groups[req.category] = [];
      }
      groups[req.category].push(req);
    }

    return Object.entries(groups).map(([category, reqs]) => ({
      name: category,
      requirements: reqs.map(r => r.id),
      theme: this.generateTheme(category, reqs),
    }));
  }

  private generateTheme(
    category: string,
    requirements: ProcessedRequirement[]
  ): string {
    // Simple theme generation based on most common patterns
    const patterns = requirements.map(r => r.pattern);
    const patternCounts = patterns.reduce(
      (acc, pattern) => {
        acc[pattern] = (acc[pattern] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommon = Object.entries(patternCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return `${category}-${mostCommon?.[0] || 'mixed'}`;
  }

  calculateMetrics(requirements: ProcessedRequirement[]): QualityMetrics {
    const totalRequirements = requirements.length;
    const validRequirements = requirements.filter(
      r => r.confidence > 0.5
    ).length;
    const averageConfidence =
      requirements.reduce((sum, r) => sum + r.confidence, 0) /
        totalRequirements || 0;

    const patternDistribution = requirements.reduce(
      (acc, req) => {
        acc[req.pattern] = (acc[req.pattern] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const qualityScore =
      (validRequirements / totalRequirements) * averageConfidence;

    return {
      totalRequirements,
      validRequirements,
      averageConfidence,
      patternDistribution,
      qualityScore,
    };
  }

  calculateCoverage(
    requirements: ProcessedRequirement[],
    requestedDomains?: string[]
  ): CoverageReport {
    const domains = requestedDomains || SUPPORTED_DOMAINS.slice();
    const patterns = PATTERN_TYPES.slice();

    // Calculate domain coverage
    const domainCoverage: Record<string, number> = {};
    for (const domain of domains) {
      const domainReqs = requirements.filter(r => r.category === domain);
      domainCoverage[domain] = (domainReqs.length / requirements.length) * 100;
    }

    // Calculate pattern coverage
    const patternCoverage: Record<string, number> = {};
    for (const pattern of patterns) {
      const patternReqs = requirements.filter(r => r.pattern === pattern);
      patternCoverage[pattern] =
        (patternReqs.length / requirements.length) * 100;
    }

    const overallCoverage =
      Object.values(domainCoverage).reduce((sum, cov) => sum + cov, 0) /
      domains.length;

    return {
      domainCoverage,
      patternCoverage,
      overallCoverage,
    };
  }
}
