import { RequirementNode } from './ast-types.js';

// Input types
export interface ProcessingInput {
  text: string;
  context?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessingOptions {
  domains?: string[];
  maxRequirements?: number;
  minQuality?: number;
  outputFormat?: 'json' | 'structured' | 'markdown';
}

// Result types
export interface ExtractionResult {
  requirements: ProcessedRequirement[];
  groups: RequirementGroup[];
  metrics: QualityMetrics;
  coverage: CoverageReport;
}

export interface ProcessedRequirement {
  id: string;
  pattern: string;
  trigger?: string;
  response: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  original: RequirementNode;
}

export interface RequirementGroup {
  name: string;
  requirements: string[]; // requirement IDs
  theme: string;
}

export interface QualityMetrics {
  totalRequirements: number;
  validRequirements: number;
  averageConfidence: number;
  patternDistribution: Record<string, number>;
  qualityScore: number;
}

export interface CoverageReport {
  domainCoverage: Record<string, number>; // percentages
  patternCoverage: Record<string, number>;
  overallCoverage: number;
}

export interface QualityReport extends QualityMetrics {
  recommendations: string[];
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'warning' | 'error';
  message: string;
  requirementId?: string;
  severity: 'low' | 'medium' | 'high';
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetails[];
  warnings: ValidationWarning[];
}

export interface ValidationErrorDetails {
  message: string;
  details?: string;
  line?: number;
  column?: number;
}

export interface ValidationWarning {
  message: string;
  suggestion?: string;
  line?: number;
}

// Batch processing types
export interface BatchResult {
  input: string | ProcessingInput;
  result?: ExtractionResult;
  error?: ProcessingError;
  index: number;
}

export type StreamCallback = (
  _result: Partial<ExtractionResult>,
  _isComplete: boolean
) => void;

// Cache types
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

// Configuration types
export interface LibraryConfiguration {
  defaultDomains: string[];
  maxCacheSize: number;
  enableStreaming: boolean;
  qualityThreshold: number;
  outputFormat: 'json' | 'structured' | 'markdown';
}

// Error types
export class ProcessingError extends Error {
  public override readonly cause?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ProcessingError';
    this.cause = cause;
    this.context = context;
  }
}

export class ValidationError extends Error {
  public readonly details?: string;
  public readonly line?: number;
  public readonly column?: number;

  constructor(
    message: string,
    details?: string,
    line?: number,
    column?: number
  ) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.line = line;
    this.column = column;
  }
}

export class ConfigurationError extends Error {
  public readonly invalidFields: string[];

  constructor(message: string, invalidFields: string[] = []) {
    super(message);
    this.name = 'ConfigurationError';
    this.invalidFields = invalidFields;
  }
}

// Constants
export const SUPPORTED_DOMAINS = [
  'system',
  'user-interface',
  'security',
  'performance',
  'data',
  'integration',
  'business',
  'technical',
] as const;

export const PATTERN_TYPES = [
  'UB', // Ubiquitous
  'EV', // Event-driven
  'UW', // Unwanted
  'ST', // State-driven
  'OP', // Optional/Conditional
  'HY', // Hybrid
] as const;
