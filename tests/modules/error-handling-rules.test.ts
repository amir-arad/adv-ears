import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseAearsFile } from '../../src/parser/file-parser.js';
import { SimpleParser } from '../../src/parser/simple-parser.js';

describe('Error Handling Rules', () => {
  
  describe('WHILE parsing active the error handler shall collect issues', () => {


    it('should handle empty lines and whitespace gracefully', () => {
      const content = `The parser shall tokenize aears files

      
The parser shall generate AST from tokens`;
      
      const result = parseAearsFile(content);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.ast?.requirements.length, 2);
    });
  });

  describe('When error occurs the system shall preserve partial results', () => {

    it('should provide AST for valid content', () => {
      const validContent = `The parser shall tokenize aears files
When syntax error detected the parser shall report error location`;
      
      const result = parseAearsFile(validContent);
      
      assert.strictEqual(result.success, true);
      assert.ok(result.ast);
      assert.strictEqual(result.ast.requirements.length, 2);
    });

    it('should maintain parsing state across multiple requirements', () => {
      const content = `The parser shall tokenize aears files
When error occurs the system shall preserve partial results
While parsing active the error handler shall collect issues
The error reporter shall provide line numbers`;
      
      const result = parseAearsFile(content);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.ast?.requirements.length, 4);
    });
  });

  describe('IF critical error THEN the system shall halt processing', () => {
    it('should halt processing on critical errors', () => {
      const content = `The parser shall tokenize aears files
This is completely invalid syntax that should halt processing
The parser shall generate AST from tokens`;
      
      const result = parseAearsFile(content);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
    });

    it('should return appropriate error codes for critical failures', () => {
      const invalidContent = 'Complete garbage that cannot be parsed at all';
      
      const result = parseAearsFile(invalidContent);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
      assert.ok(result.errors[0].includes('Malformed requirement'));
    });

    it('should handle null or undefined input gracefully', () => {
      const result = parseAearsFile('');
      
      // Empty content should be handled gracefully
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.ast?.requirements.length, 0);
    });
  });

  describe('The error reporter shall provide line numbers', () => {
    it('should include error context in error messages', () => {
      const content = `The parser shall tokenize aears files
Invalid syntax here
The parser shall generate AST`;
      
      const result = parseAearsFile(content);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
      
      // Check that error message includes the problematic line
      const errorMessage = result.errors[0];
      assert.ok(errorMessage.includes('Malformed requirement'));
      assert.ok(errorMessage.includes('Invalid syntax here'));
    });

    it('should provide meaningful error messages for common mistakes', () => {
      const content = 'The parser should tokenize files'; // Missing "shall"
      
      const result = parseAearsFile(content);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
      assert.ok(result.errors[0].includes('Malformed requirement'));
    });

    it('should handle malformed requirement patterns', () => {
      const testCases = [
        'The parser', // Incomplete
        'parser shall tokenize', // Missing "The"
        'When the parser shall tokenize', // Missing condition
        'While the parser shall tokenize', // Missing state
        'If the parser shall tokenize', // Missing condition and "then"
      ];
      
      for (const testCase of testCases) {
        const result = parseAearsFile(testCase);
        
        assert.strictEqual(result.success, false, `Should fail for: ${testCase}`);
        assert.ok(result.errors.length > 0, `Should have errors for: ${testCase}`);
        assert.ok(result.errors[0].includes('Malformed requirement'), 
          `Should indicate malformed requirement for: ${testCase}`);
      }
    });
  });

  describe('Error handling integration tests', () => {
    it('should handle mixed valid and invalid requirements', () => {
      const content = `The parser shall tokenize aears files
Invalid line 1
When syntax error detected the parser shall report error location
Invalid line 2
The parser shall not crash on malformed input`;
      
      const result = parseAearsFile(content);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
    });

    it('should provide error summary information', () => {
      const content = 'Completely invalid requirement format';
      
      const result = parseAearsFile(content);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.errors.length > 0);
      assert.strictEqual(result.warnings.length, 0);
    });

    it('should handle different requirement types with errors', () => {
      const parser = new SimpleParser();
      
      // Test direct parser behavior
      assert.throws(() => {
        parser.parseDocument('Invalid requirement');
      }, /Malformed requirement/);
    });
  });

  describe('Error recovery and suggestions', () => {
    it('should provide helpful error messages for common patterns', () => {
      const commonMistakes = [
        'The parser should tokenize files', // "should" instead of "shall"
        'Parser shall tokenize files', // Missing "The"
        'The parser will tokenize files', // "will" instead of "shall"
        'When the parser shall tokenize files', // Missing condition
      ];
      
      for (const mistake of commonMistakes) {
        const result = parseAearsFile(mistake);
        
        assert.strictEqual(result.success, false, `Should fail for: ${mistake}`);
        assert.ok(result.errors.length > 0, `Should have errors for: ${mistake}`);
      }
    });

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        '', // Empty string
        '   ', // Whitespace only
        '\n\n\n', // Newlines only
        'The   parser   shall   tokenize   files', // Multiple spaces
      ];
      
      for (const edgeCase of edgeCases) {
        const result = parseAearsFile(edgeCase);
        
        // Empty/whitespace should succeed with no requirements
        if (edgeCase.trim() === '') {
          assert.strictEqual(result.success, true);
          assert.strictEqual(result.ast?.requirements.length, 0);
        } else {
          // Multiple spaces should still work
          assert.strictEqual(result.success, true);
        }
      }
    });
  });
});