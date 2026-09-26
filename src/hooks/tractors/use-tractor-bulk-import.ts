'use client';

import { tractorAPI } from '@/lib/api/tractors';
import type { ImportReport } from '@/types/api/tractor-import';
import { type BulkImportConfig, useBulkImport } from '@/hooks/bulk-import/use-bulk-import';

export {
  formatBytes,
  type BulkImportState,
  type FailureKind,
  type ImportFailure,
  type ImportPhase,
  type StepStatus,
  type ValidationStep,
} from '@/hooks/bulk-import/use-bulk-import';

// Rules live in BACKEND tractor.import.ts:
//   1. Test   → POST /tractor/bulk-import/preview  (read-only; returns a previewToken when it passes)
//   2. Insert → POST /tractor/bulk-import          (only on "Insert Data"; requires that previewToken)

export const IMPORT_ACCEPT = '.xlsx,.xls,.csv';

export const TRACTOR_IMPORT_CONFIG: BulkImportConfig = {
  api: {
    preview: tractorAPI.previewTractorImport,
    commit: tractorAPI.bulkImportTractor,
    progress: tractorAPI.getBulkImportProgress,
  },
  labels: { singular: 'tractor', plural: 'tractors', matchRule: 'by slug or model name' },
  accept: IMPORT_ACCEPT,
  extensions: ['.xlsx', '.xls', '.csv'],
  /** Matches the multer limit in BACKEND shared/libs/multer. */
  maxFileBytes: 50 * 1024 * 1024,
};

export function useTractorBulkImport(options: { onImported?: (report: ImportReport) => void } = {}) {
  return useBulkImport(TRACTOR_IMPORT_CONFIG, options);
}
