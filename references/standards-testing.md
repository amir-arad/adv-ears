# Testing Standards

## Core Principle: Test Behavior, Not Syntax

Tests derive from `.aears` files with these rules:
- **One test per requirement** - Use exact requirement text as test names
- **Test actual functionality** - Not parser syntax recognition
- **Verify system behavior** - Not just statement parsing

## Critical Anti-Patterns

### 🚫 Syntax Testing (Never Do)
```typescript
// ❌ BAD: Only tests parser recognition
it('The extension shall register aears file association', () => {
  const result = parseAearsFile('The extension shall register aears file association');
  assert.strictEqual(result.success, true);
});
```

### 🚫 Excuse Comments (Never Do)
```typescript
// ❌ BAD: Excusing unimplemented behavior
it('should collect multiple errors during parsing', () => {
  // Currently doesn't work, so we expect failure
  assert.strictEqual(result.success, false);
});
```

## Correct Patterns

### ✅ Behavior Testing
```typescript
// ✅ GOOD: Tests actual functionality
it('The extension shall register aears file association', () => {
  const associations = vscode.workspace.getConfiguration('files').associations;
  assert.strictEqual(associations['*.aears'], 'aears');
});
```

### ✅ Honest Test Names
```typescript
// ✅ GOOD: Name matches actual behavior
it('should fail on first error', () => {
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.length > 0);
});
```

## Test Structure

- **File Organization**: Test files correspond to `.aears` files
- **Test Naming**: Use exact requirement text as test names
- **Test Content**: Verify end-to-end functionality with real implementations

## Domain Examples

```typescript
// CLI Testing
it('The cli shall accept aears file input', () => {
  const result = runCLI(['validate', 'test.aears']);
  assert.strictEqual(result.exitCode, 0);
});

// Error Handling
it('The error reporter shall provide line numbers', () => {
  const result = parseAearsFile('invalid\nsyntax');
  assert.ok(result.errors[0].includes('Line 2'));
});
```

## Key Rules

1. **Truth in Testing**: Tests must accurately represent system capabilities
2. **No False Confidence**: Never create illusions about unimplemented features
3. **Behavioral Verification**: Test what the system actually does
4. **Requirement Traceability**: Maintain clear requirement-to-test links

## Common Mistakes

- **Testing parser instead of functionality** - Test that X does Y, not that parser can parse "X shall Y"
- **Misleading test names** - Don't claim to test unimplemented features
- **Excuse comments** - Don't explain why tests expect failure
- **False coverage** - Don't test syntax when claiming to test behavior

**Key Insight**: Testing that parser can parse "The X shall Y" does NOT test that X actually does Y.