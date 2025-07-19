import {
  ProcessingInput,
  ProcessingOptions,
  BatchResult,
  StreamCallback,
} from '../types/library-types.js';
import { BatchCore } from './batch-core.js';
import { BatchStream } from './batch-stream.js';

export class BatchProcessor {
  private batchCore: BatchCore;
  private batchStream: BatchStream;

  constructor() {
    this.batchCore = new BatchCore();
    this.batchStream = new BatchStream();
  }

  processBatch(
    inputs: (string | ProcessingInput)[],
    options?: ProcessingOptions
  ): BatchResult[] {
    return this.batchCore.processBatch(inputs, options);
  }

  processStream(
    inputs: (string | ProcessingInput)[],
    callback: StreamCallback,
    options?: ProcessingOptions
  ): void {
    this.batchStream.processStream(inputs, callback, options);
  }

  processBatchAsync(
    inputs: (string | ProcessingInput)[],
    options?: ProcessingOptions,
    concurrency = 3
  ): Promise<BatchResult[]> {
    return this.batchCore.processBatchAsync(inputs, options, concurrency);
  }
}
