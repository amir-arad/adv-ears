import {
  ConfigurationError,
  ProcessingError,
  ProcessingInput,
  ValidationErrorDetails,
  ValidationResult,
  ValidationWarning,
} from '../types/library-types.js';

import { RequirementNode } from '../types/ast-types.js';
import { parseAearsFile } from '../parser/file-parser.js';
import { ValidatorHelpers } from './validator-helpers.js';

export class LibraryValidator {
  private helpers: ValidatorHelpers;

  constructor() {
    this.helpers = new ValidatorHelpers();
  }

  validateRequirement(requirement: string | RequirementNode): ValidationResult {
    try {
      const errors: ValidationErrorDetails[] = [];
      const warnings: ValidationWarning[] = [];

      if (typeof requirement === 'string') {
        // Parse single requirement
        const parseResult = parseAearsFile(requirement.trim());

        if (!parseResult.success) {
          errors.push({
            message: 'Failed to parse requirement',
            details: parseResult.errors.join('; '),
          });
          return { valid: false, errors, warnings };
        }

        if (parseResult.ast!.requirements.length === 0) {
          errors.push({
            message: 'No valid requirements found',
            details: 'Input does not contain recognizable AEARS patterns',
          });
          return { valid: false, errors, warnings };
        }

        if (parseResult.ast!.requirements.length > 1) {
          warnings.push({
            message: 'Multiple requirements found, validating first one only',
            suggestion:
              'Split into separate validation calls for each requirement',
          });
        }

        const req = parseResult.ast!.requirements[0];
        this.helpers.validateRequirementNode(req, errors, warnings);
      } else {
        // Validate requirement node directly
        this.helpers.validateRequirementNode(requirement, errors, warnings);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      throw new ProcessingError(
        'Error during requirement validation',
        error as Error
      );
    }
  }

  validateInput(input: string | ProcessingInput): boolean {
    try {
      const text = typeof input === 'string' ? input : input.text;

      if (!text || text.trim().length === 0) {
        return false;
      }

      const parseResult = parseAearsFile(text);
      return parseResult.success && parseResult.ast!.requirements.length > 0;
    } catch {
      return false;
    }
  }

  validateConfiguration(config: Record<string, unknown>): void {
    const invalidFields: string[] = [];
    const errors: string[] = [];

    // Basic validation - simplified to reduce complexity
    this.validateBasicFields(config, invalidFields, errors);

    if (errors.length > 0) {
      throw new ConfigurationError(
        `Configuration validation failed: ${errors.join(', ')}`,
        invalidFields
      );
    }
  }

  private validateBasicFields(
    config: Record<string, unknown>,
    invalidFields: string[],
    errors: string[]
  ): void {
    if (
      config.defaultDomains !== undefined &&
      !Array.isArray(config.defaultDomains)
    ) {
      invalidFields.push('defaultDomains');
      errors.push('defaultDomains must be an array');
    }

    if (
      config.maxCacheSize !== undefined &&
      (typeof config.maxCacheSize !== 'number' || config.maxCacheSize < 0)
    ) {
      invalidFields.push('maxCacheSize');
      errors.push('maxCacheSize must be a non-negative number');
    }

    if (
      config.enableStreaming !== undefined &&
      typeof config.enableStreaming !== 'boolean'
    ) {
      invalidFields.push('enableStreaming');
      errors.push('enableStreaming must be a boolean');
    }
  }
}
