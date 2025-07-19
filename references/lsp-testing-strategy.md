# LSP Testing Strategy for Adv-EARS

## Overview

This document outlines the comprehensive testing strategy for the AEARS Language Server Protocol (LSP) implementation, emphasizing **behavioral testing over syntax testing** and **real protocol communication over mocked interactions**.

## Testing Architecture

### Three-Layer Testing Approach

#### **1. Unit Layer** (Existing - Keep As-Is)
**Location**: `tests/modules/lsp-protocol.test.ts`  
**Purpose**: Test individual handler functions in isolation  
**Scope**: Handler function logic, data transformation, edge cases  
**Status**: ✅ These tests are legitimate and should be maintained  

**Examples**:
```typescript
// Good unit test - tests handler logic
const result = validateDocument(document, settings, false);
assert.strictEqual(result.success, true);
```

#### **2. Integration Layer** (New - Core Focus)
**Location**: `tests/integration/lsp-server.test.ts`  
**Purpose**: Test real LSP server behavior via JSON-RPC protocol  
**Scope**: End-to-end LSP communication that VS Code would use  
**Implementation**: Uses `LSPTestClient` for real protocol testing  

**Examples**:
```typescript
// Real integration test - tests actual server behavior
await client.start();
await client.initialize();
const diagnostics = await client.waitForDiagnostics(uri);
```

#### **3. CLI Layer** (Existing - Basic Coverage)
**Location**: Various CLI integration tests  
**Purpose**: Test that LSP server starts via CLI without crashing  
**Scope**: Basic server startup and command-line interface  

## Key Principles

### ✅ **DO: Test Real Behavior**
- Start actual LSP server processes
- Send real JSON-RPC messages with proper headers
- Verify actual server responses and notifications
- Test complete workflows (initialize → work → shutdown)
- Use existing vscode-languageserver libraries for protocol compliance

### ❌ **DON'T: Test Implementation Details**
- Import handler functions directly in integration tests
- Use mocks for core LSP functionality 
- Test that functions can be imported or called
- Create false confidence through syntax-only testing
- Implement custom JSON-RPC parsing

## Testing Tools and Infrastructure

### LSPTestClient (`tests/helpers/lsp-test-client.ts`)

**Purpose**: Simplified LSP client for testing real server communication  
**Key Features**:
- Uses existing `vscode-languageserver` libraries (no custom parsing)
- Handles LSP lifecycle (start → initialize → work → shutdown)
- Manages JSON-RPC message correlation and notifications
- Provides timeout handling and error management

**Usage Example**:
```typescript
const client = createLSPTestClient();
await client.start();
await client.initialize();
await client.openDocument(uri, 'aears', content);
const diagnostics = await client.waitForDiagnostics(uri);
await client.shutdown();
```

## Test Coverage Requirements

### Required Test Scenarios

Based on `/tests/modules/language-server-rules.aears`:

1. **"The language server shall provide syntax validation"**
   - ✅ Tests real diagnostic publishing via `textDocument/publishDiagnostics`
   - ✅ Verifies server capabilities advertisement
   - ✅ Tests both valid and invalid content handling

2. **"The language server shall offer auto-completion"**
   - ✅ Tests real completion requests via `textDocument/completion`
   - ✅ Verifies AEARS keyword completion items
   - ✅ Tests server capability advertisement

3. **"When hover requested the language server shall display entity information"**
   - ✅ Tests real hover requests via `textDocument/hover`
   - ✅ Verifies hover content for keywords and entities
   - ✅ Tests server capability advertisement

4. **"WHERE LSP client connected the language server shall send diagnostics"**
   - ✅ Tests actual diagnostic notification publishing
   - ✅ Verifies LSP client-server connection handling
   - ✅ Tests diagnostic structure compliance

5. **"WHILE editing active the validation shall run continuously"**
   - ✅ Tests real document change handling via `textDocument/didChange`
   - ✅ Verifies continuous validation during editing
   - ✅ Tests rapid change scenarios

6. **LSP Server Lifecycle Integration** (Additional)
   - ✅ Tests complete server lifecycle management
   - ✅ Verifies proper startup, operation, and shutdown
   - ✅ Tests resource cleanup and error handling

## Performance Requirements

### Acceptable Performance Targets
- **Individual test**: < 2 seconds
- **Complete suite**: < 10 seconds  
- **Resource cleanup**: Complete within 1 second
- **Server startup**: < 1 second

