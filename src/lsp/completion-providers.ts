import {
  CompletionItem,
  CompletionItemKind,
} from 'vscode-languageserver/node.js';

/**
 * Provides completion items for AEARS keywords
 */
export function getCompletionItems(): CompletionItem[] {
  return [
    {
      label: 'The',
      kind: CompletionItemKind.Keyword,
      data: 1,
      detail: 'UB (Ubiquitous) - Basic functionality requirement',
      documentation: 'The [entity] shall [functionality]',
    },
    {
      label: 'When',
      kind: CompletionItemKind.Keyword,
      data: 2,
      detail: 'EV (Event-driven) - Triggered by event',
      documentation: 'When [precondition] the [entity] shall [functionality]',
    },
    {
      label: 'While',
      kind: CompletionItemKind.Keyword,
      data: 3,
      detail: 'ST (State-driven) - Triggered by state',
      documentation: 'While [state] the [entity] shall [functionality]',
    },
    {
      label: 'If',
      kind: CompletionItemKind.Keyword,
      data: 4,
      detail: 'OP (Optional) - Conditional requirement',
      documentation: 'If [condition] then the [entity] shall [functionality]',
    },
    {
      label: 'Where',
      kind: CompletionItemKind.Keyword,
      data: 5,
      detail: 'OP (Optional) - Conditional requirement',
      documentation: 'Where [condition] the [entity] shall [functionality]',
    },
    {
      label: 'shall',
      kind: CompletionItemKind.Keyword,
      data: 6,
      detail: 'Required action keyword',
      documentation: 'Indicates a mandatory requirement',
    },
    {
      label: 'shall not',
      kind: CompletionItemKind.Keyword,
      data: 7,
      detail: 'UW (Unwanted) - Prohibited behavior',
      documentation: 'The [entity] shall not [functionality]',
    },
  ];
}

/**
 * Resolves additional information for completion items
 */
export function resolveCompletionItem(item: CompletionItem): CompletionItem {
  switch (item.data) {
    case 1:
      item.documentation =
        'UB (Ubiquitous): Basic functionality requirement\nExample: "The system shall authenticate users"';
      break;
    case 2:
      item.documentation =
        'EV (Event-driven): Requirement triggered by an event\nExample: "When login attempted the system shall validate credentials"';
      break;
    case 3:
      item.documentation =
        'ST (State-driven): Requirement triggered by a state\nExample: "While session active the system shall maintain state"';
      break;
    case 4:
      item.documentation =
        'OP (Optional): Conditional requirement with IF\nExample: "If user authenticated then the system shall grant access"';
      break;
    case 5:
      item.documentation =
        'OP (Optional): Conditional requirement with WHERE\nExample: "Where security enabled the system shall log activities"';
      break;
    case 6:
      item.documentation =
        'Required action keyword used in all AEARS requirements';
      break;
    case 7:
      item.documentation =
        'UW (Unwanted): Prohibited behavior\nExample: "The system shall not allow unauthorized access"';
      break;
  }
  return item;
}
