import {
  BatchResult,
  CacheStats,
  CoverageReport,
  ExtractionResult,
  LibraryConfiguration,
  ProcessingInput,
  ProcessingOptions,
  QualityReport,
  StreamCallback,
  ValidationResult,
} from './types/library-types.js';

import { BatchProcessor } from './lib/batch-processor.js';
import { ConfigurationManager } from './lib/config.js';
import { LibraryAnalysis } from './lib/library-analysis.js';
import { LibraryCore } from './lib/library-core.js';
import { LibraryExporter } from './lib/exporter.js';
import { RequirementNode } from './types/ast-types.js';

// Re-export error types and constants
export {
  ProcessingError,
  ValidationError,
  ConfigurationError,
  SUPPORTED_DOMAINS,
  PATTERN_TYPES,
} from './types/library-types.js';

export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;

// Re-export essential types for TypeScript
export type {
  ProcessingInput,
  ProcessingOptions,
  ValidationResult,
  LibraryConfiguration,
  ExtractionResult,
  QualityReport,
  CoverageReport,
  BatchResult,
  StreamCallback,
  CacheStats,
} from './types/library-types.js';

export type {
  RequirementNode,
  RequirementType,
  ASTNode,
} from './types/ast-types.js';

/**
 * Main AEARS Library class providing comprehensive requirements processing capabilities.
 *
 * @example
 * ```typescript
 * import { AEARSLibrary } from 'adv-ears';
 *
 * const library = new AEARSLibrary();
 * const result = library.processRequirements("The system shall process requests");
 * const markdown = library.exportToMarkdown(result);
 * ```
 */
export class AEARSLibrary {
  private core: LibraryCore;
  private analysis: LibraryAnalysis;
  private exporter: LibraryExporter;
  private batchProcessor: BatchProcessor;
  private configManager: ConfigurationManager;

  constructor() {
    this.core = new LibraryCore();
    this.analysis = new LibraryAnalysis();
    this.exporter = new LibraryExporter();
    this.batchProcessor = new BatchProcessor();
    this.configManager = new ConfigurationManager();
  }

  // Core processing methods
  processRequirements(
    input: string | ProcessingInput,
    options?: ProcessingOptions
  ): ExtractionResult {
    return this.core.processRequirements(input, options);
  }

  // Validation methods
  validateRequirement(requirement: string | RequirementNode): ValidationResult {
    return this.core.validateRequirement(requirement);
  }

  validateInput(input: string | ProcessingInput): boolean {
    return this.core.validateInput(input);
  }

  // Analysis methods
  analyzeQuality(result: ExtractionResult): QualityReport {
    return this.analysis.analyzeQuality(result);
  }

  analyzeCoverage(result: ExtractionResult): CoverageReport {
    return this.analysis.analyzeCoverage(result);
  }

  // Export methods
  exportToMarkdown(result: ExtractionResult): string {
    return this.exporter.exportToMarkdown(result);
  }

  exportToJSON(result: ExtractionResult, pretty = true): string {
    return this.exporter.exportToJSON(result, pretty);
  }

  exportToCSV(result: ExtractionResult): string {
    return this.exporter.exportToCSV(result);
  }

  exportToStructured(result: ExtractionResult): string {
    return this.exporter.exportToStructured(result);
  }

  exportToXML(result: ExtractionResult): string {
    return this.exporter.exportToXML(result);
  }

  // Batch processing methods
  processBatch(
    inputs: (string | ProcessingInput)[],
    options?: ProcessingOptions
  ): BatchResult[] {
    return this.batchProcessor.processBatch(inputs, options);
  }

  processStream(
    inputs: (string | ProcessingInput)[],
    callback: StreamCallback,
    options?: ProcessingOptions
  ): void {
    this.batchProcessor.processStream(inputs, callback, options);
  }

  processBatchAsync(
    inputs: (string | ProcessingInput)[],
    options?: ProcessingOptions,
    concurrency = 3
  ): Promise<BatchResult[]> {
    return this.batchProcessor.processBatchAsync(inputs, options, concurrency);
  }

  // Cache management methods
  enableCache(maxSize?: number): void {
    this.analysis.enableCache(maxSize);
  }

  clearCache(): void {
    this.analysis.clearCache();
  }

  getCacheStats(): CacheStats {
    return this.analysis.getCacheStats();
  }

  // Configuration methods
  setConfiguration(config: Partial<LibraryConfiguration>): void {
    this.configManager.setConfiguration(config);
  }

  getConfiguration(): LibraryConfiguration {
    return this.configManager.getConfiguration();
  }

  resetConfiguration(): void {
    this.configManager.resetConfiguration();
  }
}
