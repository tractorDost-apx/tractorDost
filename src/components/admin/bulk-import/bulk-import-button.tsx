'use client';

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { type BulkImportConfig, useBulkImport } from '@/hooks/bulk-import/use-bulk-import';
import type { ImportReport } from '@/types/api/bulk-import';
import BulkImportModal from './bulk-import-modal';

interface BulkImportButtonProps<R extends ImportReport> {
  config: BulkImportConfig<R>;
  /** e.g. "Import Tractor" */
  label: string;
  /** Called once the import has been saved, e.g. to refresh the list. */
  onImported?: (report: R) => void;
  className?: string;
}

/**
 * Import button plus the whole workflow:
 * pick file → test (dry run) → insert → progress → summary.
 */
export default function BulkImportButton<R extends ImportReport>({ config, label, onImported, className }: BulkImportButtonProps<R>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, steps, canImport, selectFile, retest, startImport, reset } = useBulkImport(config, { onImported });
  const busy = state.phase === 'validating' || state.phase === 'importing';

  const chooseFile = () => {
    if (state.phase === 'importing') return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input so choosing the same file again (after fixing it) still fires onChange.
    e.target.value = '';
    if (file) void selectFile(file);
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept={config.accept} onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={chooseFile}
        disabled={busy}
        className={
          className ??
          'spatial-button px-5 py-2.5 text-sm rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
        }
      >
        <Upload size={16} /> {state.phase === 'importing' ? 'Importing…' : label}
      </button>

      {state.phase !== 'idle' && (
        <BulkImportModal
          config={config}
          state={state}
          steps={steps}
          canImport={canImport}
          onInsert={startImport}
          onRetest={retest}
          onChooseFile={chooseFile}
          onClose={reset}
        />
      )}
    </>
  );
}
