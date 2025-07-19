import {
  ProcessingInput,
  ProcessingOptions,
  ExtractionResult,
  StreamCallback,
  ProcessedRequirement,
} from '../types/library-types.js';
import { LibraryProcessor } from './processor.js';
import { LibraryAnalyzer } from './analyzer.js';

export class BatchStream {
  private processor: LibraryProcessor;
  private analyzer: LibraryAnalyzer;

  constructor() {
    this.processor = new LibraryProcessor();
    this.analyzer = new LibraryAnalyzer();
  }

  processStream(
    inputs: (string | ProcessingInput)[],
    callback: StreamCallback,
    options?: ProcessingOptions
  ): void {
    const totalInputs = inputs.length;
    let processedCount = 0;
    const allResults: ExtractionResult[] = [];

    // Process each input and invoke callback with partial results
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];

      try {
        const cacheKey = this.analyzer.generateCacheKey(
          typeof input === 'string' ? input : input.text,
          options
        );

        let result = this.analyzer.getCachedResult(cacheKey);

        if (!result) {
          result = this.processor.processRequirements(input, options);
          this.analyzer.setCachedResult(cacheKey, result);
        }

        allResults.push(result);
        processedCount++;

        // Create partial result combining all processed so far
        const partialResult = this.combineResults(allResults);

        // Invoke callback with partial result
        const isComplete = processedCount === totalInputs;
        callback(partialResult, isComplete);
      } catch (error) {
        processedCount++;

        // For streaming, we continue processing other inputs even if one fails
        // The callback receives the partial results from successful processing
        const partialResult =
          allResults.length > 0
            ? this.combineResults(allResults)
            : this.createEmptyResult();

        const isComplete = processedCount === totalInputs;
        callback(partialResult, isComplete);
      }
    }
  }

  private combineResults(results: ExtractionResult[]): ExtractionResult {
    if (results.length === 0) {
      return this.createEmptyResult();
    }

    if (results.length === 1) {
      return results[0];
    }

    const combinedRequirements = results.flatMap(r => r.requirements);
    const combinedGroups = results.flatMap(r => r.groups);
    const metrics = this.combineMetrics(combinedRequirements);
    const coverage = this.combineCoverage(results);

    return {
      requirements: combinedRequirements,
      groups: combinedGroups,
      metrics,
      coverage,
    };
  }

  private combineMetrics(combinedRequirements: ProcessedRequirement[]) {
    const totalRequirements = combinedRequirements.length;
    const validRequirements = combinedRequirements.filter(
      r => r.confidence > 0.5
    ).length;
    const averageConfidence =
      totalRequirements > 0
        ? combinedRequirements.reduce((sum, r) => sum + r.confidence, 0) /
          totalRequirements
        : 0;

    const patternDistribution = combinedRequirements.reduce(
      (acc, req) => {
        acc[req.pattern] = (acc[req.pattern] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const qualityScore =
      totalRequirements > 0
        ? (validRequirements / totalRequirements) * averageConfidence
        : 0;

    return {
      totalRequirements,
      validRequirements,
      averageConfidence,
      patternDistribution,
      qualityScore,
    };
  }

  private combineCoverage(results: ExtractionResult[]) {
    const domainCoverage: Record<string, number> = {};
    const patternCoverage: Record<string, number> = {};

    for (const result of results) {
      this.mergeCoverageData(
        result.coverage.domainCoverage,
        domainCoverage,
        results.length
      );
      this.mergeCoverageData(
        result.coverage.patternCoverage,
        patternCoverage,
        results.length
      );
    }

    const overallCoverage =
      Object.keys(domainCoverage).length > 0
        ? Object.values(domainCoverage).reduce((sum, cov) => sum + cov, 0) /
          Object.keys(domainCoverage).length
        : 0;

    return {
      domainCoverage,
      patternCoverage,
      overallCoverage,
    };
  }

  private mergeCoverageData(
    sourceCoverage: Record<string, number>,
    targetCoverage: Record<string, number>,
    resultCount: number
  ): void {
    for (const [key, coverage] of Object.entries(sourceCoverage)) {
      targetCoverage[key] = (targetCoverage[key] || 0) + coverage / resultCount;
    }
  }

  private createEmptyResult(): ExtractionResult {
    return {
      requirements: [],
      groups: [],
      metrics: {
        totalRequirements: 0,
        validRequirements: 0,
        averageConfidence: 0,
        patternDistribution: {},
        qualityScore: 0,
      },
      coverage: {
        domainCoverage: {},
        patternCoverage: {},
        overallCoverage: 0,
      },
    };
  }
}
