import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  InitializeResult,
  HoverParams,
  Hover,
} from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateDocument, getHoverInfo, LSPSettings } from './handlers.js';
import {
  getCompletionItems,
  resolveCompletionItem,
} from './completion-providers.js';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [
          'T',
          'W',
          'I',
          'the',
          'when',
          'if',
          'where',
          'while',
        ],
      },
      // Tell the client that this server supports hover
      hoverProvider: true,
    },
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(() => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The global settings, used when the `workspace/configuration` request is not supported by the client
const defaultSettings: LSPSettings = { maxNumberOfProblems: 1000 };
let globalSettings: LSPSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Promise<LSPSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <LSPSettings>(
      (change.settings.aearsLanguageServer || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Promise<LSPSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'aearsLanguageServer',
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const settings = await getDocumentSettings(textDocument.uri);

  const result = validateDocument(
    textDocument,
    settings,
    hasDiagnosticRelatedInformationCapability
  );

  // Send the computed diagnostics to VSCode
  connection.sendDiagnostics({
    uri: textDocument.uri,
    diagnostics: result.diagnostics,
  });
}

// This handler provides the initial list of the completion items
connection.onCompletion(getCompletionItems);

// This handler resolves additional information for the item selected in
// the completion list
connection.onCompletionResolve(resolveCompletionItem);

// This handler provides hover information
connection.onHover((params: HoverParams): Hover | undefined => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return undefined;
  }

  return getHoverInfo(params, document);
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
