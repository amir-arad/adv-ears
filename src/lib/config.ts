import {
  ConfigurationError,
  LibraryConfiguration,
  SUPPORTED_DOMAINS,
} from '../types/library-types.js';

import { LibraryValidator } from './validator.js';
import { ConfigValidators } from './config-validators.js';

export class ConfigurationManager {
  private config: LibraryConfiguration;
  private validator: LibraryValidator;
  private configValidators: ConfigValidators;

  constructor() {
    this.validator = new LibraryValidator();
    this.configValidators = new ConfigValidators();
    this.config = this.getDefaultConfiguration();
  }

  setConfiguration(newConfig: Partial<LibraryConfiguration>): void {
    // Validate the new configuration using comprehensive validation
    const validatedSettings: Partial<LibraryConfiguration> = {};
    const settings = newConfig as Record<string, unknown>;

    this.configValidators.validateDefaultDomains(settings, validatedSettings);
    this.configValidators.validateMaxCacheSize(settings, validatedSettings);
    this.configValidators.validateEnableStreaming(settings, validatedSettings);
    this.configValidators.validateQualityThreshold(settings, validatedSettings);
    this.configValidators.validateOutputFormat(settings, validatedSettings);

    // Merge with existing configuration using validated settings
    this.config = {
      ...this.config,
      ...validatedSettings,
    };
  }

  getConfiguration(): LibraryConfiguration {
    // Return a copy to prevent external modification
    return {
      ...this.config,
    };
  }

  resetConfiguration(): void {
    this.config = this.getDefaultConfiguration();
  }

  updateGlobalSettings(settings: Record<string, unknown>): void {
    const validatedSettings: Partial<LibraryConfiguration> = {};

    this.configValidators.validateDefaultDomains(settings, validatedSettings);
    this.configValidators.validateMaxCacheSize(settings, validatedSettings);
    this.configValidators.validateEnableStreaming(settings, validatedSettings);
    this.configValidators.validateQualityThreshold(settings, validatedSettings);
    this.configValidators.validateOutputFormat(settings, validatedSettings);

    this.setConfiguration(validatedSettings);
  }

  getConfigurationValue<K extends keyof LibraryConfiguration>(
    key: K
  ): LibraryConfiguration[K] {
    return this.config[key];
  }

  setConfigurationValue<K extends keyof LibraryConfiguration>(
    key: K,
    value: LibraryConfiguration[K]
  ): void {
    const partialConfig = { [key]: value } as Partial<LibraryConfiguration>;
    this.setConfiguration(partialConfig);
  }

  exportConfiguration(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfiguration(configJson: string): void {
    try {
      const imported = JSON.parse(configJson);
      this.setConfiguration(imported);
    } catch (error) {
      throw new ConfigurationError('Invalid JSON configuration', [
        'configuration',
      ]);
    }
  }

  validateCurrentConfiguration(): void {
    this.validator.validateConfiguration(
      this.config as unknown as Record<string, unknown>
    );
  }

  private getDefaultConfiguration(): LibraryConfiguration {
    return {
      defaultDomains: [...SUPPORTED_DOMAINS].slice(0, 4), // First 4 domains as default
      maxCacheSize: 100,
      enableStreaming: true,
      qualityThreshold: 0.6,
      outputFormat: 'json',
    };
  }

  // Utility methods for common configuration scenarios
  enableAllDomains(): void {
    this.setConfiguration({
      defaultDomains: [...SUPPORTED_DOMAINS],
    });
  }

  disableCache(): void {
    this.setConfiguration({
      maxCacheSize: 0,
    });
  }

  setHighQualityMode(): void {
    this.setConfiguration({
      qualityThreshold: 0.8,
      maxCacheSize: 50, // Smaller cache for high quality mode
    });
  }

  setPerformanceMode(): void {
    this.setConfiguration({
      enableStreaming: true,
      maxCacheSize: 200,
      qualityThreshold: 0.4, // Lower threshold for faster processing
    });
  }

  getConfigurationSummary(): {
    domains: number;
    caching: string;
    streaming: boolean;
    quality: string;
    format: string;
  } {
    return {
      domains: this.config.defaultDomains.length,
      caching:
        this.config.maxCacheSize > 0
          ? `Enabled (${this.config.maxCacheSize} items)`
          : 'Disabled',
      streaming: this.config.enableStreaming,
      quality: `${(this.config.qualityThreshold * 100).toFixed(0)}% threshold`,
      format: this.config.outputFormat,
    };
  }
}
