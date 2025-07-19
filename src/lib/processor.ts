import {
  ExtractionResult,
  ProcessedRequirement,
  ProcessingError,
  ProcessingInput,
  ProcessingOptions,
} from '../types/library-types.js';

import { RequirementNode } from '../types/ast-types.js';
import { parseAearsFile } from '../parser/file-parser.js';
import { ProcessorHelpers } from './processor-helpers.js';

export class LibraryProcessor {
  private helpers: ProcessorHelpers;

  constructor() {
    this.helpers = new ProcessorHelpers();
  }

  processRequirements(
    input: string | ProcessingInput,
    options?: ProcessingOptions
  ): ExtractionResult {
    try {
      // Normalize input
      const text = typeof input === 'string' ? input : input.text;
      const context = typeof input === 'object' ? input.context : undefined;
      const metadata = typeof input === 'object' ? input.metadata : undefined;

      // Parse the AEARS content
      const parseResult = parseAearsFile(text);

      if (!parseResult.success) {
        throw new ProcessingError('Failed to parse AEARS content', undefined, {
          errors: parseResult.errors,
        });
      }

      const ast = parseResult.ast!;

      // Process requirements
      let requirements = this.processAST(ast, context, metadata);

      // Apply filters if specified
      if (options?.domains) {
        requirements = this.helpers.filterByDomains(
          requirements,
          options.domains
        );
      }

      if (options?.maxRequirements) {
        requirements = requirements.slice(0, options.maxRequirements);
      }

      // Generate groups, metrics, and coverage
      const groups = this.helpers.generateGroups(requirements);
      const metrics = this.helpers.calculateMetrics(requirements);
      const coverage = this.helpers.calculateCoverage(
        requirements,
        options?.domains
      );

      return {
        requirements,
        groups,
        metrics,
        coverage,
      };
    } catch (error) {
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError(
        'Unexpected error during processing',
        error as Error
      );
    }
  }

  private processAST(
    ast: { requirements: RequirementNode[] },
    context?: string,
    _metadata?: Record<string, unknown>
  ): ProcessedRequirement[] {
    const requirements: ProcessedRequirement[] = [];

    for (let i = 0; i < ast.requirements.length; i++) {
      const req = ast.requirements[i];

      const processed: ProcessedRequirement = {
        id: this.helpers.generateId(i),
        pattern: this.helpers.mapRequirementTypeToPattern(req.requirementType),
        trigger: this.helpers.extractTrigger(req),
        response: req.functionality,
        category: this.helpers.categorizeRequirement(req, context),
        priority: this.helpers.calculatePriority(req),
        confidence: this.helpers.calculateConfidence(req),
        original: req,
      };

      requirements.push(processed);
    }

    return requirements;
  }
}
