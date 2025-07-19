#!/usr/bin/env node

import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';
import { parseCommand } from './commands/parse.js';
import { generateCommand } from './commands/generate.js';
import { analyzeCommand } from './commands/analyze.js';
import { lspCommand } from './commands/lsp.js';

const program = new Command();

program
  .name('aears')
  .description(
    'EARS (Easy Approach to Requirements Syntax) parser and processor'
  )
  .version('0.1.0');

program
  .command('validate')
  .description('Validate an .aears file')
  .argument('<file>', 'path to .aears file')
  .option('-v, --verbose', 'show detailed output')
  .action(validateCommand);

program
  .command('parse')
  .description('Parse an .aears file and output AST')
  .argument('<file>', 'path to .aears file')
  .option('-o, --output <file>', 'output file (default: stdout)')
  .option('-f, --format <format>', 'output format (json|pretty)', 'pretty')
  .action(parseCommand);

program
  .command('generate')
  .description('Generate UML diagrams from an .aears file')
  .argument('<file>', 'path to .aears file')
  .option('-o, --output <file>', 'output file (default: stdout)')
  .option(
    '-f, --format <format>',
    'output format (plantuml|report)',
    'plantuml'
  )
  .option('--title', 'include title in UML diagram', false)
  .option('--stats', 'include statistics in UML diagram', false)
  .option('--no-relationships', 'exclude relationships in UML diagram')
  .action(generateCommand);

program
  .command('lsp')
  .description('Start the Language Server Protocol server')
  .option('--stdio', 'Use stdio for communication')
  .option('--socket <port>', 'Use socket for communication')
  .option('--node-ipc', 'Use Node IPC for communication')
  .action(lspCommand);

program
  .command('analyze')
  .description('Analyze an .aears file and show detailed metrics')
  .argument('<file>', 'path to .aears file')
  .action(analyzeCommand);

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

program.parse();
