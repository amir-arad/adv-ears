/**
 * Real LSP Protocol Integration Tests
 * 
 * These tests communicate with the actual LSP server via JSON-RPC protocol
 * to verify real server behavior that VS Code clients would experience.
 * 
 * CRITICAL: These tests verify actual behavior, not syntax or internal implementation.
 */

import { LSPTestClient, createLSPTestClient } from '../helpers/lsp-test-client.js';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { strict as assert } from 'node:assert';

describe('LSP Server Protocol Integration Tests', () => {
  let client: LSPTestClient;

  beforeEach(() => {
    client = createLSPTestClient();
  });

  afterEach(async () => {
    if (client) {
      await client.shutdown();
    }
  });

  test('The language server shall provide syntax validation', async () => {
    // Start real LSP server process
    await client.start();
    
    // Initialize LSP session
    const initResult = await client.initialize();
    
    // Verify server advertises text document sync (validation capability)
    assert.ok(initResult.capabilities.textDocumentSync, 'Server should advertise textDocumentSync capability');
    
    // Open document with invalid AEARS content
    const invalidUri = 'file:///test-invalid.aears';
    const invalidContent = 'This is invalid AEARS syntax without proper structure';
    
    await client.openDocument(invalidUri, 'aears', invalidContent);
    
    // Wait for server to send diagnostics
    const diagnostics = await client.waitForDiagnostics(invalidUri);
    
    // Verify real diagnostics were published by server
    assert.strictEqual(diagnostics.uri, invalidUri, 'Diagnostics should be for the opened document');
    assert.ok(diagnostics.diagnostics.length > 0, 'Server should publish error diagnostics for invalid content');
    assert.strictEqual(diagnostics.diagnostics[0].source, 'aears-lsp', 'Diagnostics should be from aears-lsp');
    assert.ok(diagnostics.diagnostics[0].message, 'Diagnostic should have error message');
    
    // Test with valid content
    const validUri = 'file:///test-valid.aears';
    const validContent = 'The system shall authenticate users';
    
    await client.openDocument(validUri, 'aears', validContent);
    
    // Wait for diagnostics (should be empty for valid content)
    const validDiagnostics = await client.waitForDiagnostics(validUri);
    assert.strictEqual(validDiagnostics.diagnostics.length, 0, 'Valid content should have no diagnostics');
  });

  test('The language server shall offer auto-completion', async () => {
    if (!client.isReady) {
      await client.start();
      await client.initialize();
    }
    
    // Verify server advertises completion capability
    const capabilities = await client.getServerCapabilities();
    assert.ok(capabilities.completionProvider, 'Server should advertise completion capability');
    
    // Open AEARS document
    const testUri = 'file:///test-completion.aears';
    await client.openDocument(testUri, 'aears', 'The sys');
    
    // Request completion at cursor position
    const completions = await client.getCompletion(testUri, 0, 7);
    
    // Verify server returned completion items via LSP protocol
    const items = Array.isArray(completions) ? completions : completions.items;
    assert.ok(items.length > 0, 'Server should return completion items via LSP protocol');
    
    // Verify AEARS keywords are present
    const labels = items.map((item: any) => item.label);
    const expectedKeywords = ['The', 'When', 'While', 'If', 'Where', 'shall'];
    
    expectedKeywords.forEach(keyword => {
      assert.ok(labels.includes(keyword), `Completion should include "${keyword}" keyword from server`);
    });
  });

  test('When hover requested the language server shall display entity information', async () => {
    if (!client.isReady) {
      await client.start();  
      await client.initialize();
    }
    
    // Verify server advertises hover capability
    const capabilities = await client.getServerCapabilities();
    assert.ok(capabilities.hoverProvider, 'Server should advertise hover capability');
    
    // Open document with AEARS content
    const testUri = 'file:///test-hover.aears';
    const content = 'The system shall authenticate users';
    await client.openDocument(testUri, 'aears', content);
    
    // Request hover information on "The" keyword via LSP protocol
    const theHover = await client.getHover(testUri, 0, 0);
    
    // Verify server returned hover information
    assert.ok(theHover, 'Server should return hover information via LSP protocol');
    assert.ok(theHover.contents, 'Hover should have contents');
    
    const hoverText = typeof theHover.contents === 'string' 
      ? theHover.contents 
      : theHover.contents.value || theHover.contents[0];
      
    assert.ok(hoverText.includes('UB') || hoverText.includes('Ubiquitous'), 
      'Hover should provide UB requirement type information from server');
    
    // Test hover on "system" entity
    const systemHover = await client.getHover(testUri, 0, 4);
    if (systemHover) {
      const systemText = typeof systemHover.contents === 'string'
        ? systemHover.contents
        : systemHover.contents.value || systemHover.contents[0];
      assert.ok(systemText.includes('Actor') || systemText.includes('system'), 
        'Hover should provide actor information from server');
    }
  });

  test('WHERE LSP client connected the language server shall send diagnostics', async () => {
    if (!client.isReady) {
      await client.start();
      await client.initialize();
    }
    
    // This test verifies the server actually sends diagnostic notifications
    // when connected via real LSP protocol (not testing handler functions)
    
    const testUri = 'file:///test-diagnostics.aears';
    const errorContent = 'Malformed requirement without proper AEARS structure';
    
    // Open document with syntax errors
    await client.openDocument(testUri, 'aears', errorContent);
    
    // Verify server sent diagnostics via publishDiagnostics notification
    const diagnostics = await client.waitForDiagnostics(testUri);
    
    assert.strictEqual(diagnostics.method, undefined, 'Should receive diagnostics as notification, not response');
    assert.strictEqual(diagnostics.uri, testUri, 'Diagnostics should be for the correct document');
    assert.ok(diagnostics.diagnostics.length > 0, 'Server should publish error diagnostics');
    
    // Verify diagnostic structure follows LSP specification
    const diagnostic = diagnostics.diagnostics[0];
    assert.ok(diagnostic.range, 'Diagnostic should have range');
    assert.ok(typeof diagnostic.range.start.line === 'number', 'Range should have line number');
    assert.ok(typeof diagnostic.range.start.character === 'number', 'Range should have character position');
    assert.strictEqual(diagnostic.source, 'aears-lsp', 'Diagnostic should be from aears-lsp');
  });

  test('WHILE editing active the validation shall run continuously', async () => {
    if (!client.isReady) {
      await client.start();
      await client.initialize();
    }
    
    // This test verifies continuous validation through real LSP didChange notifications
    const testUri = 'file:///test-continuous.aears';
    
    // Start with valid content
    let version = 1;
    await client.openDocument(testUri, 'aears', 'The system shall work', version);
    
    // Wait for initial diagnostics (should be clean)
    let diagnostics = await client.waitForDiagnostics(testUri);
    assert.strictEqual(diagnostics.diagnostics.length, 0, 'Valid content should have no errors');
    
    // Edit to invalid content
    version++;
    await client.changeDocument(testUri, 'Invalid syntax here', version);
    
    // Verify server sends new diagnostics for invalid content
    diagnostics = await client.waitForDiagnostics(testUri, 2000);
    assert.ok(diagnostics.diagnostics.length > 0, 'Server should send diagnostics for invalid content during editing');
    
    // Edit back to valid content  
    version++;
    await client.changeDocument(testUri, 'The system shall authenticate users', version);
    
    // Verify server clears diagnostics for valid content
    diagnostics = await client.waitForDiagnostics(testUri, 2000);
    assert.strictEqual(diagnostics.diagnostics.length, 0, 'Server should clear diagnostics when content becomes valid');
    
    // Test multiple rapid changes (continuous editing scenario)
    const rapidChanges = [
      'When user logs in the system shall verify',
      'When user logs in the system shall verify credentials',  
      'While session active the system shall maintain state'
    ];
    
    for (const change of rapidChanges) {
      version++;
      await client.changeDocument(testUri, change, version);
      // Brief pause to simulate typing
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Final validation should work
    diagnostics = await client.waitForDiagnostics(testUri, 2000);
    assert.strictEqual(diagnostics.diagnostics.length, 0, 'Server should handle rapid continuous changes correctly');
  });

  // Additional test to verify complete LSP lifecycle works
  test('LSP server lifecycle integration', async () => {
    // Test complete lifecycle: start → initialize → work → shutdown
    const lifecycleClient = createLSPTestClient();
    
    try {
      // Start and initialize
      await lifecycleClient.start();
      const initResult = await lifecycleClient.initialize();
      
      // Verify initialization worked
      assert.ok(initResult.capabilities, 'Server should return capabilities');
      assert.ok(lifecycleClient.isReady, 'Client should be ready after initialization');
      
      // Do some work
      const testUri = 'file:///lifecycle-test.aears';
      await lifecycleClient.openDocument(testUri, 'aears', 'The test shall pass');
      
      const completion = await lifecycleClient.getCompletion(testUri, 0, 0);
      const items = Array.isArray(completion) ? completion : completion.items;
      assert.ok(items.length > 0, 'Server should provide completions during normal operation');
      
      // Clean shutdown
      await lifecycleClient.shutdown();
      assert.ok(!lifecycleClient.isReady, 'Client should not be ready after shutdown');
      
    } catch (error) {
      // Ensure cleanup even on error
      await lifecycleClient.shutdown();
      throw error;
    }
  });
});