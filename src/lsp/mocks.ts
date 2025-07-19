import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * Creates a simple TextDocument for testing
 */
export function createTextDocument(
  uri: string,
  content: string,
  version = 1
): TextDocument {
  return TextDocument.create(uri, 'aears', version, content);
}
