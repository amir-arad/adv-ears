/**
 * LSP Test Client - Simple helper for real LSP protocol integration testing
 * 
 * Uses existing vscode-languageserver libraries to communicate with actual LSP server
 * instead of implementing custom JSON-RPC parsing.
 */

import { spawn, ChildProcess } from 'node:child_process';
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { 
  InitializeParams, 
  InitializeResult, 
  CompletionParams,
  CompletionList,
  CompletionItem,
  HoverParams,
  Hover,
  DidOpenTextDocumentParams,
  DidChangeTextDocumentParams,
  PublishDiagnosticsParams,
  MessageConnection
} from 'vscode-languageserver-protocol';

export interface LSPTestOptions {
  serverCommand?: string[];
  timeout?: number;
  workspaceRoot?: string;
}

export class LSPTestClient {
  private process: ChildProcess | null = null;
  private connection: MessageConnection | null = null;
  private initialized = false;
  private diagnostics: Map<string, PublishDiagnosticsParams> = new Map();

  constructor(private options: LSPTestOptions = {}) {
    this.options = {
      serverCommand: ['node', 'dist/cli/cli.js', 'lsp', '--stdio'],
      timeout: 5000,
      workspaceRoot: 'file:///test-workspace',
      ...options
    };
  }

  /**
   * Start LSP server process and establish connection
   */
  async start(): Promise<void> {
    if (this.process) {
      throw new Error('LSP client already started');
    }

    // Start server process
    this.process = spawn(this.options.serverCommand![0], this.options.serverCommand!.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    if (!this.process.stdin || !this.process.stdout || !this.process.stderr) {
      throw new Error('Failed to create server process stdio streams');
    }

    // Create JSON-RPC connection using vscode libraries
    const reader = new StreamMessageReader(this.process.stdout);
    const writer = new StreamMessageWriter(this.process.stdin);
    this.connection = createMessageConnection(reader, writer);

    // Listen for diagnostic notifications
    this.connection.onNotification('textDocument/publishDiagnostics', (params: PublishDiagnosticsParams) => {
      this.diagnostics.set(params.uri, params);
    });

    // Handle server errors
    this.process.stderr.on('data', (data) => {
      console.error('LSP Server Error:', data.toString());
    });

    this.process.on('error', (error) => {
      throw new Error(`LSP server process error: ${error.message}`);
    });

    this.process.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        throw new Error(`LSP server exited with code ${code}, signal ${signal}`);
      }
    });

    // Start listening
    this.connection.listen();

    // Give server a moment to start up
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Initialize LSP session
   */
  async initialize(capabilities: any = {}): Promise<InitializeResult> {
    if (!this.connection) {
      throw new Error('LSP client not started');
    }

    const initParams: InitializeParams = {
      processId: process.pid,
      capabilities: {
        textDocument: {
          publishDiagnostics: { relatedInformation: true },
          completion: { completionItem: { snippetSupport: true } },
          hover: { contentFormat: ['markdown', 'plaintext'] },
          ...capabilities.textDocument
        },
        ...capabilities
      },
      rootUri: this.options.workspaceRoot!,
      workspaceFolders: [{
        uri: this.options.workspaceRoot!,
        name: 'test-workspace'
      }]
    };

    const result = await this.connection.sendRequest('initialize', initParams);
    
    // Send initialized notification
    await this.connection.sendNotification('initialized', {});
    
    this.initialized = true;
    return result;
  }

  /**
   * Open a document in the LSP server
   */
  async openDocument(uri: string, languageId: string, content: string, version = 1): Promise<void> {
    if (!this.connection || !this.initialized) {
      throw new Error('LSP client not initialized');
    }

    const params: DidOpenTextDocumentParams = {
      textDocument: {
        uri,
        languageId,
        version,
        text: content
      }
    };

    await this.connection.sendNotification('textDocument/didOpen', params);
    
    // Give server time to process and send diagnostics
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Change document content
   */
  async changeDocument(uri: string, content: string, version: number): Promise<void> {
    if (!this.connection || !this.initialized) {
      throw new Error('LSP client not initialized');
    }

    const params: DidChangeTextDocumentParams = {
      textDocument: { uri, version },
      contentChanges: [{ text: content }]
    };

    await this.connection.sendNotification('textDocument/didChange', params);
    
    // Give server time to process and send diagnostics  
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Request completion at position
   */
  async getCompletion(uri: string, line: number, character: number): Promise<CompletionList | CompletionItem[]> {
    if (!this.connection || !this.initialized) {
      throw new Error('LSP client not initialized');
    }

    const params: CompletionParams = {
      textDocument: { uri },
      position: { line, character }
    };

    return await this.connection.sendRequest('textDocument/completion', params);
  }

  /**
   * Request hover information at position
   */
  async getHover(uri: string, line: number, character: number): Promise<Hover | null> {
    if (!this.connection || !this.initialized) {
      throw new Error('LSP client not initialized');
    }

    const params: HoverParams = {
      textDocument: { uri },
      position: { line, character }
    };

    return await this.connection.sendRequest('textDocument/hover', params);
  }

  /**
   * Get diagnostics for a document
   */
  getDiagnostics(uri: string): PublishDiagnosticsParams | undefined {
    return this.diagnostics.get(uri);
  }

  /**
   * Wait for diagnostics to be published for a document
   */
  async waitForDiagnostics(uri: string, timeoutMs = 3000): Promise<PublishDiagnosticsParams> {
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      const diagnostics = this.diagnostics.get(uri);
      if (diagnostics) {
        return diagnostics;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    throw new Error(`Timeout waiting for diagnostics for ${uri}`);
  }

  /**
   * Shutdown and cleanup
   */
  async shutdown(): Promise<void> {
    try {
      if (this.connection && this.initialized) {
        // Send shutdown request
        await this.connection.sendRequest('shutdown', null);
        
        // Send exit notification
        await this.connection.sendNotification('exit', null);
        
        // Close connection
        this.connection.dispose();
      }
    } catch (error) {
      console.warn('Error during LSP shutdown:', error);
    }

    if (this.process) {
      // Give process time to exit gracefully
      const timeout = setTimeout(() => {
        this.process?.kill('SIGKILL');
      }, 1000);

      this.process.on('exit', () => {
        clearTimeout(timeout);
      });

      if (!this.process.killed) {
        this.process.kill();
      }
    }

    this.process = null;
    this.connection = null;
    this.initialized = false;
    this.diagnostics.clear();
  }

  /**
   * Check if client is ready for requests
   */
  get isReady(): boolean {
    return this.connection !== null && this.initialized;
  }

  /**
   * Get server capabilities from initialization
   */
  async getServerCapabilities(): Promise<any> {
    if (!this.isReady) {
      await this.start();
      await this.initialize();
    }
    
    // Re-initialize to get fresh capabilities
    const result = await this.initialize();
    return result.capabilities;
  }
}

/**
 * Helper function to create a simple test client with common defaults
 */
export function createLSPTestClient(options: Partial<LSPTestOptions> = {}): LSPTestClient {
  return new LSPTestClient({
    serverCommand: ['node', 'dist/cli/cli.js', 'lsp', '--stdio'],
    timeout: 5000,
    workspaceRoot: 'file:///test-workspace',
    ...options
  });
}