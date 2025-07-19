import { readFileSync, writeFileSync } from 'fs';
import { extname } from 'path';
import { parseAearsFile } from '../../parser/file-parser.js';
import { formatASTForDisplay } from '../format-utils.js';

export async function parseCommand(
  file: string,
  options: { output?: string; format: 'json' | 'pretty' }
) {
  try {
    if (extname(file) !== '.aears') {
      console.error('Error: File must have .aears extension');
      process.exit(1);
    }

    const content = readFileSync(file, 'utf-8');
    const result = parseAearsFile(content);

    if (!result.success) {
      console.error('✗ Parsing failed');
      console.error('\nErrors:');
      result.errors.forEach(error => console.error(`  ${error}`));
      process.exit(1);
    }

    let output: string;
    if (options.format === 'json') {
      output = JSON.stringify(result.ast, null, 2);
    } else {
      output = formatASTForDisplay(result.ast!);
    }

    if (options.output) {
      writeFileSync(options.output, output);
      console.log(`✓ AST written to ${options.output}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error(
      'Error processing file:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
