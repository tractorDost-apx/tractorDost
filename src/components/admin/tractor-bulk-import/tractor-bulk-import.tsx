'use client';

import React from 'react';
import { TRACTOR_IMPORT_CONFIG } from '@/hooks/tractors/use-tractor-bulk-import';
import type { ImportReport } from '@/types/api/tractor-import';
import BulkImportButton from '@/components/admin/bulk-import/bulk-import-button';

interface TractorBulkImportProps {
  /** Called once the import has been saved, e.g. to refresh the list. */
  onImported?: (report: ImportReport) => void;
  className?: string;
}

/**
 * "Import Tractor" button plus the whole workflow:
 * pick file → test (dry run) → insert → progress → summary.
 */
export default function TractorBulkImport({ onImported, className }: TractorBulkImportProps) {
  return (
    <BulkImportButton
      config={TRACTOR_IMPORT_CONFIG}
      label="Import Tractor"
      onImported={onImported}
      className={className}
    />
  );
}
