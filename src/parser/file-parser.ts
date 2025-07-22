import { DocumentNode } from '../types/ast-types.js';
import { SimpleParser } from './simple-parser.js';

export interface ParseError {
  line: number;
  message: string;
}

interface ParseResult {
  ast?: DocumentNode;
  errors: string[];
  warnings: string[];
  success: boolean;
  structuredErrors: ParseError[];
}

export function parseAearsFile(content: string): ParseResult {
  const parser = new SimpleParser();

  const { ast, errors } = parser.parseDocument(content);

  return {
    ast,
    success: errors.length === 0,
    errors: errors.map(e => `Line ${e.line}: ${e.message}`),
    warnings: [],
    structuredErrors: errors,
  };
}
