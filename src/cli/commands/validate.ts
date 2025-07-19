import { readFileSync } from 'fs';
import { extname } from 'path';
import { parseAearsFile } from '../../parser/file-parser.js';
import { ASTGenerator } from '../../ast/ast-generator.js';

export async function validateCommand(
  file: string,
  options: { verbose?: boolean }
) {
  try {
    if (extname(file) !== '.aears') {
      console.error('Error: File must have .aears extension');
      process.exit(1);
    }

    const content = readFileSync(file, 'utf-8');
    const result = parseAearsFile(content);

    if (result.success) {
      console.log('✓ File validation successful');

      if (options.verbose) {
        const generator = new ASTGenerator();
        const stats = generator.getStatistics(result.ast!);
        const actors = generator.extractActors(result.ast!);

        console.log('\n📊 Statistics:');
        console.log(`  Total requirements: ${result.ast?.requirements.length}`);
        console.log(`  UB (Ubiquitous): ${stats.UB}`);
        console.log(`  EV (Event-driven): ${stats.EV}`);
        console.log(`  UW (Unwanted): ${stats.UW}`);
        console.log(`  ST (State-driven): ${stats.ST}`);
        console.log(`  OP (Optional): ${stats.OP}`);
        console.log(`  HY (Hybrid): ${stats.HY}`);

        console.log('\n🎭 Actors:');
        actors.forEach(actor => console.log(`  • ${actor}`));
      }
    } else {
      console.error('✗ File validation failed');
      console.error('\nErrors:');
      result.errors.forEach(error => console.error(`  ${error}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(
      'Error reading file:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
