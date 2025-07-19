/* eslint-disable no-unused-vars */
export enum RequirementType {
  UB = 'UB', // Ubiquitous - The <entity> shall <functionality>
  EV = 'EV', // Event-driven - When <preconditions> the <entity> shall <functionality>
  UW = 'UW', // Unwanted behavior - The <entity> shall not <functionality>
  ST = 'ST', // State-driven - While <state> the <entity> shall <functionality>
  OP = 'OP', // Optional - If <condition> then the <entity> shall <functionality>
  HY = 'HY', // Hybrid - Complex conditional statements
}

export interface ASTNode {
  type: string;
  location?: {
    line: number;
    column: number;
  };
}

export interface RequirementNode extends ASTNode {
  type: 'requirement';
  requirementType: RequirementType;
  entity: string;
  functionality: string;
  precondition?: string;
  state?: string;
  condition?: string;
  negated?: boolean;
}

export interface DocumentNode extends ASTNode {
  type: 'document';
  requirements: RequirementNode[];
}
