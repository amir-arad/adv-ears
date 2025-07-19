import {
  Diagnostic,
  DiagnosticSeverity,
  Hover,
  HoverParams,
} from 'vscode-languageserver/node.js';
import { createRange, getWordRangeAtPosition } from './utils.js';
import {
  getActorHover,
  getKeywordHover,
  getUseCaseHover,
} from './hover-providers.js';

import { ASTGenerator } from '../ast/ast-generator.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { parseAearsFile } from '../parser/file-parser.js';

export interface LSPSettings {
  maxNumberOfProblems: number;
}

interface ValidationResult {
  diagnostics: Diagnostic[];
  success: boolean;
}

/**
 * Validates an AEARS document and returns diagnostics
 */
export function validateDocument(
  textDocument: TextDocument,
  settings: LSPSettings,
  hasDiagnosticRelatedInfo: boolean = false
): ValidationResult {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  const parseResult = parseAearsFile(text);

  if (!parseResult.success) {
    parseResult.errors.forEach((error, index) => {
      if (index >= settings.maxNumberOfProblems) {
        return;
      }

      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: createRange(0, 0, 0, text.length),
        message: error,
        source: 'aears-lsp',
      };

      if (hasDiagnosticRelatedInfo) {
        diagnostic.relatedInformation = [
          {
            location: {
              uri: textDocument.uri,
              range: diagnostic.range,
            },
            message: 'AEARS syntax error',
          },
        ];
      }

      diagnostics.push(diagnostic);
    });
  }

  return {
    diagnostics,
    success: parseResult.success,
  };
}

/**
 * Provides hover information for positions in AEARS documents
 */
export function getHoverInfo(
  params: HoverParams,
  document: TextDocument
): Hover | undefined {
  const position = params.position;
  const text = document.getText();
  const lines = text.split('\n');

  if (position.line >= lines.length) {
    return undefined;
  }

  const line = lines[position.line];
  const wordRange = getWordRangeAtPosition(line, position.character);

  if (!wordRange) {
    return undefined;
  }

  const word = line.substring(wordRange.start, wordRange.end);

  // Try keyword hover first (most common case)
  const keywordHover = getKeywordHover(word);
  if (keywordHover) {
    return keywordHover;
  }

  // Parse the document to get AST information for actors/use cases
  const parseResult = parseAearsFile(text);
  if (!parseResult.success) {
    return undefined;
  }

  const generator = new ASTGenerator();
  const actors = generator.extractActors(parseResult.ast!);
  const useCases = generator.extractUseCases(parseResult.ast!);

  // Check if the word is an actor
  const actorHover = getActorHover(word, actors, useCases);
  if (actorHover) {
    return actorHover;
  }

  // Check if the word is a use case
  const useCaseHover = getUseCaseHover(word, useCases);
  if (useCaseHover) {
    return useCaseHover;
  }

  return undefined;
}
