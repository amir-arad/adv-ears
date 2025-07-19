import { Hover, MarkupKind } from 'vscode-languageserver/node.js';

/**
 * Provides hover information for AEARS keywords
 */
export function getKeywordHover(word: string): Hover | undefined {
  switch (word.toLowerCase()) {
    case 'the':
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value:
            '**UB (Ubiquitous)**: Basic functionality requirement\n\n`The [entity] shall [functionality]`',
        },
      };
    case 'when':
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value:
            '**EV (Event-driven)**: Requirement triggered by an event\n\n`When [precondition] the [entity] shall [functionality]`',
        },
      };
    case 'while':
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value:
            '**ST (State-driven)**: Requirement triggered by a state\n\n`While [state] the [entity] shall [functionality]`',
        },
      };
    case 'if':
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value:
            '**OP (Optional)**: Conditional requirement\n\n`If [condition] then the [entity] shall [functionality]`',
        },
      };
    case 'where':
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value:
            '**OP (Optional)**: Conditional requirement\n\n`Where [condition] the [entity] shall [functionality]`',
        },
      };
    case 'shall':
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value:
            '**Required Action**: Indicates a mandatory requirement behavior',
        },
      };
    default:
      return undefined;
  }
}

/**
 * Provides hover information for actors
 */
export function getActorHover(
  word: string,
  actors: string[],
  useCases: Array<{ actor: string; useCase: string }>
): Hover | undefined {
  if (!actors.includes(word)) {
    return undefined;
  }

  const actorUseCases = useCases.filter(uc => uc.actor === word);
  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**Actor**: ${word}\n\n**Use Cases**: ${actorUseCases.length}\n\n${actorUseCases.map(uc => `- ${uc.useCase}`).join('\n')}`,
    },
  };
}

/**
 * Provides hover information for use cases
 */
export function getUseCaseHover(
  word: string,
  useCases: Array<{ actor: string; useCase: string }>
): Hover | undefined {
  const useCase = useCases.find(uc => uc.useCase.includes(word));
  if (!useCase) {
    return undefined;
  }

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**Use Case**: ${useCase.useCase}\n\n**Actor**: ${useCase.actor}`,
    },
  };
}
