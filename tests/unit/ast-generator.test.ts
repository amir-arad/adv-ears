import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ASTGenerator } from '../../src/ast/ast-generator.js';
import { parseAearsFile } from '../../src/parser/file-parser.js';
import { RequirementType } from '../../src/types/ast-types.js';

describe('ASTGenerator', () => {
  const generator = new ASTGenerator();

  it('should extract actors from requirements', () => {
    const input = `The parser shall tokenize aears files
The language server shall provide syntax validation
The extension shall register aears file association`;
    
    const result = parseAearsFile(input);
    assert.strictEqual(result.success, true);
    
    const actors = generator.extractActors(result.ast!);
    assert.ok(actors.includes('parser'));
    assert.ok(actors.includes('language server'));
    assert.ok(actors.includes('extension'));
    assert.strictEqual(actors.length, 3);
  });

  it('should extract use cases from requirements', () => {
    const input = `The parser shall tokenize aears files
The language server shall provide syntax validation`;
    
    const result = parseAearsFile(input);
    assert.strictEqual(result.success, true);
    
    const useCases = generator.extractUseCases(result.ast!);
    assert.strictEqual(useCases.length, 2);
    
    assert.deepStrictEqual(useCases[0], {
      actor: 'parser',
      useCase: 'tokenize aears files'
    });
    
    assert.deepStrictEqual(useCases[1], {
      actor: 'language server',
      useCase: 'provide syntax validation'
    });
  });

  it('should generate requirement statistics', () => {
    const input = `The parser shall tokenize aears files
When syntax error detected the parser shall report error location
The parser shall not crash on malformed input
While parsing active the error handler shall collect issues
If malformed syntax then the parser shall provide recovery suggestions`;
    
    const result = parseAearsFile(input);
    assert.strictEqual(result.success, true);
    
    const stats = generator.getStatistics(result.ast!);
    assert.strictEqual(stats[RequirementType.UB], 1);
    assert.strictEqual(stats[RequirementType.EV], 1);
    assert.strictEqual(stats[RequirementType.UW], 1);
    assert.strictEqual(stats[RequirementType.ST], 1);
    assert.strictEqual(stats[RequirementType.OP], 1);
    assert.strictEqual(stats[RequirementType.HY], 0);
  });

  it('should handle empty AST', () => {
    const emptyAST = {
      type: 'document' as const,
      requirements: []
    };
    
    const actors = generator.extractActors(emptyAST);
    const useCases = generator.extractUseCases(emptyAST);
    const stats = generator.getStatistics(emptyAST);
    
    assert.strictEqual(actors.length, 0);
    assert.strictEqual(useCases.length, 0);
    assert.strictEqual(stats[RequirementType.UB], 0);
    assert.strictEqual(stats[RequirementType.EV], 0);
    assert.strictEqual(stats[RequirementType.UW], 0);
    assert.strictEqual(stats[RequirementType.ST], 0);
    assert.strictEqual(stats[RequirementType.OP], 0);
    assert.strictEqual(stats[RequirementType.HY], 0);
  });
});