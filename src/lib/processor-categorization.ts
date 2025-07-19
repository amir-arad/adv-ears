import { RequirementNode } from '../types/ast-types.js';

export class ProcessorCategorization {
  categorizeRequirement(req: RequirementNode, _context?: string): string {
    const entity = req.entity.toLowerCase();
    const functionality = req.functionality.toLowerCase();

    if (this.isSystemEntity(entity)) {
      return this.categorizeSystemRequirement(functionality);
    }

    if (entity.includes('user')) {
      return 'user-interface';
    }

    return 'business';
  }

  private isSystemEntity(entity: string): boolean {
    return entity.includes('system') || entity.includes('application');
  }

  private categorizeSystemRequirement(functionality: string): string {
    if (this.isSecurityFunctionality(functionality)) {
      return 'security';
    }
    if (this.isDataFunctionality(functionality)) {
      return 'data';
    }
    if (this.isUIFunctionality(functionality)) {
      return 'user-interface';
    }
    return 'system';
  }

  private isSecurityFunctionality(functionality: string): boolean {
    return (
      functionality.includes('authenticate') ||
      functionality.includes('login') ||
      functionality.includes('security')
    );
  }

  private isDataFunctionality(functionality: string): boolean {
    return (
      functionality.includes('store') ||
      functionality.includes('data') ||
      functionality.includes('save')
    );
  }

  private isUIFunctionality(functionality: string): boolean {
    return (
      functionality.includes('interface') ||
      functionality.includes('display') ||
      functionality.includes('show')
    );
  }
}
