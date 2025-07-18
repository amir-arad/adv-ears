# Adv-EARS Product Brief

**What:** Formal requirements syntax with automated use case generation

**Problem:** Manual requirements→UML conversion causes errors, ambiguity

**Solution:** 
- Structured syntax: `The <entity> shall <functionality>`
- CFG parser extracts actors/use cases automatically
- Generates UML diagrams

**Syntax Types:**
- UB: Ubiquitous 
- EV: Event-driven
- UW: Unwanted behavior
- ST: State-driven  
- OP: Optional features
- HY: Hybrid (new)

**Benefits:**
- Eliminates manual interpretation errors
- Automated UML generation
- Maintains natural language readability
- Consistent requirements across teams

**Target Users:**
- Requirements engineers
- Systems analysts
- Software architects

**Technical Stack:**
- TypeScript parser library
- VS Code language server
- CFG-based grammar
- AST→UML transformation

**File Extension:** `.aears`