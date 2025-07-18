import { afterEach, beforeEach, describe, it } from 'node:test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';

import assert from 'node:assert';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

// CLI Test Helper - runs CLI commands and captures output/exit codes
async function cli(args: string[]): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const child = spawn('node', ['dist/cli/cli.js', ...args], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        exitCode: code || 0,
        stdout,
        stderr
      });
    });
  });
}

// Test fixtures
const VALID_AEARS_CONTENT = `The parser shall tokenize aears files
When syntax error detected the parser shall report error location
The parser shall not crash on malformed input`;

const INVALID_AEARS_CONTENT = `This is not a valid requirement syntax
Random text without proper structure`;

describe('CLI Rules Implementation', () => {
  let validFile: string;
  let invalidFile: string;
  let nonAearsFile: string;

  beforeEach(() => {
    // Create temporary test files
    const tempDir = tmpdir();
    validFile = join(tempDir, 'test-valid.aears');
    invalidFile = join(tempDir, 'test-invalid.aears');
    nonAearsFile = join(tempDir, 'test-file.txt');

    writeFileSync(validFile, VALID_AEARS_CONTENT);
    writeFileSync(invalidFile, INVALID_AEARS_CONTENT);
    writeFileSync(nonAearsFile, 'This is not an aears file');
  });

  // Clean up after each test
  afterEach(() => {
    [validFile, invalidFile, nonAearsFile].forEach(file => {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  describe('The cli shall accept aears file input', () => {
    it('should accept valid .aears files', async () => {
      const result = await cli(['validate', validFile]);
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('File validation successful'));
    });

    it('should reject non-.aears files', async () => {
      const result = await cli(['validate', nonAearsFile]);
      assert.strictEqual(result.exitCode, 1);
      assert.ok(result.stderr.includes('File must have .aears extension'));
    });

    it('should reject missing files', async () => {
      const result = await cli(['validate', 'nonexistent.aears']);
      assert.strictEqual(result.exitCode, 1);
      assert.ok(result.stderr.includes('Error reading file'));
    });
  });

  describe('When validation requested the cli shall check syntax', () => {
    it('should validate correct syntax successfully', async () => {
      const result = await cli(['validate', validFile]);
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('✓ File validation successful'));
    });

    it('should detect syntax errors', async () => {
      const result = await cli(['validate', invalidFile]);
      assert.strictEqual(result.exitCode, 1);
      assert.ok(result.stderr.includes('✗ File validation failed'));
      assert.ok(result.stderr.includes('Malformed requirement'));
    });

    it('should provide verbose output when requested', async () => {
      const result = await cli(['validate', validFile, '--verbose']);
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('📊 Statistics'));
      assert.ok(result.stdout.includes('🎭 Actors'));
      assert.ok(result.stdout.includes('Total requirements'));
    });
  });

  describe('When generation requested the cli shall output UML', () => {

  });

  describe('IF file invalid THEN the cli shall exit with error code', () => {
    it('should exit with error code 1 for invalid syntax', async () => {
      const result = await cli(['validate', invalidFile]);
      assert.strictEqual(result.exitCode, 1);
    });

    it('should exit with error code 1 for wrong file extension', async () => {
      const result = await cli(['validate', nonAearsFile]);
      assert.strictEqual(result.exitCode, 1);
    });

    it('should exit with error code 1 for missing file', async () => {
      const result = await cli(['validate', 'missing.aears']);
      assert.strictEqual(result.exitCode, 1);
    });

    it('should exit with error code 0 for valid files', async () => {
      const result = await cli(['validate', validFile]);
      assert.strictEqual(result.exitCode, 0);
    });
  });

  describe('Additional CLI functionality tests', () => {
    it('should parse files and output AST', async () => {
      const result = await cli(['parse', validFile]);
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('📋 EARS AST Structure'));
    });

    it('should parse files and output JSON format', async () => {
      const result = await cli(['parse', validFile, '--format', 'json']);
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('"type": "document"'));
      assert.ok(result.stdout.includes('"requirements"'));
    });

    it('should analyze files and show metrics', async () => {
      const result = await cli(['analyze', validFile]);
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('📋 EARS File Analysis Report'));
      assert.ok(result.stdout.includes('📊 Requirement Statistics'));
      assert.ok(result.stdout.includes('🎭 System Actors'));
      assert.ok(result.stdout.includes('🎯 Use Cases'));
    });
  });
});