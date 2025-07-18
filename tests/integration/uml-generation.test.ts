import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const execAsync = promisify(exec);

describe('UML Generation Integration Tests', () => {
  const testAearsFile = join(process.cwd(), 'test-temp.aears');
  const testOutputFile = join(process.cwd(), 'test-output.puml');

  // Clean up test files
  const cleanup = () => {
    try {
      if (existsSync(testAearsFile)) unlinkSync(testAearsFile);
      if (existsSync(testOutputFile)) unlinkSync(testOutputFile);
    } catch (error) {
      // Ignore cleanup errors
    }
  };

  test('The generator shall extract actors from entities', async () => {
    cleanup();
    
    const testContent = `The user shall login to system
The admin shall manage users
The system shall process requests`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}"`);
      
      // Should generate PlantUML with actors
      assert.ok(stdout.includes('actor "user"'));
      assert.ok(stdout.includes('actor "admin"'));
      assert.ok(stdout.includes('actor "system"'));
      
      // Should have 3 unique actors
      const actorMatches = stdout.match(/actor "[^"]*"/g);
      assert.strictEqual(actorMatches?.length, 3);
      
    } finally {
      cleanup();
    }
  });

  test('The generator shall extract use cases from functionalities', async () => {
    cleanup();
    
    const testContent = `The user shall login to system
The user shall view dashboard
The system shall send notifications`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}"`);
      
      // Should generate PlantUML with use cases
      assert.ok(stdout.includes('usecase "login to system"'));
      assert.ok(stdout.includes('usecase "view dashboard"'));
      assert.ok(stdout.includes('usecase "send notifications"'));
      
      // Should have 3 use cases
      const useCaseMatches = stdout.match(/usecase "[^"]*"/g);
      assert.strictEqual(useCaseMatches?.length, 3);
      
    } finally {
      cleanup();
    }
  });

  test('When AST parsed the generator shall create PlantUML output', async () => {
    cleanup();
    
    const testContent = `The system shall authenticate users
When user login the system shall validate credentials`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}"`);
      
      // Should be valid PlantUML format
      assert.ok(stdout.startsWith('@startuml'));
      assert.ok(stdout.includes('@enduml'));
      
      // Should have actors section
      assert.ok(stdout.includes('!-- Actors --'));
      
      // Should have use cases section
      assert.ok(stdout.includes('!-- Use Cases --'));
      
      // Should have relationships section
      assert.ok(stdout.includes('!-- Relationships --'));
      
    } finally {
      cleanup();
    }
  });

  test('WHERE relationships detected the generator shall map use case connections', async () => {
    cleanup();
    
    const testContent = `The user shall login to system
The admin shall manage users
IF user authenticated THEN the system shall grant access`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}"`);
      
      // Should have different relationship types for different requirement types
      assert.ok(stdout.includes('user --> UC1')); // UB requirement
      assert.ok(stdout.includes('admin --> UC2')); // UB requirement
      assert.ok(stdout.includes('system -.> UC3')); // OP requirement (conditional)
      
    } finally {
      cleanup();
    }
  });

  test('When generation requested the cli shall output UML', async () => {
    cleanup();
    
    const testContent = `The system shall process requests
The user shall interact with system`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}" -o "${testOutputFile}"`);
      
      // Should confirm file was written
      assert.ok(stdout.includes('✓ PlantUML written to'));
      
      // Output file should exist
      assert.ok(existsSync(testOutputFile));
      
    } finally {
      cleanup();
    }
  });

  test('should generate report format when requested', async () => {
    cleanup();
    
    const testContent = `The system shall authenticate users
When login attempted the system shall validate credentials
The system shall not allow unauthorized access`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}" -f report`);
      
      // Should be a text report format
      assert.ok(stdout.includes('=== EARS Requirements Analysis Report ==='));
      assert.ok(stdout.includes('Total Requirements: 3'));
      assert.ok(stdout.includes('Requirements by Type:'));
      assert.ok(stdout.includes('UB: 1'));
      assert.ok(stdout.includes('EV: 1'));
      assert.ok(stdout.includes('UW: 1'));
      assert.ok(stdout.includes('Actors Identified:'));
      assert.ok(stdout.includes('Use Cases Identified:'));
      
    } finally {
      cleanup();
    }
  });

  test('should include title and statistics when requested', async () => {
    cleanup();
    
    const testContent = `The user shall login
The system shall respond`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}" --title --stats`);
      
      // Should include title
      assert.ok(stdout.includes('title Requirements Use Case Diagram'));
      
      // Should include statistics note
      assert.ok(stdout.includes('!-- Statistics --'));
      assert.ok(stdout.includes('note right'));
      assert.ok(stdout.includes('Requirements Statistics:'));
      assert.ok(stdout.includes('UB: 2'));
      
    } finally {
      cleanup();
    }
  });

  test('should handle complex mixed requirements', async () => {
    cleanup();
    
    const testContent = `The user shall login to system
When authentication successful the system shall grant access
The system shall not allow brute force attacks
WHILE session active the system shall maintain state
IF user inactive THEN the system shall timeout session
WHERE security enabled the system shall log activities`;

    writeFileSync(testAearsFile, testContent);

    try {
      const { stdout } = await execAsync(`node dist/cli/cli.js generate "${testAearsFile}" --stats`);
      
      // Should handle all requirement types
      assert.ok(stdout.includes('UB: 1'));
      assert.ok(stdout.includes('EV: 1'));
      assert.ok(stdout.includes('UW: 1'));
      assert.ok(stdout.includes('ST: 1'));
      assert.ok(stdout.includes('OP: 2'));
      
      // Should have different relationship arrows
      assert.ok(stdout.includes('user --> UC1'));    // UB
      assert.ok(stdout.includes('system ..> UC2'));  // EV
      assert.ok(stdout.includes('system --x UC3'));  // UW
      assert.ok(stdout.includes('system ==> UC4'));  // ST
      assert.ok(stdout.includes('system -.> UC5'));  // OP
      assert.ok(stdout.includes('system -.> UC6'));  // OP
      
    } finally {
      cleanup();
    }
  });
});