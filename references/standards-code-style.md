## TypeScript Best Practices

- Use strict mode
- Prefer type inference for return types; avoid explicit declarations
- Always type function arguments; use interfaces for complex types
- Derive types from existing ones using `Omit`, `Pick`, unions when semantically related
- Avoid the `any` type; use `unknown` when type is uncertain
- Default to using functions over classes
- Prefer using a class when it results in simpler and shorter code
- Treat types as tests - nothing more, nothing less

## Services/Utilities

- Design functions around single responsibility
- Use pure functions when possible
- Type all function parameters
- Use custom hooks for API calls and side effects

## Code Organization

- Keep files under 200 lines; refactor at 500 lines maximum
- Use concise expressions to minimize verbosity
- Avoid code documentation except for explaining _why_, not _what_

## Tests
- Use nodejs native test, with tsx  
- Tests should be a direct reflection of .aears file (or part of it)
- Each test should be named after a single rule, and check it.