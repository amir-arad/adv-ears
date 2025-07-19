import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  AEARSLibrary,
  ProcessingInput,
  ProcessingOptions,
  ExtractionResult,
  ProcessingError
} from '../../src/index.js';

describe('Library Core Contract Tests', () => {
  let library: AEARSLibrary;

  beforeEach(() => {
    library = new AEARSLibrary();
  });
  
  it('The library shall return ExtractionResult when user calls library.processRequirements', () => {
    const input = 'The system shall authenticate users';
    const result = library.processRequirements(input);
    
    assert.ok(result, 'Result should be defined');
    assert.ok(typeof result === 'object', 'Result should be an object');
    assert.ok('requirements' in result, 'Result should have requirements property');
    assert.ok('groups' in result, 'Result should have groups property');
    assert.ok('metrics' in result, 'Result should have metrics property');
    assert.ok('coverage' in result, 'Result should have coverage property');
    assert.ok(Array.isArray(result.requirements), 'Requirements should be an array');
  });

  it('The library shall accept string or ProcessingInput when input parameter provided', () => {
    // Test with string input
    const stringInput = 'The system shall authenticate users';
    const stringResult = library.processRequirements(stringInput);
    assert.ok(stringResult.requirements.length > 0, 'Should process string input');

    // Test with ProcessingInput
    const objectInput: ProcessingInput = {
      text: 'The system shall authenticate users',
      context: 'Security requirements',
      metadata: { source: 'test' }
    };
    const objectResult = library.processRequirements(objectInput);
    assert.ok(objectResult.requirements.length > 0, 'Should process ProcessingInput');
  });

  it('The library shall accept ProcessingOptions when options parameter provided', () => {
    const input = 'The system shall authenticate users\nThe user shall provide credentials';
    const options: ProcessingOptions = {
      domains: ['security'],
      maxRequirements: 1,
      outputFormat: 'json'
    };
    
    const result = library.processRequirements(input, options);
    assert.ok(result, 'Should accept processing options');
    assert.ok(result.requirements.length <= 1, 'Should respect maxRequirements option');
  });

  it('The library shall throw ProcessingError with error details when processing fails', () => {
    // Test with invalid ProcessingInput object (missing required text property)
    const invalidInput = { context: 'test', metadata: {} } as any; // Force invalid input
    
    try {
      library.processRequirements(invalidInput);
      assert.fail('Should have thrown ProcessingError');
    } catch (error) {
      assert.ok(error instanceof ProcessingError, 'Should throw ProcessingError');
      assert.ok(error.message, 'Error should have message');
      assert.ok(error.name === 'ProcessingError', 'Error should have correct name');
    }
  });

  it('The library shall return complete result object when processing succeeds', () => {
    const input = `
      The system shall authenticate users
      When login attempted the system shall validate credentials
      The system shall not allow unauthorized access
    `;
    
    const result = library.processRequirements(input);
    
    // Verify complete result structure
    assert.ok(result.requirements, 'Should have requirements');
    assert.ok(result.groups, 'Should have groups');
    assert.ok(result.metrics, 'Should have metrics');
    assert.ok(result.coverage, 'Should have coverage');
    
    // Verify requirements structure
    assert.ok(result.requirements.length > 0, 'Should have processed requirements');
    const req = result.requirements[0];
    assert.ok(req.id, 'Requirement should have id');
    assert.ok(req.pattern, 'Requirement should have pattern');
    assert.ok(req.response, 'Requirement should have response');
    assert.ok(req.category, 'Requirement should have category');
    assert.ok(req.priority, 'Requirement should have priority');
    assert.ok(typeof req.confidence === 'number', 'Requirement should have confidence number');
    assert.ok(req.original, 'Requirement should have original AST node');
    
    // Verify metrics structure
    assert.ok(typeof result.metrics.totalRequirements === 'number', 'Should have total requirements count');
    assert.ok(typeof result.metrics.validRequirements === 'number', 'Should have valid requirements count');
    assert.ok(typeof result.metrics.averageConfidence === 'number', 'Should have average confidence');
    assert.ok(typeof result.metrics.qualityScore === 'number', 'Should have quality score');
    assert.ok(result.metrics.patternDistribution, 'Should have pattern distribution');
  });

  it('The library shall accept text string context and metadata when ProcessingInput used', () => {
    const input: ProcessingInput = {
      text: 'The system shall authenticate users',
      context: 'Authentication requirements for user management system',
      metadata: {
        source: 'requirements-doc.aears',
        version: '1.0',
        author: 'system-analyst',
        priority: 'high'
      }
    };
    
    const result = library.processRequirements(input);
    assert.ok(result.requirements.length > 0, 'Should process input with context and metadata');
    
    // The context and metadata should be available during processing
    // (Implementation detail: they're used in categorization and other processing)
    assert.ok(result.requirements[0], 'Should have at least one requirement');
  });

  it('The library shall treat string input as text property', () => {
    const stringInput = 'The system shall authenticate users';
    const objectInput: ProcessingInput = { text: stringInput };
    
    const stringResult = library.processRequirements(stringInput);
    const objectResult = library.processRequirements(objectInput);
    
    // Results should be equivalent when string input is treated as text property
    assert.strictEqual(
      stringResult.requirements.length,
      objectResult.requirements.length,
      'String and object input should produce equivalent results'
    );
    
    assert.strictEqual(
      stringResult.requirements[0].response,
      objectResult.requirements[0].response,
      'Requirement content should be identical'
    );
  });

  it('Where domains specified the library shall filter to requested domains', () => {
    const input = `
      The system shall authenticate users
      The user interface shall display login form
      The database shall store credentials
    `;
    
    // Process without domain filter
    const allResult = library.processRequirements(input);
    
    // Process with domain filter
    const filteredResult = library.processRequirements(input, { domains: ['security'] });
    
    assert.ok(allResult.requirements.length >= filteredResult.requirements.length,
      'Filtered result should have same or fewer requirements');
    
    // Check that filtered requirements match the domain filter
    for (const req of filteredResult.requirements) {
      assert.ok(['security'].includes(req.category),
        `Requirement category '${req.category}' should match filter domains`);
    }
  });

  it('Where maxRequirements specified the library shall limit output size', () => {
    const input = `
      The system shall authenticate users
      The system shall validate passwords
      The system shall log access attempts
      The system shall encrypt data
      The system shall backup information
    `;
    
    const maxLimit = 3;
    const result = library.processRequirements(input, { maxRequirements: maxLimit });
    
    assert.ok(result.requirements.length <= maxLimit,
      `Result should have at most ${maxLimit} requirements, got ${result.requirements.length}`);
  });

  it('The library shall use default configuration when options omitted', () => {
    const input = 'The system shall authenticate users';
    
    // Should not throw and should return valid result
    const result = library.processRequirements(input);
    
    assert.ok(result, 'Should return result with default configuration');
    assert.ok(result.requirements.length > 0, 'Should process requirements with defaults');
    assert.ok(result.metrics, 'Should have metrics with default settings');
    assert.ok(result.coverage, 'Should have coverage with default settings');
  });
});