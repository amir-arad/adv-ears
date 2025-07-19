import { DocumentNode } from '../types/ast-types.js';

export function formatASTForDisplay(ast: DocumentNode): string {
  let output = '📋 EARS AST Structure\n';
  output += '═'.repeat(40) + '\n';

  if (ast.requirements.length === 0) {
    output += 'No requirements found.\n';
    return output;
  }

  for (let i = 0; i < ast.requirements.length; i++) {
    const req = ast.requirements[i];
    output += `\n${i + 1}. ${req.requirementType} Requirement:\n`;
    output += `   Entity: ${req.entity}\n`;
    output += `   Functionality: ${req.functionality}\n`;

    if (req.precondition) {
      output += `   Precondition: ${req.precondition}\n`;
    }
    if (req.state) {
      output += `   State: ${req.state}\n`;
    }
    if (req.condition) {
      output += `   Condition: ${req.condition}\n`;
    }
    if (req.negated) {
      output += `   Negated: ${req.negated}\n`;
    }
  }

  return output;
}

export function printMissingRequirementWarnings(
  stats: Record<string, number>
): void {
  const warningChecks = [
    { key: 'UB', message: 'No ubiquitous requirements found' },
    { key: 'EV', message: 'No event-driven requirements found' },
    { key: 'UW', message: 'No unwanted behavior requirements found' },
    { key: 'ST', message: 'No state-driven requirements found' },
    { key: 'OP', message: 'No optional requirements found' },
    { key: 'HY', message: 'No hybrid requirements found' },
  ];

  warningChecks.forEach(check => {
    if (stats[check.key] === 0) {
      console.log(`  ⚠️  ${check.message}`);
    }
  });
}
