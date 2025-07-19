import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // The server is implemented in the parent project's dist directory
  const serverModule = context.asAbsolutePath(
    path.join('..', '..', '..', 'dist', 'lsp', 'server.js')
  );

  // Debug options for the server
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // Server options
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };

  // Client options
  const clientOptions: LanguageClientOptions = {
    // Register the server for AEARS documents
    documentSelector: [{ scheme: 'file', language: 'aears' }],
    synchronize: {
      // Notify the server about file changes to '.aears' files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/*.aears')
    }
  };

  // Create the language client and start it
  client = new LanguageClient(
    'aearsLanguageServer',
    'AEARS Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}