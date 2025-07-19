# Adv-EARS

> **Advanced Easy Approach to Requirements Syntax** - A formal requirements language tool that automatically generates UML diagrams from structured natural language requirements.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

## Features

✨ **Structured Requirements Syntax** - Write requirements in natural language with formal structure  
🎯 **Automatic UML Generation** - Generate PlantUML diagrams from requirements  
🔍 **Real-time Validation** - Language server with syntax checking and auto-completion  
📊 **Requirements Analysis** - Extract actors, use cases, and statistics  
🛠️ **CLI Tools** - Command-line interface for validation, parsing, and generation  
🧪 **Type-Safe** - Full TypeScript implementation with comprehensive testing

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [AEARS Language Syntax](#aears-language-syntax)
- [CLI Usage](#cli-usage)
- [Language Server (LSP)](#language-server-lsp)
- [API Usage](#api-usage)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js ≥ 22.0.0
- npm or yarn

### Install from Source

```bash
# Clone the repository
git clone https://github.com/amir-arad/adv-ears.git
cd adv-ears

# Install dependencies
npm install

# Build the project
npm run build
```

## Quick Start

### 1. Create an AEARS file

Create a file `example.aears`:

```aears
The system shall authenticate users
When login attempted the system shall validate credentials
The system shall not allow unauthorized access
While session active the system shall maintain state
If user authenticated then the system shall grant access
```

### 2. Validate the file

```bash
npm start validate example.aears
```

### 3. Generate UML diagram

```bash
npm start generate example.aears --title --stats
```

Output:
```plantuml
@startuml

title Requirements Use Case Diagram

!-- Actors --
actor "system" as system
actor "user" as user

!-- Use Cases --
usecase "authenticate users" as UC1
usecase "validate credentials" as UC2
usecase "allow unauthorized access" as UC3
usecase "maintain state" as UC4
usecase "grant access" as UC5

!-- Relationships --
system --> UC1
system ..> UC2
system --x UC3
system ==> UC4
system -.> UC5

@enduml
```

## AEARS Language Syntax

AEARS supports six requirement types, each with specific syntax patterns:

### UB - Ubiquitous (Basic Functionality)
```aears
The <entity> shall <functionality>
```
**Example:** `The system shall authenticate users`

### EV - Event-driven
```aears
When <precondition> the <entity> shall <functionality>
```
**Example:** `When login attempted the system shall validate credentials`

### UW - Unwanted Behavior
```aears
The <entity> shall not <functionality>
```
**Example:** `The system shall not allow unauthorized access`

### ST - State-driven
```aears
While <state> the <entity> shall <functionality>
```
**Example:** `While session active the system shall maintain state`

### OP - Optional (Conditional)
```aears
If <condition> then the <entity> shall <functionality>
Where <condition> the <entity> shall <functionality>
```
**Examples:** 
- `If user authenticated then the system shall grant access`
- `Where security enabled the system shall log activities`

### HY - Hybrid (Planned)
Complex conditional statements - feature in development.

### Language Features

- **Case Insensitive**: Keywords can be uppercase or lowercase (`IF`/`if`, `THEN`/`then`)
- **Natural Language**: Requirements remain readable while maintaining formal structure
- **Actor Extraction**: System automatically identifies entities as actors
- **Use Case Generation**: Functionalities become use cases in UML diagrams

## CLI Usage

The CLI provides five main commands for working with AEARS files:

### `validate` - File Validation

Validate AEARS file syntax:

```bash
npm start validate <file.aears> [options]

Options:
  -v, --verbose    Show detailed output including statistics and actors
```

**Examples:**
```bash
# Basic validation
npm start validate requirements.aears

# Verbose output with statistics
npm start validate requirements.aears --verbose
```

### `parse` - AST Generation

Parse AEARS files and output the Abstract Syntax Tree:

```bash
npm start parse <file.aears> [options]

Options:
  -o, --output <file>    Output file (default: stdout)
  -f, --format <format>  Output format: json|pretty (default: pretty)
```

**Examples:**
```bash
# Pretty-printed AST to console
npm start parse requirements.aears

# JSON output to file
npm start parse requirements.aears --format json --output ast.json
```

### `generate` - UML Generation

Generate UML diagrams from AEARS files:

```bash
npm start generate <file.aears> [options]

Options:
  -o, --output <file>           Output file (default: stdout)
  -f, --format <format>         Output format: plantuml|report (default: plantuml)
  --title                       Include title in UML diagram
  --stats                       Include statistics in UML diagram
  --no-relationships            Exclude relationships in UML diagram
```

**Examples:**
```bash
# Basic PlantUML generation
npm start generate requirements.aears

# Full-featured diagram with title and stats
npm start generate requirements.aears --title --stats --output diagram.puml

# Text report instead of UML
npm start generate requirements.aears --format report
```

### `analyze` - Requirements Analysis

Analyze AEARS files and show detailed metrics:

```bash
npm start analyze <file.aears>
```

**Output includes:**
- Total requirement counts by type
- Identified actors and use cases
- Requirement type coverage analysis
- Missing requirement type warnings

### `lsp` - Language Server

Start the Language Server Protocol server:

```bash
npm start lsp [options]

Options:
  --stdio              Use stdio for communication
  --socket <port>      Use socket for communication
  --node-ipc           Use Node IPC for communication
```

### Error Handling

All CLI commands:
- Exit with code 0 on success
- Exit with code 1 on error
- Require `.aears` file extension
- Provide detailed error messages for syntax issues

## Language Server (LSP)

The AEARS Language Server provides rich IDE support with real-time features:

### Features

- **Syntax Validation**: Real-time error detection and reporting
- **Auto-completion**: Intelligent suggestions for AEARS keywords
- **Hover Information**: Context-aware help for entities and keywords
- **Diagnostics**: Live error reporting with detailed messages
- **Continuous Validation**: Updates validation as you type

### VS Code Extension (Development)

For local development with full VS Code integration:

1. **Build the project**: `npm run build`
2. **Setup extension**:
   ```bash
   cd .vscode/extensions/aears-language-server
   npm install
   npm run compile
   ```
3. **Launch extension**: Press `F5` in VS Code to open Extension Development Host
4. **Test**: Open `.aears` files in the new window to test language server features

The extension provides syntax highlighting, error diagnostics, and auto-completion for AEARS files.

### LSP Capabilities

- **Text Document Sync**: Incremental updates
- **Completion Provider**: Trigger characters and keyword suggestions
- **Hover Provider**: Contextual information on demand
- **Diagnostic Publisher**: Real-time error reporting

## API Usage

### TypeScript Library

Use Adv-EARS as a TypeScript library in your projects:

```typescript
import { parseAearsFile } from 'adv-ears';
import { UMLGenerator } from 'adv-ears';

// Parse AEARS content
const content = `
The system shall authenticate users
When login attempted the system shall validate credentials
`;

const result = parseAearsFile(content);

if (result.success) {
  // Generate UML
  const generator = new UMLGenerator();
  const uml = generator.generatePlantUML(result.ast);
  console.log(uml);
} else {
  console.error('Parse errors:', result.errors);
}
```

### Core Classes

#### `parseAearsFile(content: string)`
- Parses AEARS content and returns success/error result
- Returns AST on success or error list on failure

#### `UMLGenerator`
- `generatePlantUML(ast, options?)`: Create PlantUML diagram
- `generateReport(ast)`: Create text analysis report

#### `ASTGenerator`
- `extractActors(ast)`: Get unique actors from requirements
- `extractUseCases(ast)`: Get actor-functionality pairs
- `getStatistics(ast)`: Get requirement type counts

### Error Handling

The library uses result objects for error handling:

```typescript
interface ParseResult {
  success: boolean;
  ast?: DocumentNode;
  errors: string[];
}
```

## Development

### Architecture

```
.aears files → SimpleParser → AST → ASTGenerator → UML/Analysis
```

### Key Components

- **SimpleParser** (`src/parser/simple-parser.ts`): Regex-based parser for 6 requirement types
- **AST Types** (`src/types/ast-types.ts`): RequirementNode, DocumentNode definitions
- **ASTGenerator** (`src/ast/ast-generator.ts`): AST processing, actor/use case extraction
- **UMLGenerator** (`src/generators/uml-generator.ts`): PlantUML diagram generation
- **LSP Server** (`src/lsp/server.ts`): Language Server Protocol implementation

### Development Commands

```bash
# Development with watch mode
npm run dev

# Type checking
npm run typecheck

# Code quality
npm run lint
npm run lint:fix

# Dependency analysis
npm run knip

# Full check (lint + typecheck + format + test)
npm run check

# Clean build artifacts
npm run clean
```

### Code Quality Standards

- **ESLint**: TypeScript rules, max complexity 10
- **Prettier**: Consistent code formatting
- **File Limits**: Max 200 lines per file, 100 lines per function
- **Type Safety**: Avoid `any`, use `unknown` when needed
- **Patterns**: Functions over classes, pure functions, single responsibility

## Testing

### Test Philosophy

Tests derive directly from requirements and verify actual behavior:

```typescript
// ✅ Good: Tests actual functionality
it('The parser shall tokenize aears files', () => {
  const tokens = tokenize('The system shall work');
  assert.ok(tokens.length > 0);
});

// ❌ Bad: Only tests syntax recognition
it('should parse requirement', () => {
  parseAearsFile('The system shall work'); // Doesn't test actual behavior
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Run specific test
npm test -- tests/unit/parser.test.ts
```

### Test Categories

- **Unit Tests** (`tests/unit/`): Individual component testing
- **Integration Tests** (`tests/integration/`): End-to-end feature testing
- **Contract Tests** (`tests/contract/`): Requirements-derived behavioral tests
- **LSP Tests** (`tests/integration/lsp-server.test.ts`): Real protocol testing

### Test Standards

- **Behavior-Driven**: Test what the requirement claims to do
- **Real Protocol**: LSP tests use actual JSON-RPC communication
- **One Test Per Requirement**: Each test validates one specific behavior
- **No False Confidence**: Tests must fail when functionality doesn't work

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run the full check: `npm run check`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request

### Development Guidelines

- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure all checks pass: `npm run check`
- Write clear commit messages
- Keep pull requests focused and atomic

### Code Style

- Use TypeScript strict mode
- Prefer functions over classes unless classes are shorter
- Use explicit typing for parameters, infer return types
- Follow the established naming conventions
- Maintain file and function length limits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Author:** Amir Arad <greenshade@gmail.com>

**Keywords:** requirements, uml, parser, formal-language, diagram-generation