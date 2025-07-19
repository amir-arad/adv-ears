import {
  ProcessingInput,
  ProcessingOptions,
  BatchResult,
  ProcessingError,
} from '../types/library-types.js';
import { LibraryProcessor } from './processor.js';
import { LibraryAnalyzer } from './analyzer.js';

export class BatchCore {
  private processor: LibraryProcessor;
  private analyzer: LibraryAnalyzer;

  constructor() {
    this.processor = new LibraryProcessor();
    this.analyzer = new LibraryAnalyzer();
  }

  processBatch(
    inputs: (string | ProcessingInput)[],
    options?: ProcessingOptions
  ): BatchResult[] {
    const results: BatchResult[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const batchResult: BatchResult = {
        input,
        index: i,
      };

      try {
        // Check cache first if enabled
        const cacheKey = this.analyzer.generateCacheKey(
          typeof input === 'string' ? input : input.text,
          options
        );

        let result = this.analyzer.getCachedResult(cacheKey);

        if (!result) {
          result = this.processor.processRequirements(input, options);
          this.analyzer.setCachedResult(cacheKey, result);
        }

        batchResult.result = result;
      } catch (error) {
        batchResult.error =
          error instanceof ProcessingError
            ? error
            : new ProcessingError(
                `Error processing batch item ${i}`,
                error as Error,
                { batchIndex: i }
              );
      }

      results.push(batchResult);
    }

    return results;
  }

  processBatchAsync(
    inputs: (string | ProcessingInput)[],
    options?: ProcessingOptions,
    concurrency = 3
  ): Promise<BatchResult[]> {
    return new Promise(resolve => {
      const results: BatchResult[] = new Array(inputs.length);
      let completed = 0;
      let index = 0;

      const processNext = () => {
        if (index >= inputs.length) {
          return;
        }

        const currentIndex = index++;
        const input = inputs[currentIndex];

        // Simulate async processing with setTimeout
        setTimeout(() => {
          const batchResult: BatchResult = {
            input,
            index: currentIndex,
          };

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

            batchResult.result = result;
          } catch (error) {
            batchResult.error =
              error instanceof ProcessingError
                ? error
                : new ProcessingError(
                    `Error processing async batch item ${currentIndex}`,
                    error as Error,
                    { batchIndex: currentIndex }
                  );
          }

          results[currentIndex] = batchResult;
          completed++;

          if (completed === inputs.length) {
            resolve(results);
          } else {
            processNext();
          }
        }, Math.random() * 100); // Simulate variable processing time
      };

      // Start initial concurrent processes
      for (let i = 0; i < Math.min(concurrency, inputs.length); i++) {
        processNext();
      }
    });
  }
}
