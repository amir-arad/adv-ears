import { RequirementType } from './ast-types.js';

// CST (Concrete Syntax Tree) types for the parser output
export interface CSTRequirement {
  type: 'requirement';
  requirementType: RequirementType;
  entity: string;
  functionality: string;
  precondition?: string;
  state?: string;
  condition?: string;
  negated?: boolean;
}

export interface CSTDocument {
  type: 'document';
  requirements: CSTRequirement[];
}
