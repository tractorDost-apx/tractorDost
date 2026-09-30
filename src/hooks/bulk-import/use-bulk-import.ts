'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import axios from 'axios';
import type { BulkImportApi } from '@/lib/api/bulk-import';
import type {
  BulkImportErrorBody,
  ImportProgress,
  ImportReport,
  SheetIssue,
} from '@/types/api/bulk-import';

// Two explicit steps, both validated on the server (rules live in each BACKEND *.import.ts):
//   1. Test   → POST …/preview  (read-only; returns a previewToken when it passes)
//   2. Insert → POST …          (only on "Insert Data"; requires that previewToken)
// The workflow is the same for every entity; BulkImportConfig supplies the wording, file rules and API.

const POLL_INTERVAL_MS = 800;

export interface BulkImportLabels {
  /** Lower case, e.g. "tractor" */
  singular: string;
  /** Lower case, e.g. "tractors" */
  plural: string;
  /** How an uploaded row is matched to an existing record, e.g. "by slug or model name" */
  matchRule: string;
}

export interface ExtraStat {
  label: string;
  value: number;
  tone?: 'neutral' | 'green' | 'orange' | 'red';
  hint?: string;
}

export interface BulkImportConfig<R extends ImportReport = ImportReport> {
  api: BulkImportApi<R>;
  labels: BulkImportLabels;
  /** <input accept>, e.g. ".xlsx,.xls,.csv" */
  accept: string;
  /** Lower-case extensions the server accepts */
  extensions: string[];
  /** Must match the server's upload limit */
  maxFileBytes: number;
  /** Entity-specific tiles shown next to the summary counts */
  extraStats?: (report: R) => ExtraStat[];
}

export type ImportPhase =
  | 'idle'
  | 'validating' // dry run in flight
  | 'invalid' // file or rows rejected by the dry run
  | 'ready' // dry run passed; waiting for "Insert Data"
  | 'importing'
  | 'completed'
  | 'import-failed'; // real import rejected; nothing was saved (unless outcomeUnknown)

export type FailureKind =
  | 'client'
  | 'file'
  | 'rows'
  | 'busy'
  | 'network'
  | 'server'
  | 'not-tested' // insert refused: the file has no passed test on the server
  | 'contract'; // the server's test response broke the preview contract

export interface ImportFailure {
  kind: FailureKind;
  title: string;
  message: string;
  /** Row-level report from a 422 response. */
  report?: ImportReport;
  /** Per-sheet reasons from a 400 response where no sheet was usable. */
  sheetIssues?: SheetIssue[];
  /** The connection dropped during the real import, so whether it finished is unknown. */
  outcomeUnknown?: boolean;
  /** The same file can be sent again as-is. */
  retryable: boolean;
}

export interface BulkImportState {
  phase: ImportPhase;
  file: File | null;
  uploadPercent: number;
  /** Dry-run report: set when the test passed, or failed with row-level errors. */
  validation: ImportReport | null;
  failure: ImportFailure | null;
  progress: ImportProgress | null;
  result: ImportReport | null;
}

export type StepStatus = 'pending' | 'running' | 'passed' | 'warning' | 'failed' | 'skipped';

export interface ValidationStep {
  id: 'file' | 'read' | 'columns' | 'data' | 'required' | 'duplicates' | 'done';
  label: string;
  status: StepStatus;
  detail?: string;
}

type Action =
  | { type: 'select'; file: File }
  | { type: 'client-invalid'; file: File | null; failure: ImportFailure }
  | { type: 'upload'; percent: number }
  | { type: 'validated'; report: ImportReport }
  | { type: 'validation-failed'; failure: ImportFailure }
  | { type: 'import-start' }
  | { type: 'progress'; progress: ImportProgress }
  | { type: 'imported'; report: ImportReport }
  | { type: 'import-failed'; failure: ImportFailure }
  | { type: 'reset' };

const initialState: BulkImportState = {
  phase: 'idle',
  file: null,
  uploadPercent: 0,
  validation: null,
  failure: null,
  progress: null,
  result: null,
};

