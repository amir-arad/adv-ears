import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { 
  validateDocument, 
  getHoverInfo
} from '../../src/lsp/handlers.js';
import { getCompletionItems, resolveCompletionItem } from '../../src/lsp/completion-providers.js';
import { createRange, getWordRangeAtPosition } from '../../src/lsp/utils.js';
import { createTextDocument } from '../../src/lsp/mocks.js';
import { 
  CompletionItemKind, 
  DiagnosticSeverity, 
  MarkupKind,
  TextDocumentPositionParams,
  HoverParams
} from 'vscode-languageserver/node.js';

describe('LSP Protocol Tests', () => {
  describe('The language server shall provide syntax validation', () => {
    it('should validate valid AEARS syntax and return no diagnostics', () => {
      const validContent = `The system shall authenticate users
When login attempted the system shall validate credentials`;
      
      const document = createTextDocument('file:///test.aears', validContent);
      const settings = { maxNumberOfProblems: 1000 };
      
      const result = validateDocument(document, settings, false);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.diagnostics.length, 0);
    });

    it('should detect invalid AEARS syntax and return error diagnostics', () => {
      const invalidContent = `This is not valid AEARS syntax
Random text without proper structure`;
      
      const document = createTextDocument('file:///test.aears', invalidContent);
      const settings = { maxNumberOfProblems: 1000 };
      
      const result = validateDocument(document, settings, false);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.diagnostics.length > 0);
      assert.strictEqual(result.diagnostics[0].severity, DiagnosticSeverity.Error);
      assert.strictEqual(result.diagnostics[0].source, 'aears-lsp');
    });

    it('should respect maxNumberOfProblems setting', () => {
      const invalidContent = `Invalid line 1
Invalid line 2
Invalid line 3`;
      
      const document = createTextDocument('file:///test.aears', invalidContent);
      const settings = { maxNumberOfProblems: 2 };
      
      const result = validateDocument(document, settings, false);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.diagnostics.length <= 2);
    });

    it('should include related information when capability is enabled', () => {
      const invalidContent = `Invalid AEARS syntax`;
      
      const document = createTextDocument('file:///test.aears', invalidContent);
      const settings = { maxNumberOfProblems: 1000 };
      
      const result = validateDocument(document, settings, true);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.diagnostics.length > 0);
      assert.ok(result.diagnostics[0].relatedInformation);
      assert.strictEqual(result.diagnostics[0].relatedInformation[0].message, 'AEARS syntax error');
    });
  });

  describe('The language server shall offer auto-completion', () => {
    it('should provide AEARS keyword completions', () => {
      const params: TextDocumentPositionParams = {
        textDocument: { uri: 'file:///test.aears' },
        position: { line: 0, character: 0 }
      };
      
      const completions = getCompletionItems();
      
      assert.ok(completions.length > 0);
      
      const expectedKeywords = ['The', 'When', 'While', 'If', 'Where', 'shall', 'shall not'];
      expectedKeywords.forEach(keyword => {
        const item = completions.find(c => c.label === keyword);
        assert.ok(item, `Expected completion item for keyword: ${keyword}`);
        assert.strictEqual(item.kind, CompletionItemKind.Keyword);
      });
    });

    it('should provide detailed documentation for UB completions', () => {
      const item = resolveCompletionItem({
        label: 'The',
        kind: CompletionItemKind.Keyword,
        data: 1
      });
      
      assert.ok(item.documentation);
      assert.ok(item.documentation.includes('UB (Ubiquitous)'));
      assert.ok(item.documentation.includes('Example:'));
    });

    it('should provide detailed documentation for EV completions', () => {
      const item = resolveCompletionItem({
        label: 'When',
        kind: CompletionItemKind.Keyword,
        data: 2
      });
      
      assert.ok(item.documentation);
      assert.ok(item.documentation.includes('EV (Event-driven)'));
      assert.ok(item.documentation.includes('Example:'));
    });

    it('should provide detailed documentation for UW completions', () => {
      const item = resolveCompletionItem({
        label: 'shall not',
        kind: CompletionItemKind.Keyword,
        data: 7
      });
      
      assert.ok(item.documentation);
      assert.ok(item.documentation.includes('UW (Unwanted)'));
      assert.ok(item.documentation.includes('Example:'));
    });
  });

  describe('When hover requested the language server shall display entity information', () => {
    it('should provide hover information for actors', () => {
      const content = `The system shall authenticate users
The database shall store user credentials`;
      
      const document = createTextDocument('file:///test.aears', content);
      const params: HoverParams = {
        textDocument: { uri: 'file:///test.aears' },
        position: { line: 0, character: 4 } // Position on "system"
      };
      
      const hover = getHoverInfo(params, document);
      
      assert.ok(hover);
      assert.strictEqual(hover.contents.kind, MarkupKind.Markdown);
      assert.ok(hover.contents.value.includes('**Actor**: system'));
      assert.ok(hover.contents.value.includes('**Use Cases**:'));
    });

    it('should provide hover information for AEARS keywords', () => {
      const content = `The system shall authenticate users`;
      
      const document = createTextDocument('file:///test.aears', content);
      const params: HoverParams = {
        textDocument: { uri: 'file:///test.aears' },
        position: { line: 0, character: 0 } // Position on "The"
      };
      
      const hover = getHoverInfo(params, document);
      
      assert.ok(hover);
      assert.strictEqual(hover.contents.kind, MarkupKind.Markdown);
      assert.ok(hover.contents.value.includes('**UB (Ubiquitous)**'));
      assert.ok(hover.contents.value.includes('The [entity] shall [functionality]'));
    });

    it('should provide hover information for "When" keyword', () => {
      const content = `When login attempted the system shall validate credentials`;
      
      const document = createTextDocument('file:///test.aears', content);
      const params: HoverParams = {
        textDocument: { uri: 'file:///test.aears' },
        position: { line: 0, character: 2 } // Position on "When"
      };
      
      const hover = getHoverInfo(params, document);
      
      assert.ok(hover);
      assert.ok(hover.contents.value.includes('**EV (Event-driven)**'));
      assert.ok(hover.contents.value.includes('When [precondition] the [entity] shall [functionality]'));
    });

    it('should provide hover information for "shall" keyword', () => {
      const content = `The system shall authenticate users`;
      
      const document = createTextDocument('file:///test.aears', content);
      const params: HoverParams = {
        textDocument: { uri: 'file:///test.aears' },
        position: { line: 0, character: 11 } // Position on "shall"
      };
      
      const hover = getHoverInfo(params, document);
      
      assert.ok(hover);
      assert.ok(hover.contents.value.includes('**Required Action**'));
      assert.ok(hover.contents.value.includes('mandatory requirement'));
    });

    it('should return undefined for invalid positions', () => {
      const content = `The system shall authenticate users`;
      
      const document = createTextDocument('file:///test.aears', content);
      const params: HoverParams = {
        textDocument: { uri: 'file:///test.aears' },
        position: { line: 10, character: 0 } // Invalid line
      };
      
      const hover = getHoverInfo(params, document);
      
      assert.strictEqual(hover, undefined);
    });
  });

  describe('WHERE LSP client connected the language server shall send diagnostics', () => {
    it('should generate diagnostics for syntax errors', () => {
      const invalidContent = `Malformed requirement without proper structure`;
      
      const document = createTextDocument('file:///test.aears', invalidContent);
      const settings = { maxNumberOfProblems: 1000 };
      
      const result = validateDocument(document, settings, false);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.diagnostics.length > 0);
      
      const diagnostic = result.diagnostics[0];
      assert.strictEqual(diagnostic.severity, DiagnosticSeverity.Error);
      assert.strictEqual(diagnostic.source, 'aears-lsp');
      assert.ok(diagnostic.message.length > 0);
      assert.ok(diagnostic.range);
      assert.ok(typeof diagnostic.range.start.line === 'number');
      assert.ok(typeof diagnostic.range.start.character === 'number');
    });

    it('should generate appropriate diagnostic ranges', () => {
      const invalidContent = `Invalid syntax here`;
      
      const document = createTextDocument('file:///test.aears', invalidContent);
      const settings = { maxNumberOfProblems: 1000 };
      
      const result = validateDocument(document, settings, false);
      
      assert.ok(result.diagnostics.length > 0);
      
      const diagnostic = result.diagnostics[0];
      assert.strictEqual(diagnostic.range.start.line, 0);
      assert.strictEqual(diagnostic.range.start.character, 0);
      assert.strictEqual(diagnostic.range.end.line, 0);
      assert.strictEqual(diagnostic.range.end.character, invalidContent.length);
    });
  });

  describe('WHILE editing active the validation shall run continuously', () => {
    it('should handle document changes from invalid to valid', () => {
      const initialContent = 'The system shall'; // Incomplete
      const completedContent = 'The system shall authenticate users'; // Complete
      
      const initialDocument = createTextDocument('file:///test.aears', initialContent);
      const completedDocument = createTextDocument('file:///test.aears', completedContent);
      const settings = { maxNumberOfProblems: 1000 };
      
      const initialResult = validateDocument(initialDocument, settings, false);
      const completedResult = validateDocument(completedDocument, settings, false);
      
      assert.strictEqual(initialResult.success, false);
      assert.ok(initialResult.diagnostics.length > 0);
      
      assert.strictEqual(completedResult.success, true);
      assert.strictEqual(completedResult.diagnostics.length, 0);
    });

    it('should handle document changes from valid to invalid', () => {
      const validContent = 'The system shall authenticate users';
      const invalidContent = 'Invalid syntax here';
      
      const validDocument = createTextDocument('file:///test.aears', validContent);
      const invalidDocument = createTextDocument('file:///test.aears', invalidContent);
      const settings = { maxNumberOfProblems: 1000 };
      
      const validResult = validateDocument(validDocument, settings, false);
      const invalidResult = validateDocument(invalidDocument, settings, false);
      
      assert.strictEqual(validResult.success, true);
      assert.strictEqual(validResult.diagnostics.length, 0);
      
      assert.strictEqual(invalidResult.success, false);
      assert.ok(invalidResult.diagnostics.length > 0);
    });
  });

  describe('Helper functions', () => {
    it('should create valid ranges', () => {
      const range = createRange(0, 0, 0, 10);
      
      assert.strictEqual(range.start.line, 0);
      assert.strictEqual(range.start.character, 0);
      assert.strictEqual(range.end.line, 0);
      assert.strictEqual(range.end.character, 10);
    });

    it('should find word ranges at positions', () => {
      const line = 'The system shall authenticate users';
      
      const wordRange = getWordRangeAtPosition(line, 4);
      assert.ok(wordRange);
      assert.strictEqual(line.substring(wordRange.start, wordRange.end), 'system');
    });

    it('should return undefined for invalid word positions', () => {
      const line = 'The system shall authenticate users';
      
      const wordRange = getWordRangeAtPosition(line, 3); // On space
      assert.strictEqual(wordRange, undefined);
    });
  });
});