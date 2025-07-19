import {
  QualityIssue,
  ProcessedRequirement,
  QualityMetrics,
} from '../types/library-types.js';

export class QualityAnalyzer {
  identifyQualityIssues(requirements: ProcessedRequirement[]): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for low confidence requirements
    const lowConfidenceReqs = requirements.filter(r => r.confidence < 0.5);
    if (lowConfidenceReqs.length > 0) {
      issues.push({
        type: 'warning',
        message: `${lowConfidenceReqs.length} requirements have low confidence scores`,
        severity: 'medium',
      });
    }

    // Check for pattern distribution imbalance
    const patternCounts = requirements.reduce(
      (acc, req) => {
        acc[req.pattern] = (acc[req.pattern] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalRequirements = requirements.length;
    const dominantPattern = Object.entries(patternCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (dominantPattern && dominantPattern[1] / totalRequirements > 0.7) {
      issues.push({
        type: 'warning',
        message: `Over 70% of requirements use ${dominantPattern[0]} pattern`,
        severity: 'low',
      });
    }

    // Check for missing critical patterns
    const hasSecurityRequirements = requirements.some(
      r =>
        r.category === 'security' ||
        r.response.toLowerCase().includes('security') ||
        r.response.toLowerCase().includes('authenticate')
    );

    if (!hasSecurityRequirements && totalRequirements > 5) {
      issues.push({
        type: 'warning',
        message: 'No security-related requirements detected',
        severity: 'high',
      });
    }

    // Check for vague requirements
    const vageRequirements = requirements.filter(
      r => r.response.length < 20 || r.response.split(' ').length < 3
    );

    if (vageRequirements.length > totalRequirements * 0.3) {
      issues.push({
        type: 'warning',
        message: 'Many requirements appear to be vague or incomplete',
        severity: 'medium',
      });
    }

    return issues;
  }

  generateRecommendations(
    metrics: QualityMetrics,
    requirements: ProcessedRequirement[]
  ): string[] {
    const recommendations: string[] = [];

    // Quality score recommendations
    if (metrics.qualityScore < 0.6) {
      recommendations.push(
        'Consider reviewing and refining requirements to improve overall quality score'
      );
    }

    // Pattern diversity recommendations
    const patternCount = Object.keys(metrics.patternDistribution).length;
    if (patternCount < 3 && requirements.length > 10) {
      recommendations.push(
        'Consider using more diverse requirement patterns (UB, EV, UW, ST, OP) for comprehensive coverage'
      );
    }

    // Confidence recommendations
    if (metrics.averageConfidence < 0.7) {
      recommendations.push(
        'Review requirements with low confidence scores and add more specific details'
      );
    }

    // Category coverage recommendations
    const categories = new Set(requirements.map(r => r.category));
    if (categories.size < 3 && requirements.length > 15) {
      recommendations.push(
        'Consider adding requirements across more functional domains for better coverage'
      );
    }

    // Priority distribution recommendations
    const priorityCounts = requirements.reduce(
      (acc, req) => {
        acc[req.priority] = (acc[req.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (
      priorityCounts.high &&
      priorityCounts.high / requirements.length > 0.5
    ) {
      recommendations.push(
        'Consider reviewing priority assignments - too many high-priority requirements may indicate unclear prioritization'
      );
    }

    if (!priorityCounts.high) {
      recommendations.push(
        'Consider identifying critical requirements and marking them as high priority'
      );
    }

    return recommendations;
  }
}
