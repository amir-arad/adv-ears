#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { extname } from 'path';
import { parseAearsFile } from '../parser/file-parser.js';
import { ASTGenerator } from '../ast/ast-generator.js';
import { formatASTForDisplay, printMissingRequirementWarnings } from './format-utils.js';

const program = new Command();

program
  .name('aears')
  .description('EARS (Easy Approach to Requirements Syntax) parser and processor')
  .version('0.1.0');

program
  .command('validate')
  .description('Validate an .aears file')
  .argument('<file>', 'path to .aears file')
  .option('-v, --verbose', 'show detailed output')
  .action(async (file: string, options: { verbose?: boolean }) => {
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
      console.error('Error reading file:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('parse')
  .description('Parse an .aears file and output AST')
  .argument('<file>', 'path to .aears file')
  .option('-o, --output <file>', 'output file (default: stdout)')
  .option('-f, --format <format>', 'output format (json|pretty)', 'pretty')
  .action(async (file: string, options: { output?: string, format: 'json' | 'pretty' }) => {
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
      console.error('Error processing file:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze an .aears file and show detailed metrics')
  .argument('<file>', 'path to .aears file')
  .action(async (file: string) => {
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
      console.log(`  Requirement type coverage: ${totalTypes}/6 (${Math.round(totalTypes/6*100)}%)`);

      printMissingRequirementWarnings(stats);

    } catch (error) {
      console.error('Error analyzing file:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

program.parse();