import {
  ValidationErrorDetails,
  ValidationWarning,
} from '../types/library-types.js';
import { RequirementNode, RequirementType } from '../types/ast-types.js';
import { ValidatorQuality } from './validator-quality.js';

export class ValidatorHelpers {
  private quality: ValidatorQuality;

  constructor() {
    this.quality = new ValidatorQuality();
  }

  validateRequirementNode(
    req: RequirementNode,
    errors: ValidationErrorDetails[],
    warnings: ValidationWarning[]
  ): void {
    // Validate basic fields
    this.validateBasicFields(req, errors, warnings);

    // Validate pattern-specific fields
    this.validatePatternSpecificFields(req, errors);

    // Quality checks
    this.quality.checkWeakLanguage(req, warnings);
    this.quality.checkBriefDescription(req, warnings);
    this.quality.checkAmbiguousTerms(req, warnings);
  }

  private validateBasicFields(
    req: RequirementNode,
    errors: ValidationErrorDetails[],
    warnings: ValidationWarning[]
  ): void {
    // Validate entity
    if (!req.entity || req.entity.trim().length === 0) {
      errors.push({
        message: 'Missing entity',
        details: 'Requirements must specify an entity (actor or system)',
      });
    } else if (req.entity.length < 3) {
      warnings.push({
        message: 'Entity name is very short',
        suggestion: 'Consider using more descriptive entity names',
      });
    }

    // Validate functionality
    if (!req.functionality || req.functionality.trim().length === 0) {
      errors.push({
        message: 'Missing functionality',
        details: 'Requirements must specify what the entity shall do',
      });
    } else if (req.functionality.length < 10) {
      warnings.push({
        message: 'Functionality description is very brief',
        suggestion: 'Consider adding more detail to clarify the requirement',
      });
    }
  }

  private validatePatternSpecificFields(
    req: RequirementNode,
    errors: ValidationErrorDetails[]
  ): void {
    switch (req.requirementType) {
      case RequirementType.EV:
        if (!req.precondition) {
          errors.push({
            message: 'Event-driven requirement missing precondition',
            details: 'EV patterns must specify "When [precondition]"',
          });
        }
        break;

      case RequirementType.ST:
        if (!req.state) {
          errors.push({
            message: 'State-driven requirement missing state condition',
            details: 'ST patterns must specify "While [state]"',
          });
        }
        break;

      case RequirementType.OP:
        if (!req.condition) {
          errors.push({
            message: 'Option requirement missing condition',
            details:
              'OP patterns must specify "If [condition]" or "Where [condition]"',
          });
        }
        break;
    }
  }
}
