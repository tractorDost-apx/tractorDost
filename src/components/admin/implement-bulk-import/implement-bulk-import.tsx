'use client';

import React from 'react';
import { IMPLEMENT_IMPORT_CONFIG } from '@/hooks/implements/use-implement-bulk-import';
import type { ImplementImportReport } from '@/types/api/implement-import';
import BulkImportButton from '@/components/admin/bulk-import/bulk-import-button';

interface ImplementBulkImportProps {
  /** Called once the import has been saved, e.g. to refresh the list. */
  onImported?: (report: ImplementImportReport) => void;
  className?: string;
}

/**
 * "Import Implement" button plus the whole workflow, same as the tractor import:
 * pick .xlsx → test (read-only preview) → Insert Data → progress → summary.
 */
export default function ImplementBulkImport({ onImported, className }: ImplementBulkImportProps) {
  return (
    <BulkImportButton
      config={IMPLEMENT_IMPORT_CONFIG}
      label="Import Implement"
      onImported={onImported}
      className={className}
    />
  );
}
