import { ValidationWarning } from '../types/library-types.js';
import { RequirementNode } from '../types/ast-types.js';

export class ValidatorQuality {
  checkWeakLanguage(req: RequirementNode, warnings: ValidationWarning[]): void {
    if (
      req.functionality.includes('should') ||
      req.functionality.includes('could')
    ) {
      warnings.push({
        message: 'Weak requirement language detected',
        suggestion:
          'Replace "should" or "could" with "shall" for stronger requirements',
      });
    }
  }

  checkBriefDescription(
    req: RequirementNode,
    warnings: ValidationWarning[]
  ): void {
    if (req.functionality.split(' ').length < 3) {
      warnings.push({
        message: 'Very brief functionality description',
        suggestion: 'Add more detail to make the requirement clearer',
      });
    }
  }

  checkAmbiguousTerms(
    req: RequirementNode,
    warnings: ValidationWarning[]
  ): void {
    const ambiguousTerms = [
      'appropriate',
      'reasonable',
      'efficient',
      'user-friendly',
    ];
    const foundAmbiguous = ambiguousTerms.filter(term =>
      req.functionality.toLowerCase().includes(term)
    );

    if (foundAmbiguous.length > 0) {
      warnings.push({
        message: `Ambiguous terms detected: ${foundAmbiguous.join(', ')}`,
        suggestion: 'Replace with specific, measurable criteria',
      });
    }
  }
}
