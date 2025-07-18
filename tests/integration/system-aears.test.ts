import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseAearsFile } from '../../src/parser/file-parser.js';
import { ASTGenerator } from '../../src/ast/ast-generator.js';
import { RequirementType } from '../../src/types/ast-types.js';

describe('System.aears Integration Tests', () => {
  const systemAearsPath = join(process.cwd(), 'system.aears');
  const systemAearsContent = readFileSync(systemAearsPath, 'utf-8');
  
  it('should parse the complete system.aears file successfully', () => {
    const result = parseAearsFile(systemAearsContent);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.errors.length, 0);
    assert.ok(result.ast?.requirements);
    assert.ok(result.ast?.requirements.length > 0);
  });

  it('should identify all requirement types in system.aears', () => {
    const result = parseAearsFile(systemAearsContent);
    assert.strictEqual(result.success, true);
    
    const generator = new ASTGenerator();
    const stats = generator.getStatistics(result.ast!);
    
    // The system.aears file contains examples of UB, EV, ST, and OP
    assert.ok(stats[RequirementType.UB] > 0);
    assert.ok(stats[RequirementType.EV] > 0);
    assert.ok(stats[RequirementType.ST] > 0);
    assert.ok(stats[RequirementType.OP] > 0);
    // UW and HY are not present in the system.aears file
    assert.strictEqual(stats[RequirementType.UW], 0);
    assert.strictEqual(stats[RequirementType.HY], 0);
  });

  it('should extract all actors from system.aears', () => {
    const result = parseAearsFile(systemAearsContent);
    assert.strictEqual(result.success, true);
    
    const generator = new ASTGenerator();
    const actors = generator.extractActors(result.ast!);
    
    // Expected actors from the system.aears file
    assert.ok(actors.includes('parser'));
    assert.ok(actors.includes('language server'));
    assert.ok(actors.includes('extension'));
    assert.ok(actors.includes('generator'));
    assert.ok(actors.includes('cli'));
    assert.ok(actors.includes('error handler'));
    assert.ok(actors.includes('system'));
    assert.ok(actors.includes('file reader'));
    assert.ok(actors.includes('watcher'));
    assert.ok(actors.includes('output writer'));
    assert.ok(actors.includes('processor'));
    assert.ok(actors.includes('error reporter'));
    assert.ok(actors.includes('validation'));
  });

  it('should extract use cases from system.aears', () => {
    const result = parseAearsFile(systemAearsContent);
    assert.strictEqual(result.success, true);
    
    const generator = new ASTGenerator();
    const useCases = generator.extractUseCases(result.ast!);
    
    assert.ok(useCases.length > 0);
    
    // Check for some expected use cases
    const useCaseTexts = useCases.map(uc => uc.useCase);
    assert.ok(useCaseTexts.includes('tokenize aears files'));
    assert.ok(useCaseTexts.includes('generate AST from tokens'));
    assert.ok(useCaseTexts.includes('provide syntax validation'));
    assert.ok(useCaseTexts.includes('offer auto-completion'));
  });

  it('should handle specific requirement patterns from system.aears', () => {
    const result = parseAearsFile(systemAearsContent);
    assert.strictEqual(result.success, true);
    
    const requirements = result.ast?.requirements || [];
    
    // Check for specific requirements from system.aears
    const ubRequirements = requirements.filter(r => r.requirementType === RequirementType.UB);
    assert.ok(ubRequirements.some(r => r.entity === 'parser' && r.functionality === 'tokenize aears files'));
    
    const evRequirements = requirements.filter(r => r.requirementType === RequirementType.EV);
    assert.ok(evRequirements.some(r => 
      r.entity === 'parser' && 
      r.functionality === 'report error location' &&
      r.precondition === 'syntax error detected'
    ));
    
    const uwRequirements = requirements.filter(r => r.requirementType === RequirementType.UW);
    assert.strictEqual(uwRequirements.length, 0); // No UW requirements in system.aears
    
    const stRequirements = requirements.filter(r => r.requirementType === RequirementType.ST);
    assert.ok(stRequirements.some(r => 
      r.entity === 'error handler' && 
      r.functionality === 'collect issues' &&
      r.state === 'parsing active'
    ));
    
    const opRequirements = requirements.filter(r => r.requirementType === RequirementType.OP);
    assert.ok(opRequirements.some(r => 
      r.entity === 'parser' && 
      r.functionality === 'provide recovery suggestions' &&
      r.condition === 'malformed syntax'
    ));
  });

  it('should generate comprehensive statistics for system.aears', () => {
    const result = parseAearsFile(systemAearsContent);
    assert.strictEqual(result.success, true);
    
    const generator = new ASTGenerator();
    const stats = generator.getStatistics(result.ast!);
    
    const totalRequirements = Object.values(stats).reduce((sum, count) => sum + count, 0);
    assert.strictEqual(totalRequirements, result.ast?.requirements.length);
    
    // Verify we have a good distribution of requirement types
    assert.ok(stats[RequirementType.UB] > 5);
    assert.ok(stats[RequirementType.EV] > 3);
    assert.ok(stats[RequirementType.ST] > 1);
    assert.ok(stats[RequirementType.OP] > 3);
  });
});