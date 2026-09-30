// Mirrors the report returned by POST /implements/import/preview and POST /implements/import
// (BACKEND implement.import.ts): the shared bulk-import contract plus implement-specific details.
import type { ImportReport, ImportSummary } from './bulk-import';

export interface ImplementImportColumn {
  sheet: string;
  cell: string;
  header: string;
  /** Implement field, "additionalSpecs.<key>", "additionalSpecs.extraSpecs[].<part>", or "(not imported)" */
  mappedTo: string;
  type: 'field' | 'reference' | 'dynamic' | 'json' | 'extraSpec' | 'protected';
}

export interface ImplementImportReport extends ImportReport {
  summary: ImportSummary & {
    /** Data rows of implement sheets (totalRows also counts Extra Specs rows). */
    implementRows: number;
    extraSpecRows: { total: number; valid: number; invalid: number; skipped: number };
  };
  sheets: {
    name: string;
    kind: 'implements' | 'extraSpecs' | 'ignored';
    headerRow?: number;
    dataRows: number;
    note?: string;
  }[];
  columns: ImplementImportColumn[];
}
