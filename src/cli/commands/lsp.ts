export async function lspCommand(options: {
  stdio?: boolean;
  socket?: string;
  nodeIpc?: boolean;
}) {
  try {
    // Set command line arguments for the LSP server
    if (options.stdio) {
      process.argv.push('--stdio');
    } else if (options.socket) {
      process.argv.push(`--socket=${options.socket}`);
    } else if (options.nodeIpc) {
      process.argv.push('--node-ipc');
    }
    // Import and start the LSP server
    await import('../../lsp/server.js');
  } catch (error) {
    console.error(
      'Error starting LSP server:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
