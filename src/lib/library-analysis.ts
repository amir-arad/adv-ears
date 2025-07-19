import {
  ExtractionResult,
  QualityReport,
  CoverageReport,
  CacheStats,
} from '../types/library-types.js';
import { LibraryAnalyzer } from './analyzer.js';

export class LibraryAnalysis {
  private analyzer: LibraryAnalyzer;

  constructor() {
    this.analyzer = new LibraryAnalyzer();
  }

  // Analysis
  analyzeQuality(result: ExtractionResult): QualityReport {
    return this.analyzer.analyzeQuality(result);
  }

  analyzeCoverage(result: ExtractionResult): CoverageReport {
    return this.analyzer.analyzeCoverage(result);
  }

  // Cache management
  enableCache(maxSize?: number): void {
    this.analyzer.enableCache(maxSize);
  }

  clearCache(): void {
    this.analyzer.clearCache();
  }

  getCacheStats(): CacheStats {
    return this.analyzer.getCacheStats();
  }
}
