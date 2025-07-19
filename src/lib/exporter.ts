import { ExtractionResult } from '../types/library-types.js';

import { ExporterFormats } from './exporter-formats.js';

export class LibraryExporter {
  private formats: ExporterFormats;

  constructor() {
    this.formats = new ExporterFormats();
  }

  exportToJSON(result: ExtractionResult, pretty = true): string {
    return this.formats.formatAsJSON(result, pretty);
  }

  exportToStructured(result: ExtractionResult): string {
    return this.formats.formatAsStructured(result);
  }

  exportToMarkdown(result: ExtractionResult): string {
    return this.formats.formatAsMarkdown(result);
  }

  exportToCSV(result: ExtractionResult): string {
    const headers = [
      'ID',
      'Pattern',
      'Category',
      'Priority',
      'Confidence',
      'Trigger',
      'Response',
    ];

    const rows = result.requirements.map(req => [
      req.id,
      req.pattern,
      req.category,
      req.priority,
      (req.confidence * 100).toFixed(0) + '%',
      req.trigger || '',
      `"${req.response.replace(/"/g, '""')}"`, // Escape quotes
    ]);

    const csvLines = [headers.join(','), ...rows.map(row => row.join(','))];
    return csvLines.join('\n');
  }

  exportToXML(result: ExtractionResult): string {
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<requirements-analysis>');

    // Metadata
    lines.push('  <metadata>');
    lines.push(
      `    <total-requirements>${result.metrics.totalRequirements}</total-requirements>`
    );
    lines.push(
      `    <valid-requirements>${result.metrics.validRequirements}</valid-requirements>`
    );
    lines.push(
      `    <quality-score>${result.metrics.qualityScore.toFixed(3)}</quality-score>`
    );
    lines.push(
      `    <overall-coverage>${result.coverage.overallCoverage.toFixed(1)}</overall-coverage>`
    );
    lines.push('  </metadata>');

    // Requirements
    lines.push('  <requirements>');
    for (const req of result.requirements) {
      lines.push('    <requirement>');
      lines.push(`      <id>${this.escapeXml(req.id)}</id>`);
      lines.push(`      <pattern>${this.escapeXml(req.pattern)}</pattern>`);
      lines.push(`      <category>${this.escapeXml(req.category)}</category>`);
      lines.push(`      <priority>${this.escapeXml(req.priority)}</priority>`);
      lines.push(`      <confidence>${req.confidence.toFixed(3)}</confidence>`);
      if (req.trigger) {
        lines.push(`      <trigger>${this.escapeXml(req.trigger)}</trigger>`);
      }
      lines.push(`      <response>${this.escapeXml(req.response)}</response>`);
      lines.push('    </requirement>');
    }
    lines.push('  </requirements>');

    // Groups
    lines.push('  <groups>');
    for (const group of result.groups) {
      lines.push('    <group>');
      lines.push(`      <name>${this.escapeXml(group.name)}</name>`);
      lines.push(`      <theme>${this.escapeXml(group.theme)}</theme>`);
      lines.push('      <member-requirements>');
      for (const reqId of group.requirements) {
        lines.push(
          `        <requirement-id>${this.escapeXml(reqId)}</requirement-id>`
        );
      }
      lines.push('      </member-requirements>');
      lines.push('    </group>');
    }
    lines.push('  </groups>');

    lines.push('</requirements-analysis>');
    return lines.join('\n');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
