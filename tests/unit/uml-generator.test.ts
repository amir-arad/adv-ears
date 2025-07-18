import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { UMLGenerator } from '../../src/generators/uml-generator.js';
import { DocumentNode, RequirementNode, RequirementType } from '../../src/types/ast-types.js';

describe('UMLGenerator', () => {
  const generator = new UMLGenerator();

  const sampleAST: DocumentNode = {
    type: 'document',
    requirements: [
      {
        type: 'requirement',
        requirementType: RequirementType.UB,
        entity: 'system',
        functionality: 'process user requests'
      },
      {
        type: 'requirement',
        requirementType: RequirementType.EV,
        entity: 'user',
        functionality: 'login to system',
        precondition: 'credentials provided'
      },
      {
        type: 'requirement',
        requirementType: RequirementType.UW,
        entity: 'system',
        functionality: 'allow unauthorized access',
        negated: true
      }
    ]
  };

  test('should generate valid PlantUML output', () => {
    const result = generator.generatePlantUML(sampleAST);
    
    assert.ok(result.includes('@startuml'));
    assert.ok(result.includes('@enduml'));
    assert.ok(result.includes('actor "system"'));
    assert.ok(result.includes('actor "user"'));
    assert.ok(result.includes('usecase "process user requests"'));
    assert.ok(result.includes('usecase "login to system"'));
    assert.ok(result.includes('usecase "allow unauthorized access"'));
  });

  test('should include title when requested', () => {
    const result = generator.generatePlantUML(sampleAST, { includeTitle: true });
    
    assert.ok(result.includes('title Requirements Use Case Diagram'));
  });

  test('should include statistics when requested', () => {
    const result = generator.generatePlantUML(sampleAST, { includeStatistics: true });
    
    assert.ok(result.includes('Requirements Statistics:'));
    assert.ok(result.includes('UB: 1'));
    assert.ok(result.includes('EV: 1'));
    assert.ok(result.includes('UW: 1'));
  });

  test('should generate different relationship types for different requirement types', () => {
    const result = generator.generatePlantUML(sampleAST);
    
    // UB should use basic arrow
    assert.ok(result.includes('system --> UC1'));
    // EV should use dashed arrow
    assert.ok(result.includes('user ..> UC2'));
    // UW should use blocked arrow
    assert.ok(result.includes('system --x UC3'));
  });

  test('should sanitize special characters in PlantUML output', () => {
    const astWithSpecialChars: DocumentNode = {
      type: 'document',
      requirements: [
        {
          type: 'requirement',
          requirementType: RequirementType.UB,
          entity: 'system "main"',
          functionality: 'handle "quoted" input'
        }
      ]
    };

    const result = generator.generatePlantUML(astWithSpecialChars);
    
    assert.ok(result.includes('actor "system \\"main\\""'));
    assert.ok(result.includes('usecase "handle \\"quoted\\" input"'));
  });

  test('should generate comprehensive report', () => {
    const result = generator.generateReport(sampleAST);
    
    assert.ok(result.includes('=== EARS Requirements Analysis Report ==='));
    assert.ok(result.includes('Total Requirements: 3'));
    assert.ok(result.includes('Requirements by Type:'));
    assert.ok(result.includes('UB: 1'));
    assert.ok(result.includes('EV: 1'));
    assert.ok(result.includes('UW: 1'));
    assert.ok(result.includes('Actors Identified: 2'));
    assert.ok(result.includes('- system'));
    assert.ok(result.includes('- user'));
    assert.ok(result.includes('Use Cases Identified: 3'));
    assert.ok(result.includes('system -> process user requests'));
    assert.ok(result.includes('user -> login to system'));
    assert.ok(result.includes('system -> allow unauthorized access'));
  });

  test('should handle empty AST', () => {
    const emptyAST: DocumentNode = {
      type: 'document',
      requirements: []
    };

    const result = generator.generatePlantUML(emptyAST);
    
    assert.ok(result.includes('@startuml'));
    assert.ok(result.includes('@enduml'));
    
    const report = generator.generateReport(emptyAST);
    assert.ok(report.includes('Total Requirements: 0'));
    assert.ok(report.includes('Actors Identified: 0'));
    assert.ok(report.includes('Use Cases Identified: 0'));
  });

  test('should create valid actor aliases', () => {
    const astWithComplexNames: DocumentNode = {
      type: 'document',
      requirements: [
        {
          type: 'requirement',
          requirementType: RequirementType.UB,
          entity: 'payment-service',
          functionality: 'process payments'
        },
        {
          type: 'requirement',
          requirementType: RequirementType.UB,
          entity: '3rd-party-api',
          functionality: 'validate data'
        }
      ]
    };

    const result = generator.generatePlantUML(astWithComplexNames);
    
    // Should convert special characters to underscores
    assert.ok(result.includes('as payment_service'));
    assert.ok(result.includes('as _3rd_party_api'));
  });
});