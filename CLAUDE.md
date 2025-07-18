# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adv-EARS is a formal requirements language tool that automatically generates UML diagrams from structured natural language requirements. It includes a TypeScript parser library, VS Code language server, and UML generator.

## Essential Commands

### Development
- `npm run build` - Compile TypeScript to dist/
- `npm run dev` - Watch mode compilation
- `npm run typecheck` - Type checking without emit
- `npm run clean` - Remove dist/ directory

### Testing
- `npm test` - Run all tests with tsx test runner
- `npm run test:watch` - Run tests in watch mode
- Run single test: `npm test -- tests/unit/parser.test.ts`

### Code Quality
- `npm run lint` - ESLint check
- `npm run lint:fix` - ESLint auto-fix
- `npm run knip` - Unused dependency detection

### CLI Usage
- `npm run cli -- --help` - CLI help (after build)
- `node dist/cli.js <file.aears>` - Process aears file

## Architecture

### Core Processing Flow
```
.aears files → SimpleParser → AST → ASTGenerator → UML/Analysis
```

### Key Components
- **SimpleParser** (`src/parser/simple-parser.ts`): Regex-based parser for 6 requirement types
- **AST Types** (`src/types/ast-types.ts`): RequirementNode, DocumentNode definitions
- **ASTGenerator** (`src/ast/ast-generator.ts`): CST→AST conversion, actor/use case extraction
- **File Parser** (`src/parser/file-parser.ts`): Entry point with error handling

### Architecture Pattern
- Currently single-package structure (monorepo planned)
- Parser-first approach with simple regex patterns
- AST-based processing for extensibility
- Error recovery and graceful degradation

## .aears Language Format

### Requirement Types
- **UB**: `The <entity> shall <functionality>`
- **EV**: `When <preconditions> the <entity> shall <functionality>`
- **UW**: `The <entity> shall not <functionality>`
- **ST**: `While <state> the <entity> shall <functionality>`
- **OP**: `If <condition> then the <entity> shall <functionality>`
- **OP**: `Where <condition> the <entity> shall <functionality>`
- **HY**: Hybrid - Complex conditional statements (planned)

### Case Sensitivity
- Keywords can be uppercase or lowercase (IF/if, THEN/then, WHERE/where)
- Patterns are case-insensitive in current implementation

## Development Configuration

### TypeScript
- Target: ES2022 with strict mode, ESM modules
- Output: `dist/` with declaration maps and source maps
- Node.js >=22.0.0 required

### Testing
- Node.js built-in test runner via tsx
- Test files: `tests/**/*.test.ts`
- Fixtures: `tests/fixtures/*.aears`
- System test file: `system.aears`

### Code Quality Standards
- ESLint with TypeScript rules, complexity max 10
- Knip for unused dependency detection
- File naming: lowercase with hyphens (ast-generator.ts)
- Max 200 lines per file, 100 lines per function

## Key Development Patterns

- Functions over classes (unless classes result in shorter code)
- Type inference for return types, explicit typing for parameters
- Avoid `any` type - use `unknown` when uncertain
- Pure functions and single responsibility principle
- Error handling with success/error result objects

## Testing Standards

**Design Decision: Tests Derive from Requirements**

Tests in this project follow a specific architectural pattern:
- **Test files derive from .aears files** - Each requirement becomes a test
- **Test names match requirement statements** - Use exact requirement text as test names
- **Tests verify actual functionality** - Not just parser syntax recognition
- **One test per requirement** - Each test validates one specific behavioral rule

**Critical Rule: Test the behavior, not the syntax**

- ❌ **NEVER** write tests that only verify parser can parse requirement statements
- ❌ **NEVER** add comments excusing unimplemented features (e.g., "Currently X doesn't work, so we expect failure")
- ❌ **NEVER** write tests that expect failure because functionality isn't implemented
- ✅ **ALWAYS** test the actual functionality described in the requirement
- ✅ **ALWAYS** make tests fail when the claimed functionality doesn't work
- ✅ **ALWAYS** verify actual system behavior, not syntax recognition

**Examples:**
- ❌ Bad: `it('The extension shall register aears file association', () => { parseAearsFile('The extension shall register aears file association'); })`
- ❌ Bad: `it('should collect multiple errors', () => { assert.strictEqual(result.success, false); // Currently only handles first error })`
- ✅ Good: `it('The extension shall register aears file association', () => { /* test actual VS Code file association registration */ })`
- ✅ Good: `it('The cli shall accept aears file input', () => { /* test CLI actually accepts .aears files */ })`
- ✅ Good: `it('The error reporter shall provide line numbers', () => { /* test error messages actually include line numbers */ })`

**Test Structure:**
```typescript
// Derived from requirement in .aears file
it('The parser shall tokenize aears files', () => {
  // Test actual tokenization behavior
  const tokens = tokenize('The system shall work');
  assert.ok(tokens.length > 0);
});
```

**Test Integrity:** Every test must verify the actual behavior described in the requirement. Testing syntax recognition creates false confidence about unimplemented features.

**Critical Anti-Pattern:** Testing that parser can parse "The X shall Y" does NOT test that X actually does Y.