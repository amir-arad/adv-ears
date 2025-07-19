import {
  ProcessingInput,
  ProcessingOptions,
  ExtractionResult,
  ValidationResult,
} from '../types/library-types.js';
import { RequirementNode } from '../types/ast-types.js';
import { LibraryProcessor } from './processor.js';
import { LibraryValidator } from './validator.js';

export class LibraryCore {
  private processor: LibraryProcessor;
  private validator: LibraryValidator;

  constructor() {
    this.processor = new LibraryProcessor();
    this.validator = new LibraryValidator();
  }

  // Core processing
  processRequirements(
    input: string | ProcessingInput,
    options?: ProcessingOptions
  ): ExtractionResult {
    return this.processor.processRequirements(input, options);
  }

  // Validation
  validateRequirement(requirement: string | RequirementNode): ValidationResult {
    return this.validator.validateRequirement(requirement);
  }

  validateInput(input: string | ProcessingInput): boolean {
    return this.validator.validateInput(input);
  }
}
