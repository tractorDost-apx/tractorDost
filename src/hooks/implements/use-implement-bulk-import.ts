'use client';

import { implementAPI } from '@/lib/api/implements';
import type { ImplementImportReport } from '@/types/api/implement-import';
import { type BulkImportConfig, useBulkImport } from '@/hooks/bulk-import/use-bulk-import';

// Rules live in BACKEND implement.import.ts (field registry: implement.import.fields.ts):
//   1. Test   → POST /implements/import/preview  (read-only; returns a previewToken when it passes)
//   2. Insert → POST /implements/import          (only on "Insert Data"; requires that previewToken)
// Unknown columns are saved in additionalSpecs; an optional "Extra Specs" sheet adds spec rows.

export const IMPLEMENT_IMPORT_CONFIG: BulkImportConfig<ImplementImportReport> = {
  api: implementAPI.bulkImport,
  labels: { singular: 'implement', plural: 'implements', matchRule: 'by slug, or by brand and model name' },
  // The server reads .xlsx only (it checks the file signature and cached formula results).
  accept: '.xlsx',
  extensions: ['.xlsx'],
  /** Default of IMPLEMENT_IMPORT_MAX_FILE_MB in the backend. */
  maxFileBytes: 20 * 1024 * 1024,
  extraStats: (report) => {
    const specs = report.summary.extraSpecRows;
    return specs?.total
      ? [
          {
            label: 'Extra spec rows',
            value: specs.total - specs.invalid - specs.skipped,
            tone: 'green',
            hint: `Rows of the Extra Specs sheet saved into additionalSpecs.extraSpecs (${specs.total} in the file)`,
          },
        ]
      : [];
  },
};

export function useImplementBulkImport(options: { onImported?: (report: ImplementImportReport) => void } = {}) {
  return useBulkImport(IMPLEMENT_IMPORT_CONFIG, options);
}
