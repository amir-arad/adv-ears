import { readFileSync, writeFileSync } from 'fs';
import { extname } from 'path';
import { parseAearsFile } from '../../parser/file-parser.js';
import { UMLGenerator } from '../../generators/uml-generator.js';

export async function generateCommand(
  file: string,
  options: {
    output?: string;
    format: 'plantuml' | 'report';
    title: boolean;
    stats: boolean;
    relationships: boolean;
  }
) {
  try {
    if (extname(file) !== '.aears') {
      console.error('Error: File must have .aears extension');
      process.exit(1);
    }

    const content = readFileSync(file, 'utf-8');
    const result = parseAearsFile(content);

    if (!result.success) {
      console.error('✗ Generation failed');
      console.error('\nErrors:');
      result.errors.forEach(error => console.error(`  ${error}`));
      process.exit(1);
    }

    const generator = new UMLGenerator();
    let output: string;

    if (options.format === 'plantuml') {
      output = generator.generatePlantUML(result.ast!, {
        includeTitle: options.title,
        includeStatistics: options.stats,
        includeRelationships: options.relationships,
      });
    } else {
      output = generator.generateReport(result.ast!);
    }

    if (options.output) {
      writeFileSync(options.output, output);
      console.log(
        `✓ ${options.format === 'plantuml' ? 'PlantUML' : 'Report'} written to ${options.output}`
      );
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error(
      'Error generating output:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
