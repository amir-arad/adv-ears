import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseAearsFile } from '../../src/parser/file-parser.js';
import { RequirementType } from '../../src/types/ast-types.js';

describe('EarsParser', () => {
  
  it('should parse UB requirements correctly', () => {
    const input = 'The parser shall tokenize aears files';
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 1);
    
    const req = result.ast?.requirements[0];
    assert.strictEqual(req?.requirementType, RequirementType.UB);
    assert.strictEqual(req?.entity, 'parser');
    assert.strictEqual(req?.functionality, 'tokenize aears files');
  });

  it('should parse EV requirements correctly', () => {
    const input = 'When syntax error detected the parser shall report error location';
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 1);
    
    const req = result.ast?.requirements[0];
    assert.strictEqual(req?.requirementType, RequirementType.EV);
    assert.strictEqual(req?.entity, 'parser');
    assert.strictEqual(req?.functionality, 'report error location');
    assert.strictEqual(req?.precondition, 'syntax error detected');
  });

  it('should parse UW requirements correctly', () => {
    const input = 'The parser shall not crash on malformed input';
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 1);
    
    const req = result.ast?.requirements[0];
    assert.strictEqual(req?.requirementType, RequirementType.UW);
    assert.strictEqual(req?.entity, 'parser');
    assert.strictEqual(req?.functionality, 'crash on malformed input');
    assert.strictEqual(req?.negated, true);
  });

  it('should parse ST requirements correctly', () => {
    const input = 'While parsing active the error handler shall collect issues';
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 1);
    
    const req = result.ast?.requirements[0];
    assert.strictEqual(req?.requirementType, RequirementType.ST);
    assert.strictEqual(req?.entity, 'error handler');
    assert.strictEqual(req?.functionality, 'collect issues');
    assert.strictEqual(req?.state, 'parsing active');
  });

  it('should parse OP requirements correctly', () => {
    const input = 'If malformed syntax then the parser shall provide recovery suggestions';
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 1);
    
    const req = result.ast?.requirements[0];
    assert.strictEqual(req?.requirementType, RequirementType.OP);
    assert.strictEqual(req?.entity, 'parser');
    assert.strictEqual(req?.functionality, 'provide recovery suggestions');
    assert.strictEqual(req?.condition, 'malformed syntax');
  });

  it('should parse WHERE-based OP requirements correctly', () => {
    const input = 'Where multiple files the processor shall handle batch operations';
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 1);
    
    const req = result.ast?.requirements[0];
    assert.strictEqual(req?.requirementType, RequirementType.OP);
    assert.strictEqual(req?.entity, 'processor');
    assert.strictEqual(req?.functionality, 'handle batch operations');
    assert.strictEqual(req?.condition, 'multiple files');
  });

  it('should handle multiple requirements', () => {
    const input = `The parser shall tokenize aears files
When syntax error detected the parser shall report error location
The parser shall not crash on malformed input`;
    
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 3);
    
    const [ub, ev, uw] = result.ast?.requirements || [];
    assert.strictEqual(ub.requirementType, RequirementType.UB);
    assert.strictEqual(ev.requirementType, RequirementType.EV);
    assert.strictEqual(uw.requirementType, RequirementType.UW);
  });

  it('should handle malformed input gracefully', () => {
    const input = 'This is not a valid requirement';
    const result = parseAearsFile(input);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errors.length, 1);
    assert.ok(result.errors[0].includes('Malformed requirement'));
  });

  it('should handle empty input', () => {
    const result = parseAearsFile('');
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.ast?.requirements.length, 0);
  });
});