### Current Performance (Baseline)
- **Test 1** (Syntax validation): ~916ms
- **Test 2** (Auto-completion): ~711ms
- **Test 3** (Hover information): ~710ms
- **Test 4** (Diagnostics): ~704ms
- **Test 5** (Continuous validation): ~1859ms
- **Test 6** (Lifecycle): ~708ms
- **Total**: ~5.6 seconds

## Maintenance Guidelines

### Adding New LSP Features

When adding new LSP functionality:

1. **Unit Test First**: Add handler function tests in `lsp-protocol.test.ts`
2. **Integration Test Second**: Add real protocol test in `lsp-server.test.ts`
3. **Follow Naming**: Use exact requirement text from `.aears` files as test names
4. **Real Protocol**: Use `LSPTestClient` for all integration testing
5. **Anti-Pattern Check**: Ensure no direct handler imports in integration tests

### Code Review Checklist

Before merging LSP test changes:

- [ ] Test names match exact AEARS requirements
- [ ] Integration tests use `LSPTestClient`, not direct imports
- [ ] Tests would fail if LSP server was broken
- [ ] Proper resource cleanup in all tests
- [ ] Performance within acceptable limits
- [ ] No custom JSON-RPC parsing (use existing libraries)

## Anti-Pattern Prevention

### Common Anti-Patterns to Avoid

❌ **Handler Import Pattern**:
```typescript
// NEVER do this in integration tests
const { validateDocument } = await import('../../src/lsp/handlers.js');
const result = validateDocument(document, settings, false);
```

❌ **Mock Reliance Pattern**:
```typescript  
// NEVER do this in integration tests
const { createTextDocument } = await import('../../src/lsp/mocks.js');
const document = createTextDocument('file:///test.aears', content);
```

❌ **False Confidence Pattern**:
```typescript
// NEVER test syntax without behavior
assert.ok(completions.length > 0); // Tests data structure, not server behavior
```

### Correct Integration Patterns

✅ **Real Protocol Communication**:
```typescript
await client.start();
await client.initialize(); 
await client.openDocument(uri, 'aears', content);
const diagnostics = await client.waitForDiagnostics(uri);
assert.ok(diagnostics.diagnostics.length > 0);
```

✅ **Server Capability Testing**:
```typescript
const capabilities = await client.getServerCapabilities();
assert.ok(capabilities.completionProvider);
```

✅ **End-to-End Workflow Testing**:
```typescript
// Test complete workflow that VS Code would use
await client.openDocument(uri, 'aears', content);
const completions = await client.getCompletion(uri, 0, 0);
const items = Array.isArray(completions) ? completions : completions.items;
assert.ok(items.length > 0);
```

## Testing Environment Setup

### Prerequisites
- Node.js >=22.0.0
- Built project (`npm run build`)
- All dependencies installed (`npm install`)

### Running Tests
```bash
# Run all tests including LSP integration
npm test

# Run only LSP integration tests
npm test -- tests/integration/lsp-server.test.ts

# Run with verbose output
npm test -- --verbose tests/integration/lsp-server.test.ts
```

### CI/CD Considerations
- Tests spawn real processes (ensure sufficient resources)
- Timeouts may need adjustment in containerized environments  
- Clean process cleanup prevents resource leaks
- Tests are deterministic and don't require external dependencies

## Success Metrics

### Quality Indicators
- All tests pass consistently
- Tests fail when LSP server is broken (no false confidence)
- Complete protocol coverage (initialize → work → shutdown)
- Performance within acceptable limits
- Zero anti-pattern violations in code reviews

### Coverage Targets
- **Protocol Messages**: 100% of supported LSP methods tested
- **Error Scenarios**: All major error cases covered
- **Lifecycle Events**: Complete server lifecycle tested
- **Behavioral Requirements**: All 5 AEARS requirements verified

## Future Enhancements

### Planned Improvements
1. **VS Code Extension Testing**: Add E2E tests with real VS Code extension
2. **Performance Benchmarks**: Add automated performance regression testing
3. **Protocol Compliance**: Add comprehensive LSP specification compliance tests
4. **Error Injection**: Add tests that inject errors to verify resilience

### Monitoring and Alerting
- Track test execution times for performance regression
- Monitor resource usage during test runs
- Alert on test flakiness or timeout increases
- Regular review of test coverage and quality

## Conclusion

This testing strategy ensures that the AEARS LSP implementation is thoroughly tested through real protocol communication rather than internal implementation details. By following these guidelines, we maintain high confidence in LSP functionality while avoiding common testing anti-patterns that create false security.

The key principle remains: **test the behavior that users experience, not the syntax that developers write.**