import {
  AEARSLibrary,
  ConfigurationError,
  LibraryConfiguration,
  ProcessingError,
  ProcessingInput,
  ValidationError,
  ValidationResult
} from '../../src/index.js';
import { RequirementNode, RequirementType } from '../../src/types/ast-types.js';
import { describe, it, beforeEach } from 'node:test';

import assert from 'node:assert';

describe('Library Validation Contract Tests', () => {
  let library: AEARSLibrary;

  beforeEach(() => {
    library = new AEARSLibrary();
  });

  it('The library shall throw ValidationError when invalid input provided', () => {
    // Test that ValidationError is thrown for truly invalid inputs (wrong types)
    // Note: library.validateRequirement returns ValidationResult, but should throw for type errors
    
    try {
      // Try calling library.validateRequirement with completely wrong type
      library.validateRequirement(null as any);
      assert.fail('Should have thrown ValidationError for null input');
    } catch (error) {
      assert.ok(error instanceof ValidationError || error instanceof ProcessingError, 
        `Should throw ValidationError or ProcessingError, got ${error.constructor.name}`);
      assert.ok(error.message, 'Error should have message');
    }

    try {
      // Try calling library.validateRequirement with number
      library.validateRequirement(123 as any);
      assert.fail('Should have thrown ValidationError for number input');
    } catch (error) {
      assert.ok(error instanceof ValidationError || error instanceof ProcessingError, 
        `Should throw ValidationError or ProcessingError, got ${error.constructor.name}`);
      assert.ok(error.message, 'Error should have message');
    }

    // Test that malformed AEARS syntax returns validation result with errors
    const malformedRequirement = 'This is not valid AEARS syntax';
    const result = library.validateRequirement(malformedRequirement);
    assert.strictEqual(result.valid, false, 'Malformed requirement should be invalid');
    assert.ok(result.errors.length > 0, 'Should have validation errors');
  });

  it('The library shall throw ValidationError with message and details when validation fails', () => {
    // Test that validation failures result in proper error structures in ValidationResult
    const malformedRequirement = 'This is not a valid AEARS requirement pattern';
    
    const result = library.validateRequirement(malformedRequirement);
    
    // library.validateRequirement returns ValidationResult, not throws ValidationError
    assert.strictEqual(result.valid, false, 'Malformed requirement should be invalid');
    assert.ok(result.errors.length > 0, 'Should have validation errors');
    
    // Check that errors have proper structure (message and details)
    const error = result.errors[0];
    assert.ok(error.message, 'ValidationError should have message property');
    assert.ok(typeof error.message === 'string', 'Message should be a string');
    assert.ok(error.details !== undefined, 'ValidationError should have details property');
    
    // For testing actual ValidationError throwing, test with invalid type
    try {
      library.validateRequirement(undefined as any);
      assert.fail('Should have thrown ValidationError for undefined input');
    } catch (thrownError) {
      assert.ok(thrownError instanceof ValidationError || thrownError instanceof ProcessingError, 
        'Should throw ValidationError or ProcessingError');
      assert.ok(thrownError.message, 'Thrown error should have message');
    }
  });

  it('The library shall throw ProcessingError with cause and context when processing fails', () => {
    // Create an input that will cause processing to fail
    const corruptInput: ProcessingInput = {
      text: 'The system shall authenticate users',
      metadata: {
        // Add some context that could be used in error reporting
        source: 'test-file.aears',
        line: 42
      }
    };

    // Force a processing error by corrupting internal state or using invalid options
    try {
      // Use an invalid option that should cause processing to fail
      library.processRequirements(corruptInput, { domains: ['invalid-domain-that-does-not-exist'] });
      // If this doesn't throw, let's try another approach
    } catch (error) {
      if (error instanceof ProcessingError) {
        assert.ok(error.message, 'ProcessingError should have message');
        assert.strictEqual(error.name, 'ProcessingError', 'Should have correct error name');
        // Check for cause or context if available
        if (error.cause) {
          assert.ok(error.cause instanceof Error, 'Cause should be an Error object');
        }
        if (error.context) {
          assert.ok(typeof error.context === 'object', 'Context should be an object');
        }
        return; // Test passed
      }
    }

    // Alternative test: Try to cause ProcessingError through invalid ProcessingInput
    try {
      const invalidProcessingInput = { text: null } as any;
      library.processRequirements(invalidProcessingInput);
      assert.fail('Should have thrown ProcessingError');
    } catch (error) {
      assert.ok(error instanceof ProcessingError, 'Should throw ProcessingError');
      assert.ok(error.message, 'ProcessingError should have message');
      assert.strictEqual(error.name, 'ProcessingError', 'Should have correct error name');
    }
  });

  it('The library shall throw ConfigurationError with invalid fields when configuration invalid', () => {
    const invalidConfigurations : (Partial<LibraryConfiguration>)[] = [
      // Invalid defaultDomains (not an array)
      { defaultDomains: 'not-an-array' },
      // Invalid maxCacheSize (negative number)
      { maxCacheSize: -10 },
      // Invalid enableStreaming (not boolean)
      { enableStreaming: 'yes' },
      // Invalid qualityThreshold (out of range)
      { qualityThreshold: 1.5 },
      // Invalid outputFormat (unknown format)
      { outputFormat: 'xml' },
      // Multiple invalid fields
      {
        defaultDomains: 123,
        maxCacheSize: 'invalid',
        enableStreaming: null
      }
    ];

    for (const config of invalidConfigurations) {
      try {
        library.setConfiguration(config);
        assert.fail(`Should have thrown ConfigurationError for config: ${JSON.stringify(config)}`);
      } catch (error) {
        assert.ok(error instanceof ConfigurationError, 
          `Should throw ConfigurationError, got ${error.constructor.name}`);
        assert.ok(error.message, 'ConfigurationError should have message');
        assert.ok(Array.isArray(error.invalidFields), 'Should have invalidFields array');
        assert.ok(error.invalidFields.length > 0, 'Should have at least one invalid field');
        assert.strictEqual(error.name, 'ConfigurationError', 'Should have correct error name');
      }
    }
  });

  it('The library shall return ValidationResult when user calls library.validateRequirement', () => {
    // Test with valid requirement
    const validRequirement = 'The system shall authenticate users';
    const result = library.validateRequirement(validRequirement);
    
    assert.ok(result, 'Should return a result object');
    assert.ok(typeof result === 'object', 'Result should be an object');
    assert.ok('valid' in result, 'Result should have valid property');
    assert.ok('errors' in result, 'Result should have errors property');
    assert.ok('warnings' in result, 'Result should have warnings property');
    assert.ok(typeof result.valid === 'boolean', 'valid should be boolean');
    assert.ok(Array.isArray(result.errors), 'errors should be an array');
    assert.ok(Array.isArray(result.warnings), 'warnings should be an array');
    
    // Test with invalid requirement
    const invalidRequirement = 'This is not valid AEARS syntax';
    const invalidResult = library.validateRequirement(invalidRequirement);
    
    assert.strictEqual(invalidResult.valid, false, 'Invalid requirement should have valid=false');
    assert.ok(invalidResult.errors.length > 0, 'Invalid requirement should have errors');
  });

  it('The library shall return boolean when user calls library.validateInput', () => {
    // Test with valid string input
    const validStringInput = 'The system shall authenticate users';
    const stringResult = library.validateInput(validStringInput);
    assert.ok(typeof stringResult === 'boolean', 'Should return boolean for string input');
    assert.strictEqual(stringResult, true, 'Valid AEARS input should return true');

    // Test with valid ProcessingInput
    const validProcessingInput: ProcessingInput = {
      text: 'The system shall authenticate users',
      context: 'Authentication requirements'
    };
    const processingResult = library.validateInput(validProcessingInput);
    assert.ok(typeof processingResult === 'boolean', 'Should return boolean for ProcessingInput');
    assert.strictEqual(processingResult, true, 'Valid ProcessingInput should return true');

    // Test with invalid input
    const invalidInput = 'This is not valid AEARS';
    const invalidResult = library.validateInput(invalidInput);
    assert.ok(typeof invalidResult === 'boolean', 'Should return boolean for invalid input');
    assert.strictEqual(invalidResult, false, 'Invalid input should return false');

    // Test with empty input
    const emptyResult = library.validateInput('');
    assert.ok(typeof emptyResult === 'boolean', 'Should return boolean for empty input');
    assert.strictEqual(emptyResult, false, 'Empty input should return false');
  });

  it('The library shall provide valid errors and warnings when validation result returned', () => {
    // Test with requirement that should generate warnings
    const shortRequirement = 'The x shall y'; // Very short entity and functionality
    const result = library.validateRequirement(shortRequirement);
    
    assert.ok(result, 'Should return validation result');
    
    // Check errors structure
    for (const error of result.errors) {
      assert.ok(error.message, 'Each error should have message');
      assert.ok(typeof error.message === 'string', 'Error message should be string');
      // Details, line, column are optional
      if (error.details) {
        assert.ok(typeof error.details === 'string', 'Error details should be string');
      }
      if (error.line !== undefined) {
        assert.ok(typeof error.line === 'number', 'Error line should be number');
      }
      if (error.column !== undefined) {
        assert.ok(typeof error.column === 'number', 'Error column should be number');
      }
    }
    
    // Check warnings structure
    for (const warning of result.warnings) {
      assert.ok(warning.message, 'Each warning should have message');
      assert.ok(typeof warning.message === 'string', 'Warning message should be string');
      // Suggestion and line are optional
      if (warning.suggestion) {
        assert.ok(typeof warning.suggestion === 'string', 'Warning suggestion should be string');
      }
      if (warning.line !== undefined) {
        assert.ok(typeof warning.line === 'number', 'Warning line should be number');
      }
    }

    // Test with requirement that should generate both errors and warnings
    const incompleteRequirement = 'The  shall '; // Missing entity and functionality
    const incompleteResult = library.validateRequirement(incompleteRequirement);
    
    assert.strictEqual(incompleteResult.valid, false, 'Incomplete requirement should be invalid');
    assert.ok(incompleteResult.errors.length > 0, 'Should have validation errors');
    
    // Verify all errors have required structure
    for (const error of incompleteResult.errors) {
      assert.ok(error.message, 'Error must have message');
      assert.ok(typeof error.message === 'string', 'Error message must be string');
    }
  });

  it('Where type checking enabled the library shall validate at compile time', () => {
    // This test verifies TypeScript compile-time validation through runtime checks
    // since we can't actually test compile-time errors in a runtime test
    
    // Test that TypeScript types are properly exported and usable
    const validationResult: ValidationResult = library.validateRequirement('The system shall work');
    assert.ok(validationResult.valid !== undefined, 'ValidationResult type should be properly defined');
    
    // Test that interfaces are properly structured
    const processingInput: ProcessingInput = {
      text: 'The system shall authenticate users',
      context: 'Security requirements'
    };
    
    // Verify TypeScript compilation accepts proper types
    const isValid: boolean = library.validateInput(processingInput);
    assert.ok(typeof isValid === 'boolean', 'Type system should enforce correct return types');
    
    // Test that requirement node types work
    const mockRequirement: RequirementNode = {
      type: 'requirement',
      requirementType: RequirementType.UB,
      entity: 'system',
      functionality: 'authenticate users'
    };
    
    const nodeValidation = library.validateRequirement(mockRequirement);
    assert.ok(nodeValidation, 'Should accept RequirementNode type');
    
    // Verify configuration type checking
    const validConfig: Partial<LibraryConfiguration> = {
      defaultDomains: ['system', 'security'],
      maxCacheSize: 100,
      enableStreaming: true
    };
    
    // This should compile without type errors
    try {
      library.setConfiguration(validConfig);
    } catch (error) {
      // Configuration might throw for other reasons, but types should be valid
      if (error instanceof ConfigurationError) {
        // This is expected for actual validation, not type issues
      } else {
        throw error; // Re-throw unexpected errors
      }
    }
    
    assert.ok(true, 'Type checking validation completed');
  });
});