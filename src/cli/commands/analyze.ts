import { readFileSync } from 'fs';
import { extname } from 'path';
import { parseAearsFile } from '../../parser/file-parser.js';
import { ASTGenerator } from '../../ast/ast-generator.js';
import { printMissingRequirementWarnings } from '../format-utils.js';

export async function analyzeCommand(file: string) {
  try {
    if (extname(file) !== '.aears') {
      console.error('Error: File must have .aears extension');
      process.exit(1);
    }

    const content = readFileSync(file, 'utf-8');
    const result = parseAearsFile(content);

    if (!result.success) {
      console.error('✗ Analysis failed');
      console.error('\nErrors:');
      result.errors.forEach(error => console.error(`  ${error}`));
      process.exit(1);
    }

    const generator = new ASTGenerator();
    const stats = generator.getStatistics(result.ast!);
    const actors = generator.extractActors(result.ast!);
    const useCases = generator.extractUseCases(result.ast!);

    console.log('📋 EARS File Analysis Report');
    console.log('═'.repeat(40));

    console.log('\n📊 Requirement Statistics:');
    console.log(`  Total requirements: ${result.ast?.requirements.length}`);
    console.log(`  UB (Ubiquitous): ${stats.UB}`);
    console.log(`  EV (Event-driven): ${stats.EV}`);
    console.log(`  UW (Unwanted): ${stats.UW}`);
    console.log(`  ST (State-driven): ${stats.ST}`);
    console.log(`  OP (Optional): ${stats.OP}`);
    console.log(`  HY (Hybrid): ${stats.HY}`);

    console.log('\n🎭 System Actors:');
    actors.forEach(actor => console.log(`  • ${actor}`));

    console.log('\n🎯 Use Cases:');
    useCases.forEach(uc => console.log(`  • ${uc.actor} → ${uc.useCase}`));

    console.log('\n📈 Coverage Analysis:');
    const totalTypes = Object.values(stats).filter(count => count > 0).length;
    console.log(
      `  Requirement type coverage: ${totalTypes}/6 (${Math.round((totalTypes / 6) * 100)}%)`
    );

    printMissingRequirementWarnings(stats);
  } catch (error) {
    console.error(
      'Error analyzing file:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
