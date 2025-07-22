import { Range } from 'vscode-languageserver/node.js';

/**
 * Helper function to create a Range object
 */
export function createRange(
  startLine: number,
  startChar: number,
  endLine: number,
  endChar: number
): Range {
  return {
    start: { line: startLine, character: startChar },
    end: { line: endLine, character: endChar },
  };
}

/**
 * Helper function to create a Range for an entire line
 */
export function createLineRange(lineNumber: number, lineText: string): Range {
  return createRange(lineNumber, 0, lineNumber, lineText.length);
}

/**
 * Helper function to get word range at position
 */
export function getWordRangeAtPosition(
  line: string,
  character: number
): { start: number; end: number } | undefined {
  const wordPattern = /\b\w+\b/g;
  let match;

  while ((match = wordPattern.exec(line)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (character >= start && character < end) {
      return { start, end };
    }
  }

  return undefined;
}
