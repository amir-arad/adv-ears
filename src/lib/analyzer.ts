import {
  ExtractionResult,
  QualityReport,
  CoverageReport,
  CacheStats,
  ProcessingOptions,
} from '../types/library-types.js';

import { QualityAnalyzer } from './analyzer-quality.js';
import { CacheAnalyzer } from './analyzer-cache.js';

export class LibraryAnalyzer {
  private qualityAnalyzer: QualityAnalyzer;
  private cacheAnalyzer: CacheAnalyzer;

  constructor() {
    this.qualityAnalyzer = new QualityAnalyzer();
    this.cacheAnalyzer = new CacheAnalyzer();
  }

  analyzeQuality(result: ExtractionResult): QualityReport {
    const metrics = result.metrics;
    const requirements = result.requirements;

    const issues = this.qualityAnalyzer.identifyQualityIssues(requirements);
    const recommendations = this.qualityAnalyzer.generateRecommendations(
      metrics,
      requirements
    );

    return {
      ...metrics,
      recommendations,
      issues,
    };
  }

  analyzeCoverage(result: ExtractionResult): CoverageReport {
    return result.coverage;
  }

  enableCache(maxSize = 100): void {
    this.cacheAnalyzer.enableCache(maxSize);
  }

  clearCache(): void {
    this.cacheAnalyzer.clearCache();
  }

  getCacheStats(): CacheStats {
    return this.cacheAnalyzer.getCacheStats();
  }

  getCachedResult(key: string): ExtractionResult | null {
    return this.cacheAnalyzer.getCachedResult(key);
  }

  setCachedResult(key: string, result: ExtractionResult): void {
    this.cacheAnalyzer.setCachedResult(key, result);
  }

  generateCacheKey(input: string, options?: ProcessingOptions): string {
    return this.cacheAnalyzer.generateCacheKey(input, options);
  }
}
