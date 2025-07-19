import { DocumentNode } from '../types/ast-types.js';
import { SimpleParser } from './simple-parser.js';

interface ParseResult {
  ast?: DocumentNode;
  errors: string[];
  warnings: string[];
  success: boolean;
}

export function parseAearsFile(content: string): ParseResult {
  const parser = new SimpleParser();

  try {
    const ast = parser.parseDocument(content);

    return {
      ast,
      success: true,
      errors: [],
      warnings: [],
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Unknown parsing error',
      ],
      warnings: [],
    };
  }
}
