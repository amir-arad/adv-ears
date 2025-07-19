import {
  ExtractionResult,
  CacheStats,
  ProcessingOptions,
} from '../types/library-types.js';

interface CacheEntry {
  key: string;
  result: ExtractionResult;
  timestamp: number;
}

export class CacheAnalyzer {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheEnabled = false;
  private maxCacheSize = 100;
  private cacheHits = 0;
  private cacheMisses = 0;

  enableCache(maxSize = 100): void {
    this.cacheEnabled = true;
    this.maxCacheSize = maxSize;
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  getCacheStats(): CacheStats {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? this.cacheHits / total : 0;

    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate,
    };
  }

  getCachedResult(key: string): ExtractionResult | null {
    if (!this.cacheEnabled) {
      return null;
    }

    const entry = this.cache.get(key);
    if (entry) {
      this.cacheHits++;
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      return entry.result;
    }

    this.cacheMisses++;
    return null;
  }

  setCachedResult(key: string, result: ExtractionResult): void {
    if (!this.cacheEnabled) {
      return;
    }

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.findOldestCacheKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      key,
      result,
      timestamp: Date.now(),
    });
  }

  private findOldestCacheKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  generateCacheKey(input: string, options?: ProcessingOptions): string {
    const optionsStr = options ? JSON.stringify(options) : '';
    return `${input.length}_${input.slice(0, 50)}_${optionsStr}`.replace(
      /\s+/g,
      '_'
    );
  }
}
