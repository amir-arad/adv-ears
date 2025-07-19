import {
  ConfigurationError,
  LibraryConfiguration,
  SUPPORTED_DOMAINS,
} from '../types/library-types.js';

export class ConfigValidators {
  validateDefaultDomains(
    settings: Record<string, unknown>,
    validatedSettings: Partial<LibraryConfiguration>
  ): void {
    if (settings.defaultDomains === undefined) {
      return;
    }

    if (!Array.isArray(settings.defaultDomains)) {
      throw new ConfigurationError('defaultDomains must be an array', [
        'defaultDomains',
      ]);
    }

    const invalidDomains = settings.defaultDomains.filter(
      d => !SUPPORTED_DOMAINS.includes(d as (typeof SUPPORTED_DOMAINS)[number])
    );

    if (invalidDomains.length > 0) {
      throw new ConfigurationError(
        `Invalid domains: ${invalidDomains.join(', ')}. Supported domains: ${SUPPORTED_DOMAINS.join(', ')}`,
        ['defaultDomains']
      );
    }

    validatedSettings.defaultDomains = settings.defaultDomains as string[];
  }

  validateMaxCacheSize(
    settings: Record<string, unknown>,
    validatedSettings: Partial<LibraryConfiguration>
  ): void {
    if (settings.maxCacheSize === undefined) {
      return;
    }

    if (
      typeof settings.maxCacheSize !== 'number' ||
      settings.maxCacheSize < 0
    ) {
      throw new ConfigurationError(
        'maxCacheSize must be a non-negative number',
        ['maxCacheSize']
      );
    }
    validatedSettings.maxCacheSize = settings.maxCacheSize;
  }

  validateEnableStreaming(
    settings: Record<string, unknown>,
    validatedSettings: Partial<LibraryConfiguration>
  ): void {
    if (settings.enableStreaming === undefined) {
      return;
    }

    if (typeof settings.enableStreaming !== 'boolean') {
      throw new ConfigurationError('enableStreaming must be a boolean', [
        'enableStreaming',
      ]);
    }
    validatedSettings.enableStreaming = settings.enableStreaming;
  }

  validateQualityThreshold(
    settings: Record<string, unknown>,
    validatedSettings: Partial<LibraryConfiguration>
  ): void {
    if (settings.qualityThreshold === undefined) {
      return;
    }

    if (
      typeof settings.qualityThreshold !== 'number' ||
      settings.qualityThreshold < 0 ||
      settings.qualityThreshold > 1
    ) {
      throw new ConfigurationError(
        'qualityThreshold must be a number between 0 and 1',
        ['qualityThreshold']
      );
    }
    validatedSettings.qualityThreshold = settings.qualityThreshold;
  }

  validateOutputFormat(
    settings: Record<string, unknown>,
    validatedSettings: Partial<LibraryConfiguration>
  ): void {
    if (settings.outputFormat === undefined) {
      return;
    }

    const validFormats = ['json', 'structured', 'markdown'];
    if (!validFormats.includes(settings.outputFormat as string)) {
      throw new ConfigurationError(
        `outputFormat must be one of: ${validFormats.join(', ')}`,
        ['outputFormat']
      );
    }
    validatedSettings.outputFormat = settings.outputFormat as
      | 'json'
      | 'structured'
      | 'markdown';
  }
}
