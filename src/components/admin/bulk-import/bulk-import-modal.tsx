'use client';

import React, { useEffect, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Database,
  FileSpreadsheet,
  FolderOpen,
  MinusCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import type { ImportReport } from '@/types/api/bulk-import';
import {
  type BulkImportConfig,
  type BulkImportState,
  type StepStatus,
  type ValidationStep,
  capitalize,
  formatBytes,
} from '@/hooks/bulk-import/use-bulk-import';
import { Banner, ReportIssues, StatTile } from './import-report-details';

interface BulkImportModalProps<R extends ImportReport> {
  config: BulkImportConfig<R>;
  state: BulkImportState;
  steps: ValidationStep[];
  canImport: boolean;
  onInsert: () => void;
  onRetest: () => void;
  onChooseFile: () => void;
  onClose: () => void;
}

const STEP_ICON: Record<StepStatus, React.ReactNode> = {
  pending: <Circle size={18} className="text-foreground/20" />,
  running: <TractorLoader size={18} className="text-[var(--color-brand-green)]" />,
  passed: <CheckCircle2 size={18} className="text-[var(--color-brand-green)]" />,
  warning: <AlertTriangle size={18} className="text-[var(--color-brand-orange)]" />,
  failed: <AlertCircle size={18} className="text-red-500" />,
  skipped: <MinusCircle size={18} className="text-foreground/20" />,
};

function StepList({ steps }: { steps: ValidationStep[] }) {
  return (
    <ol className="flex flex-col gap-1" aria-label="Validation steps">
      {steps.map((s) => (
        <li
          key={s.id}
          className={`flex items-start gap-3 rounded-xl px-3 py-2 transition-colors ${s.status === 'running' ? 'bg-[var(--color-brand-green)]/5' : ''}`}
        >
          <span className="mt-0.5 flex w-[18px] shrink-0 justify-center">
            {STEP_ICON[s.status]}
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm font-bold ${s.status === 'pending' || s.status === 'skipped' ? 'text-muted' : 'text-foreground'}`}
            >
              {s.label}
            </p>
            {s.detail && (
              <p
                className={`text-xs font-medium break-words ${
                  s.status === 'failed'
                    ? 'text-red-500'
                    : s.status === 'warning'
                      ? 'text-[var(--color-brand-orange)]'
                      : 'text-muted'
                }`}
              >
                {s.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ProgressBar({ percent, label }: { percent: number | null; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent ?? undefined}
      className="bg-foreground/10 h-3 w-full overflow-hidden rounded-full"
    >
      {percent === null ? (
        <div className="h-full w-full animate-pulse bg-[var(--color-brand-green)]/40" />
      ) : (
        <div
          className="h-full bg-[var(--color-brand-green)] transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      )}
    </div>
  );
}

/** Entity-specific tiles (e.g. extra spec rows for implements). */
function ExtraStats<R extends ImportReport>({
  config,
  report,
}: {
  config: BulkImportConfig<R>;
  report: ImportReport;
}) {
  const stats = config.extraStats?.(report as R) ?? [];
  return (
    <>
      {stats.map((s) => (
        <StatTile key={s.label} label={s.label} value={s.value} tone={s.tone} hint={s.hint} />
      ))}
    </>
  );
}

/** Test phase: checklist, then the dry-run verdict. */
function TestView<R extends ImportReport>({
  config,
  state,
  steps,
}: {
  config: BulkImportConfig<R>;
  state: BulkImportState;
  steps: ValidationStep[];
}) {
  const { phase, validation, failure, file } = state;
  const { labels } = config;
  const s = validation?.summary;
  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel rounded-2xl p-3">
        <StepList steps={steps} />
      </div>

      {phase === 'validating' && (
        <p className="text-muted text-center text-xs font-bold">
          Testing the file against the live catalogue. Nothing is saved during the test.
        </p>
      )}

      {phase === 'ready' && s && validation && (
        <>
          <Banner tone="green" title="Test passed — nothing has been saved yet">
            Review the summary below, then click <span className="font-black">Insert Data</span> to
            save. The import is all-or-nothing: if any row fails while saving, no changes are kept.
          </Banner>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Rows in file" value={s.totalRows} />
            <StatTile label="Will create" value={s.created} tone="green" />
            <StatTile
              label="Will update"
              value={s.updated}
              tone={s.updated ? 'orange' : 'neutral'}
              hint={`Rows matching an existing ${labels.singular} ${labels.matchRule}`}
            />
            <StatTile
              label="Duplicates skipped"
              value={s.skipped}
              tone={s.skipped ? 'orange' : 'neutral'}
            />
            <ExtraStats config={config} report={validation} />
          </div>
        </>
      )}

      {phase === 'invalid' && failure && (
        <Banner tone="red" title={failure.title}>
          {failure.message}
          {failure.kind === 'rows' && (
            <span className="mt-1 block">
              Fix the cells below in your file, then choose it again.
            </span>
          )}
        </Banner>
      )}

      {(phase === 'ready' || phase === 'invalid') && file && (
        <ReportIssues report={validation} sheetIssues={failure?.sheetIssues} fileName={file.name} />
      )}
    </div>
  );
}

/** Insert phase: live counts from the progress endpoint. */
function ImportingView({ state }: { state: BulkImportState }) {
  const { progress, validation, uploadPercent } = state;
  const toSave = progress?.toSave || validation?.summary.validRows || 0;
  const saved = progress?.phase === 'saving' ? progress.saved : 0;
  const saving = progress?.phase === 'saving';
  const committing = saving && saved >= toSave;

  const stage =
    uploadPercent < 100 && !progress
      ? `Uploading file… ${uploadPercent}%`
      : !saving
        ? 'Re-checking rows against the database…'
        : committing
          ? 'All rows written — committing changes…'
          : `Saving row ${(saved + 1).toLocaleString('en-IN')} of ${toSave.toLocaleString('en-IN')}`;
  const current = saving && !committing ? progress?.current : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel flex flex-col gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <TractorLoader size={28} className="text-[var(--color-brand-green)]" />
          <div className="min-w-0" aria-live="polite">
            <p className="text-foreground text-sm font-black">{stage}</p>
            <p className="text-muted truncate text-xs font-medium">
              {current
                ? `Currently processing: ${current.sheet} · Row ${current.row}${current.modelName ? ` — ${current.modelName}` : ''}`
                : 'Keep this window open until the import finishes.'}
            </p>
          </div>
          <span className="ml-auto text-lg font-black text-[var(--color-brand-green)] tabular-nums">
            {saving && toSave ? `${Math.floor((saved / toSave) * 100)}%` : ''}
          </span>
        </div>
        <ProgressBar
          percent={saving && toSave ? Math.floor((saved / toSave) * 100) : null}
          label="Import progress"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Total records"
          value={toSave}
          hint="Valid rows being saved (duplicates excluded)"
        />
        <StatTile label="Processed" value={saved} tone="green" />
        <StatTile label="Remaining" value={Math.max(0, toSave - saved)} />
        <StatTile label="Failed" value={0} hint="Any failure rolls back the whole import" />
      </div>

      <p className="text-muted text-center text-xs font-bold">
        Rows are saved in a single transaction and become visible together once every row is
        written.
      </p>
    </div>
  );
}

function CompletedView<R extends ImportReport>({
  config,
  state,
}: {
  config: BulkImportConfig<R>;
  state: BulkImportState;
}) {
  const r = state.result!;
  const s = r.summary;
  return (
    <div className="flex flex-col gap-6">
      <Banner tone="green" title="Import completed">
        {(s.created + s.updated).toLocaleString('en-IN')} {config.labels.singular}(s) saved from{' '}
        <span className="font-black">{r.file}</span>.
      </Banner>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="Processed" value={s.totalRows} />
        <StatTile label="Inserted" value={s.created} tone="green" />
        <StatTile label="Updated" value={s.updated} tone={s.updated ? 'orange' : 'neutral'} />
        <StatTile
          label="Skipped / duplicate"
          value={s.skipped}
          tone={s.skipped ? 'orange' : 'neutral'}
        />
        <StatTile label="Failed" value={s.failed} tone={s.failed ? 'red' : 'neutral'} />
        <ExtraStats config={config} report={r} />
      </div>
      <ReportIssues report={r} fileName={r.file} />
    </div>
  );
}

function ImportFailedView({ state }: { state: BulkImportState }) {
  const { failure, file } = state;
  if (!failure) return null;
  return (
    <div className="flex flex-col gap-6">
      <Banner tone={failure.outcomeUnknown ? 'orange' : 'red'} title={failure.title}>
        {failure.message}
        {failure.kind === 'rows' && (
          <span className="mt-1 block">
            The data changed since the test. Fix the rows below, or re-run the test to see the
            current result.
          </span>
        )}
      </Banner>
      {file && (
        <ReportIssues
          report={failure.report ?? null}
          sheetIssues={failure.sheetIssues}
          fileName={file.name}
        />
      )}
    </div>
  );
}

const btnSecondary =
  'px-5 py-2.5 rounded-xl font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors disabled:opacity-50 flex items-center gap-2';
const btnPrimary =
  'px-7 py-2.5 rounded-xl font-black text-white bg-[var(--color-brand-green)] hover:shadow-[0_10px_20px_rgba(29,191,115,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2';

export default function BulkImportModal<R extends ImportReport>({
  config,
  state,
  steps,
  canImport,
  onInsert,
  onRetest,
  onChooseFile,
  onClose,
}: BulkImportModalProps<R>) {
  const { phase, file, failure } = state;
  const locked = phase === 'importing';
  const dialogRef = useRef<HTMLDivElement>(null);
  const Plural = capitalize(config.labels.plural);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, onClose]);

  const title =
    phase === 'importing'
      ? `Inserting ${Plural}`
      : phase === 'completed'
        ? 'Import Completed'
        : `Bulk Import ${Plural}`;

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-import-title"
        tabIndex={-1}
        className="animate-fade-in border-foreground/10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl focus:outline-none"
        style={{ background: 'var(--background)' }}
      >
        {/* Header */}
        <div className="border-foreground/10 bg-background flex shrink-0 items-center justify-between gap-4 border-b px-6 py-5">
          <div className="min-w-0">
            <h2
              id="bulk-import-title"
              className="text-foreground text-2xl font-black tracking-tight"
            >
              {title}
            </h2>
            {file && (
              <p className="text-muted mt-1 flex items-center gap-1.5 truncate text-xs font-bold">
                <FileSpreadsheet size={14} className="shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0">· {formatBytes(file.size)}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            title={locked ? 'The import is running; wait for it to finish' : 'Close'}
            aria-label="Close"
            className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {(phase === 'validating' || phase === 'invalid' || phase === 'ready') && (
            <TestView config={config} state={state} steps={steps} />
          )}
          {phase === 'importing' && <ImportingView state={state} />}
          {phase === 'completed' && <CompletedView config={config} state={state} />}
          {phase === 'import-failed' && <ImportFailedView state={state} />}
        </div>

        {/* Footer */}
        <div className="border-foreground/10 bg-background flex shrink-0 flex-wrap justify-end gap-3 border-t px-6 py-4">
          {phase === 'completed' ? (
            <>
              <button type="button" onClick={onChooseFile} className={btnSecondary}>
                <FolderOpen size={16} /> Import another file
              </button>
              <button type="button" onClick={onClose} className={btnPrimary}>
                <CheckCircle2 size={18} /> Done
              </button>
            </>
          ) : (
            <>
              {!locked && (
                <button type="button" onClick={onClose} className={btnSecondary}>
                  Cancel
                </button>
              )}
              {(phase === 'invalid' || phase === 'import-failed') && (
                <button type="button" onClick={onChooseFile} className={btnSecondary}>
                  <FolderOpen size={16} /> Choose another file
                </button>
              )}
              {((phase === 'invalid' && (failure?.retryable || failure?.kind === 'contract')) ||
                (phase === 'import-failed' &&
                  (failure?.kind === 'rows' || failure?.kind === 'not-tested'))) && (
                <button type="button" onClick={onRetest} className={btnSecondary}>
                  <RotateCcw size={16} /> Re-run test
                </button>
              )}
              {(phase === 'validating' ||
                phase === 'ready' ||
                locked ||
                (phase === 'import-failed' && failure?.retryable)) && (
                <button
                  type="button"
                  onClick={onInsert}
                  disabled={!canImport}
                  className={btnPrimary}
                >
                  {locked ? (
                    <>
                      <TractorLoader size={16} className="text-white" /> Inserting…
                    </>
                  ) : phase === 'import-failed' ? (
                    <>
                      <RotateCcw size={18} /> Retry insert
                    </>
                  ) : phase === 'validating' ? (
                    <>
                      <TractorLoader size={16} className="text-white" /> Testing…
                    </>
                  ) : (
                    <>
                      <Database size={18} /> Insert Data
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