function reducer(state: BulkImportState, action: Action): BulkImportState {
  switch (action.type) {
    case 'select':
      return { ...initialState, phase: 'validating', file: action.file };
    case 'client-invalid':
      return { ...initialState, phase: 'invalid', file: action.file, failure: action.failure };
    case 'upload':
      return { ...state, uploadPercent: action.percent };
    case 'validated':
      return { ...state, phase: 'ready', uploadPercent: 100, validation: action.report };
    case 'validation-failed':
      return {
        ...state,
        phase: 'invalid',
        failure: action.failure,
        validation: action.failure.report ?? null,
      };
    case 'import-start':
      return {
        ...state,
        phase: 'importing',
        uploadPercent: 0,
        progress: null,
        failure: null,
        result: null,
      };
    case 'progress':
      // A poll can land after the import response; it must not overwrite the final state.
      return state.phase === 'importing' ? { ...state, progress: action.progress } : state;
    case 'imported':
      return { ...state, phase: 'completed', result: action.report };
    case 'import-failed':
      return { ...state, phase: 'import-failed', failure: action.failure };
    case 'reset':
      return initialState;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** ".xlsx, .xls or .csv" */
const listExtensions = (extensions: string[]) =>
  extensions.length > 1
    ? `${extensions.slice(0, -1).join(', ')} or ${extensions[extensions.length - 1]}`
    : extensions[0];

function checkFile(
  file: File,
  config: Pick<BulkImportConfig, 'extensions' | 'maxFileBytes'>
): string | null {
  const name = file.name.toLowerCase();
  const allowed = listExtensions(config.extensions);
  if (!config.extensions.some((ext) => name.endsWith(ext))) {
    return `"${file.name}" is not a supported file. Choose a ${allowed} file.`;
  }
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > config.maxFileBytes) {
    return `The file is ${formatBytes(file.size)}; the limit is ${formatBytes(config.maxFileBytes)}. Split it into smaller files.`;
  }
  return null;
}

const newImportId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const isReport = (v: unknown): v is ImportReport =>
  typeof v === 'object' && v !== null && 'summary' in v && 'failed' in v;

/** Turns any error from the import endpoint into a message an admin can act on. */
function toFailure(
  error: unknown,
  stage: 'test' | 'import',
  labels: BulkImportLabels
): ImportFailure {
  if (!axios.isAxiosError(error) || !error.response) {
    return stage === 'import'
      ? {
          kind: 'network',
          title: 'Connection lost during import',
          message:
            'The server could not be reached before the import finished, so it may or may not have been saved. ' +
            `Refresh the ${labels.singular} list to check. Sending the file again is safe: matching ${labels.plural} are updated, not duplicated.`,
          outcomeUnknown: true,
          retryable: true,
        }
      : {
          kind: 'network',
          title: 'Server unreachable',
          message: 'Could not reach the server. Check your connection and try again.',
          retryable: true,
        };
  }

  const { status } = error.response;
  const body = (
    typeof error.response.data === 'object' ? error.response.data : null
  ) as BulkImportErrorBody | null;
  const serverMessage = body?.message;

  if (status === 422 && isReport(body?.error)) {
    return {
      kind: 'rows',
      title: stage === 'test' ? 'Test failed' : 'Import rejected — nothing was saved',
      message: serverMessage ?? 'Some rows have errors.',
      report: body.error,
      retryable: false,
    };
  }
  if (status === 400) {
    const sheetIssues =
      body?.error && 'sheetIssues' in body.error ? body.error.sheetIssues : undefined;
    return {
      kind: 'file',
      title: 'File could not be used',
      message: serverMessage ?? 'The file could not be read.',
      sheetIssues,
      retryable: false,
    };
  }
  if (status === 428) {
    return {
      kind: 'not-tested',
      title: 'Test required — nothing was saved',
      message:
        serverMessage ??
        'This file has not passed a test on the server. Re-run the test, then insert.',
      retryable: false,
    };
  }
  if (status === 409) {
    return {
      kind: 'busy',
      title: 'Another import is running',
      message:
        serverMessage ??
        `Another ${labels.singular} import is being saved. Wait for it to finish, then try again.`,
      retryable: true,
    };
  }
  if (status === 413) {
    return {
      kind: 'file',
      title: 'File too large',
      message: 'The server rejected the file because it is too large.',
      retryable: false,
    };
  }
  if (status === 401 || status === 403) {
    return {
      kind: 'server',
      title: 'Not allowed',
      message: `Your session has expired or you do not have permission to import ${labels.plural}. Sign in again and retry.`,
      retryable: false,
    };
  }
  return {
    kind: 'server',
    title: 'Unexpected server error',
    message:
      serverMessage ??
      `The server responded with an error (${status}). Nothing was saved; please retry.`,
    retryable: true,
  };
}

/**
 * A test may only unlock "Insert Data" when the server confirms nothing was saved, every row is valid,
 * and it issued a token for the insert. Anything else is treated as a failed test.
 */
function checkTestReport(report: ImportReport, labels: BulkImportLabels): ImportFailure | null {
  if (report.dryRun !== true || report.committed !== false) {
    return {
      kind: 'contract',
      title: 'Server did not run a read-only test',
      message:
        `The server answered the test as if it had saved data. Do not continue: check the ${labels.singular} list for unexpected ` +
        'changes, and make sure the backend is running the latest code (restart it), then test again.',
      report,
      retryable: false,
    };
  }
  if (report.summary.failed > 0 || report.headerErrors?.length || !report.previewToken) {
    return {
      kind: 'rows',
      title: 'Test failed',
      message: report.headerErrors?.length
        ? `The header row has ${report.headerErrors.length} problem(s), so no rows can be imported. Nothing was saved.`
        : report.summary.failed
          ? `${report.summary.failed} row(s) have errors. Nothing was saved.`
          : 'The server did not confirm the test passed. Nothing was saved; test the file again.',
      report,
      retryable: !report.summary.failed && !report.headerErrors?.length,
    };
  }
  return null;
}

const plural = (n: number, word: string) =>
  `${n.toLocaleString('en-IN')} ${word}${n === 1 ? '' : 's'}`;

/** Maps the dry-run outcome onto the checklist shown while testing. */
function deriveSteps(state: BulkImportState, labels: BulkImportLabels): ValidationStep[] {
  const { phase, file, uploadPercent, failure } = state;
  const report = state.validation;
  const steps: ValidationStep[] = [
    { id: 'file', label: 'File selected', status: 'pending' },
    { id: 'read', label: 'Reading file', status: 'pending' },
    { id: 'columns', label: 'Validating columns', status: 'pending' },
    { id: 'data', label: `Validating ${labels.singular} data`, status: 'pending' },
    { id: 'required', label: 'Checking required fields', status: 'pending' },
    { id: 'duplicates', label: 'Checking duplicate records', status: 'pending' },
    { id: 'done', label: 'Validation completed', status: 'pending' },
  ];
  const set = (id: ValidationStep['id'], status: StepStatus, detail?: string) => {
    const step = steps.find((s) => s.id === id)!;
    step.status = status;
    step.detail = detail;
  };
  const rest = (from: number, status: StepStatus) =>
    steps.slice(from).forEach((s) => (s.status = status));

  if (phase === 'idle') return steps;
  if (failure?.kind === 'client') {
    set('file', 'failed', failure.message);
    rest(1, 'skipped');
    return steps;
  }
  set('file', 'passed', file ? `${file.name} · ${formatBytes(file.size)}` : undefined);

  if (phase === 'validating') {
    if (uploadPercent < 100) {
      set('read', 'running', `Uploading… ${uploadPercent}%`);
    } else {
      set('read', 'running', 'Parsing on the server…');
      rest(2, 'running');
      set('done', 'pending');
    }
    return steps;
  }

  // No report: the server stopped before (or instead of) validating rows.
  if (!report) {
    if (failure?.sheetIssues?.length) {
      set('read', 'passed', 'File opened');
      set(
        'columns',
        'failed',
        `No usable sheet: ${failure.sheetIssues.map((s) => `"${s.sheet}" — ${s.message}`).join(' ')}`
      );
      rest(3, 'skipped');
    } else {
      set('read', 'failed', failure?.message);
      rest(2, 'skipped');
    }
    set('done', 'failed', failure?.title);
    return steps;
  }

  const { summary } = report;
  set(
    'read',
    'passed',
    `${plural(summary.totalRows, 'data row')} in ${plural(summary.sheetsProcessed, 'sheet')}`
  );

  // Header problems: rows were not checked, because their columns can't be trusted.
  const headerErrors = report.headerErrors ?? [];
  if (headerErrors.length) {
    set(
      'columns',
      'failed',
      `${plural(headerErrors.length, 'column problem')} in the header row — see "Column problems" below`
    );
    rest(3, 'skipped');
    set('done', 'failed', 'Fix the header row, then choose the file again');
    return steps;
  }

  const extraColumns = report.extraColumns ?? [];
  const columnNotes = [
    report.sheetIssues.length && `${plural(report.sheetIssues.length, 'sheet')} skipped`,
    report.ignoredColumns.length &&
      `${plural(report.ignoredColumns.length, 'column')} not recognised (will be ignored)`,
  ].filter(Boolean);
  const columnInfo = extraColumns.length
    ? `${plural(extraColumns.length, 'extra column')} will be saved as additional specs`
    : '';
  set(
    'columns',
    columnNotes.length ? 'warning' : 'passed',
    [...columnNotes, columnInfo].filter(Boolean).join(' · ') || 'All columns recognised'
  );

  const dataErrorRows = report.failed.filter((r) => r.errors.some((e) => !e.required)).length;
  const corrections = report.warnings.reduce((n, w) => n + w.count, 0);
  if (dataErrorRows) set('data', 'failed', `${plural(dataErrorRows, 'row')} with invalid values`);
  else if (corrections)
    set('data', 'warning', `${plural(corrections, 'value')} will be auto-corrected`);
  else set('data', 'passed', `${plural(summary.validRows, 'row')} valid`);

  const missingRows = report.failed.filter((r) => r.errors.some((e) => e.required)).length;
  set(
    'required',
    missingRows ? 'failed' : 'passed',
    missingRows
      ? `${plural(missingRows, 'row')} missing required values`
      : 'All required values present'
  );

  const dupNotes = [
    summary.skipped && `${plural(summary.skipped, 'duplicate row')} will be skipped`,
    summary.updated &&
      `${plural(summary.updated, 'row')} match existing ${labels.plural} and will update them`,
  ].filter(Boolean);
  set(
    'duplicates',
    dupNotes.length ? 'warning' : 'passed',
    dupNotes.length ? dupNotes.join(' · ') : 'No duplicates found'
  );

  // The verdict comes from the phase, so this step can never say "passed" while the test failed.
  if (phase === 'ready') set('done', 'passed', 'Ready to insert — nothing has been saved');
  else if (summary.failed)
    set('done', 'failed', `${plural(summary.failed, 'row')} must be fixed before importing`);
  else set('done', 'failed', failure?.title ?? 'Test did not pass');
  return steps;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBulkImport<R extends ImportReport>(
  config: BulkImportConfig<R>,
  { onImported }: { onImported?: (report: R) => void } = {}
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Every file selection starts a new run; responses from an older run are dropped.
  const runRef = useRef(0);
  const testAbortRef = useRef<AbortController | null>(null);
  // Synchronous guard so a double click cannot send the import twice before React re-renders.
  const importingRef = useRef(false);
  const onImportedRef = useRef(onImported);
  useEffect(() => {
    onImportedRef.current = onImported;
  }, [onImported]);
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const runTest = useCallback(async (file: File, runId: number) => {
    testAbortRef.current?.abort();
    const controller = new AbortController();
    testAbortRef.current = controller;
    const { api, labels } = configRef.current;
    try {
      // The test only ever calls the read-only preview endpoint.
      const res = await api.preview(file, {
        signal: controller.signal,
        onUploadProgress: (percent) =>
          runRef.current === runId && dispatch({ type: 'upload', percent }),
      });
      if (runRef.current !== runId) return;
      const problem = checkTestReport(res.data, labels);
      dispatch(
        problem
          ? { type: 'validation-failed', failure: problem }
          : { type: 'validated', report: res.data }
      );
    } catch (error) {
      if (axios.isCancel(error) || runRef.current !== runId) return;
      dispatch({ type: 'validation-failed', failure: toFailure(error, 'test', labels) });
    }
  }, []);

  const selectFile = useCallback(
    async (picked: File) => {
      if (importingRef.current) return;
      const runId = ++runRef.current;
      const problem = checkFile(picked, configRef.current);
      if (problem) {
        testAbortRef.current?.abort();
        dispatch({
          type: 'client-invalid',
          file: picked,
          failure: {
            kind: 'client',
            title: 'File not accepted',
            message: problem,
            retryable: false,
          },
        });
        return;
      }
      // Snapshot the bytes so the insert sends exactly what was tested, even if the file changes on disk.
      let snapshot: File;
      try {
        snapshot = new File([await picked.arrayBuffer()], picked.name, {
          type: picked.type,
          lastModified: picked.lastModified,
        });
      } catch {
        if (runRef.current !== runId) return;
        dispatch({
          type: 'client-invalid',
          file: picked,
          failure: {
            kind: 'client',
            title: 'File not readable',
            message:
              'The browser could not read this file. Close it in other programs and select it again.',
            retryable: false,
          },
        });
        return;
      }
      if (runRef.current !== runId) return;
      dispatch({ type: 'select', file: snapshot });
      void runTest(snapshot, runId);
    },
    [runTest]
  );

  /** Re-runs the dry run on the current file (e.g. after "server unreachable", or when an import was rejected). */
  const retest = useCallback(() => {
    if (!state.file || importingRef.current) return;
    const runId = ++runRef.current;
    dispatch({ type: 'select', file: state.file });
    void runTest(state.file, runId);
  }, [state.file, runTest]);

  // Insert needs a passed test of this file: the server refuses the request without its previewToken.
  const previewToken = state.validation?.previewToken;
  const canImport =
    !!state.file &&
    !!previewToken &&
    (state.phase === 'ready' || (state.phase === 'import-failed' && !!state.failure?.retryable));

  const startImport = useCallback(async () => {
    if (!canImport || !state.file || !previewToken || importingRef.current) return;
    importingRef.current = true;
    const runId = runRef.current;
    const importId = newImportId();
    const { api, labels } = configRef.current;
    dispatch({ type: 'import-start' });

    // Poll progress until the import request settles. 404 means the server has not started yet.
    const poll = new AbortController();
    let timer: number | undefined;
    const tick = async () => {
      try {
        const res = await api.progress(importId, poll.signal);
        if (!poll.signal.aborted) dispatch({ type: 'progress', progress: res.data });
      } catch {
        // Progress is best-effort; the import response is the source of truth.
      }
      if (!poll.signal.aborted) timer = window.setTimeout(tick, POLL_INTERVAL_MS);
    };
    timer = window.setTimeout(tick, POLL_INTERVAL_MS);

    try {
      // Deliberately not abortable: cancelling the request would not stop the server from saving.
      const res = await api.commit(state.file, {
        previewToken,
        importId,
        onUploadProgress: (percent) => dispatch({ type: 'upload', percent }),
      });
      if (runRef.current !== runId) return;
      dispatch({ type: 'imported', report: res.data });
      onImportedRef.current?.(res.data);
    } catch (error) {
      if (runRef.current === runId)
        dispatch({ type: 'import-failed', failure: toFailure(error, 'import', labels) });
    } finally {
      poll.abort();
      window.clearTimeout(timer);
      importingRef.current = false;
    }
  }, [canImport, state.file, previewToken]);

  const reset = useCallback(() => {
    if (importingRef.current) return;
    runRef.current++;
    testAbortRef.current?.abort();
    dispatch({ type: 'reset' });
  }, []);

  // Warn before a reload or tab close would hide the outcome of a running import.
  useEffect(() => {
    if (state.phase !== 'importing') return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [state.phase]);

  useEffect(() => () => testAbortRef.current?.abort(), []);

  const steps = useMemo(() => deriveSteps(state, config.labels), [state, config.labels]);

  return { state, steps, canImport, selectFile, retest, startImport, reset };
}
