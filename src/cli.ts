import { makeCliProgram } from './cli/index.js';

const program = makeCliProgram();

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

program.parse();
