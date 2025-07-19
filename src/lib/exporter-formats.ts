import {
  ExtractionResult,
  ProcessedRequirement,
  QualityMetrics,
  CoverageReport,
} from '../types/library-types.js';

export class ExporterFormats {
  formatAsJSON(result: ExtractionResult, pretty = false): string {
    return JSON.stringify(result, null, pretty ? 2 : 0);
  }

  formatAsStructured(result: ExtractionResult): string {
    const sections: string[] = [];

    // Summary section
    sections.push('## Summary');
    sections.push(`Total Requirements: ${result.requirements.length}`);
    sections.push(`Quality Score: ${result.metrics.qualityScore.toFixed(2)}`);
    sections.push(
      `Overall Coverage: ${result.coverage.overallCoverage.toFixed(1)}%`
    );
    sections.push('');

    // Requirements section
    sections.push('## Requirements');
    for (const req of result.requirements) {
      sections.push(`### ${req.id} (${req.pattern})`);
      sections.push(`**Category:** ${req.category}`);
      sections.push(`**Priority:** ${req.priority}`);
      sections.push(`**Confidence:** ${(req.confidence * 100).toFixed(0)}%`);
      if (req.trigger) {
        sections.push(`**Trigger:** ${req.trigger}`);
      }
      sections.push(`**Response:** ${req.response}`);
      sections.push('');
    }

    // Groups section
    sections.push('## Groups');
    for (const group of result.groups) {
      sections.push(`### ${group.name} (${group.theme})`);
      sections.push(`Requirements: ${group.requirements.join(', ')}`);
      sections.push('');
    }

    return sections.join('\n');
  }

  formatAsMarkdown(result: ExtractionResult): string {
    const sections: string[] = [];

    sections.push('# Requirements Analysis Report');
    sections.push('');

    // Executive Summary
    sections.push('## Executive Summary');
    sections.push(this.generateExecutiveSummary(result));
    sections.push('');

    // Quality Metrics
    sections.push('## Quality Metrics');
    sections.push(this.formatQualityMetrics(result.metrics));
    sections.push('');

    // Coverage Analysis
    sections.push('## Coverage Analysis');
    sections.push(this.formatCoverageReport(result.coverage));
    sections.push('');

    // Detailed Requirements
    sections.push('## Detailed Requirements');
    sections.push(this.formatDetailedRequirements(result.requirements));
    sections.push('');

    // Groups Analysis
    if (result.groups.length > 0) {
      sections.push('## Requirements Groups');
      sections.push(this.formatGroupsAnalysis(result.groups));
      sections.push('');
    }

    return sections.join('\n');
  }

  private generateExecutiveSummary(result: ExtractionResult): string {
    const totalReqs = result.requirements.length;
    const validReqs = result.metrics.validRequirements;
    const qualityScore = result.metrics.qualityScore;
    const coverage = result.coverage.overallCoverage;

    const summary = [
      `This analysis covers ${totalReqs} requirements with an overall quality score of ${qualityScore.toFixed(2)}.`,
      `${validReqs} requirements (${((validReqs / totalReqs) * 100).toFixed(0)}%) meet quality thresholds.`,
      `Domain coverage stands at ${coverage.toFixed(1)}%, indicating ${coverage > 80 ? 'comprehensive' : coverage > 60 ? 'adequate' : 'limited'} coverage.`,
    ];

    return summary.join(' ');
  }

  private formatQualityMetrics(metrics: QualityMetrics): string {
    const lines = [
      `- **Total Requirements:** ${metrics.totalRequirements}`,
      `- **Valid Requirements:** ${metrics.validRequirements}`,
      `- **Average Confidence:** ${(metrics.averageConfidence * 100).toFixed(1)}%`,
      `- **Overall Quality Score:** ${metrics.qualityScore.toFixed(2)}`,
      '',
      '### Pattern Distribution',
    ];

    for (const [pattern, count] of Object.entries(
      metrics.patternDistribution
    )) {
      const percentage = ((count / metrics.totalRequirements) * 100).toFixed(1);
      lines.push(`- **${pattern}:** ${count} (${percentage}%)`);
    }

    return lines.join('\n');
  }

  private formatCoverageReport(coverage: CoverageReport): string {
    const lines = [
      `**Overall Coverage:** ${coverage.overallCoverage.toFixed(1)}%`,
      '',
      '### Domain Coverage',
    ];

    for (const [domain, percentage] of Object.entries(
      coverage.domainCoverage
    )) {
      lines.push(`- **${domain}:** ${percentage.toFixed(1)}%`);
    }

    lines.push('');
    lines.push('### Pattern Coverage');

    for (const [pattern, percentage] of Object.entries(
      coverage.patternCoverage
    )) {
      lines.push(`- **${pattern}:** ${percentage.toFixed(1)}%`);
    }

    return lines.join('\n');
  }

  private formatDetailedRequirements(
    requirements: ProcessedRequirement[]
  ): string {
    const lines: string[] = [];

    // Group requirements by category for better organization
    const grouped = requirements.reduce(
      (acc, req) => {
        if (!acc[req.category]) {
          acc[req.category] = [];
        }
        acc[req.category].push(req);
        return acc;
      },
      {} as Record<string, ProcessedRequirement[]>
    );

    for (const [category, reqs] of Object.entries(grouped)) {
      lines.push(
        `### ${category.charAt(0).toUpperCase() + category.slice(1)} Requirements`
      );
      lines.push('');

      for (const req of reqs) {
        lines.push(`#### ${req.id}`);
        lines.push(`**Pattern:** ${req.pattern}`);
        lines.push(`**Priority:** ${req.priority}`);
        lines.push(`**Confidence:** ${(req.confidence * 100).toFixed(0)}%`);
        if (req.trigger) {
          lines.push(`**Trigger:** ${req.trigger}`);
        }
        lines.push(`**Response:** ${req.response}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private formatGroupsAnalysis(
    groups: { name: string; theme: string; requirements: string[] }[]
  ): string {
    const lines: string[] = [];

    for (const group of groups) {
      lines.push(`### ${group.name}`);
      lines.push(`**Theme:** ${group.theme}`);
      lines.push(`**Requirements:** ${group.requirements.length}`);
      lines.push(`**Members:** ${group.requirements.join(', ')}`);
      lines.push('');
    }

    return lines.join('\n');
  }
}
