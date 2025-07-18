# Adv-EARS Solution Design

## Architecture
```
.aears files → Lexer → Parser → AST → UML Generator
                ↓
         Language Server ← VS Code Extension
```

## Core Components

**Parser Library** (`@adv-ears/parser`)
- Chevrotain-based CFG
- AST generation
- Error recovery

**Language Server** (`@adv-ears/lsp`)
- Syntax validation
- Hover info
- Auto-completion
- Diagnostics

**VS Code Extension**
- File association `.aears`
- Syntax highlighting
- Command palette integration

**UML Generator** (`@adv-ears/uml`)
- AST → PlantUML
- Actor/use case extraction
- Relationship mapping

## Grammar Rules
```
requirement: UB | EV | UW | ST | OP | HY
UB: "The" entity "shall" functionality
EV: "When" preconditions "the" entity "shall" functionality
...
```

## File Structure
```
packages/
├── parser/
├── language-server/
├── vscode-extension/
├── uml-generator/
└── cli/
```

## AST Schema
```typescript
interface Requirement {
  type: 'UB'|'EV'|'UW'|'ST'|'OP'|'HY'
  entity: string
  functionality: string
  preconditions?: string
  state?: string
}
```

## Outputs
- Real-time validation
- UML diagrams (SVG/PNG)
- Actor/use case lists
- Traceability matrix