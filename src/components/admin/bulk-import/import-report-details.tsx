'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Columns3, Copy, Download, EyeOff, FileWarning, ListPlus, Wand2 } from 'lucide-react';
import type { ImportCellError, ImportReport, SheetIssue } from '@/types/api/bulk-import';
import { buildImportIssuesCsv, downloadCsv } from '@/lib/utils/import-report-csv';

/** Longer lists are cut here; the CSV download always has everything. */
const MAX_LISTED = 50;

type Tone = 'neutral' | 'green' | 'orange' | 'red';

const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-foreground',
  green: 'text-[var(--color-brand-green)]',
  orange: 'text-[var(--color-brand-orange)]',
  red: 'text-red-500',
};

export function StatTile({ label, value, tone = 'neutral', hint }: { label: string; value: number | string; tone?: Tone; hint?: string }) {
  return (
    <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col gap-1" title={hint}>
      <span className="text-[10px] font-black uppercase text-muted tracking-wider">{label}</span>
      <span className={`text-xl font-black tabular-nums ${TONE_TEXT[tone]}`}>
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </span>
    </div>
  );
}

export function Banner({ tone, title, children }: { tone: 'green' | 'orange' | 'red'; title: string; children?: React.ReactNode }) {
  const styles = {
    green: 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]',
    orange: 'bg-[var(--color-brand-orange)]/10 border-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)]',
    red: 'bg-red-500/10 border-red-500/20 text-red-500',
  }[tone];
  const Icon = tone === 'green' ? CheckCircle2 : tone === 'orange' ? AlertTriangle : AlertCircle;
  return (
    <div role={tone === 'red' ? 'alert' : 'status'} className={`p-4 rounded-xl border flex items-start gap-3 ${styles}`}>
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-black">{title}</p>
        {children && <div className="text-xs font-medium text-foreground/80 break-words">{children}</div>}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  count,
  tone,
  defaultOpen,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  tone: Tone;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] overflow-hidden">
      <summary className="cursor-pointer select-none list-none px-4 py-3 flex items-center gap-2 hover:bg-foreground/5 transition-colors">
        <Icon size={16} className={TONE_TEXT[tone]} />
        <span className="text-sm font-black text-foreground flex-1">{title}</span>
        <span className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-md bg-foreground/5 ${TONE_TEXT[tone]}`}>{count.toLocaleString('en-IN')}</span>
        <span className="text-muted text-xs transition-transform group-open:rotate-90">▶</span>
      </summary>
      <div className="px-4 pb-4 pt-1 flex flex-col gap-2 max-h-72 overflow-y-auto">{children}</div>
    </details>
  );
}

const rowLabel = (r: { sheet: string; row: number; srNo?: string; modelName?: string }, multiSheet: boolean) =>
  [multiSheet ? `${r.sheet} · ` : '', `Row ${r.row}`, r.srNo ? ` (Sr ${r.srNo})` : '', r.modelName ? ` — ${r.modelName}` : ''].join('');

const More = ({ total }: { total: number }) =>
  total > MAX_LISTED ? (
    <p className="text-xs font-bold text-muted pt-1">…and {(total - MAX_LISTED).toLocaleString('en-IN')} more. Download the issue report for the full list.</p>
  ) : null;

const shownValue = (v: unknown) => (typeof v === 'string' ? `"${v}"` : typeof v === 'object' ? JSON.stringify(v) : String(v));

/** One problem: the cell, the column, what is wrong, what the cell holds and what it should hold. */
function CellProblem({ error, tone = 'red' }: { error: Pick<ImportCellError, 'column' | 'message' | 'value' | 'expected' | 'required'> & { cell?: string }; tone?: Tone }) {
  const hasValue = error.value !== undefined && error.value !== null && error.value !== '';
  return (
    <li className="text-xs text-foreground/80 flex gap-2">
      <span className={`font-mono font-bold shrink-0 ${TONE_TEXT[tone]}`}>{error.cell ?? '—'}</span>
      <span className="min-w-0">
        <span className="font-bold">{error.column}:</span> {error.message}
        {error.required && <span className="ml-1.5 text-[10px] font-black uppercase text-red-500">Required</span>}
        {(hasValue || error.expected) && (
          <span className="block text-[11px] text-muted break-words">
            {hasValue && (
              <>
                Value: <span className="font-mono text-foreground/70">{shownValue(error.value)}</span>
              </>
            )}
            {hasValue && error.expected && ' · '}
            {error.expected && <>Expected: {error.expected}</>}
          </span>
        )}
      </span>
    </li>
  );
}

/** Collapsible lists of everything the uploader should look at, plus a CSV download. */
export function ReportIssues({
  report,
  sheetIssues = [],
  fileName,
}: {
  report: ImportReport | null;
  sheetIssues?: SheetIssue[];
  fileName: string;
}) {
  const failed = report?.failed ?? [];
  const skipped = report?.skipped ?? [];
  const warnings = report?.warnings ?? [];
  const ignored = report?.ignoredColumns ?? [];
  const headerErrors = report?.headerErrors ?? [];
  const extraColumns = report?.extraColumns ?? [];
  const sheets = [...(report?.sheetIssues ?? []), ...sheetIssues];
  const corrections = warnings.reduce((n, w) => n + w.count, 0);
  const multiSheet = new Set([...failed, ...skipped].map((r) => r.sheet)).size > 1;
  const hasIssues =
    failed.length + skipped.length + warnings.length + ignored.length + sheets.length + headerErrors.length + extraColumns.length > 0;

  if (!hasIssues) return null;

  const download = () => {
    const base = fileName.replace(/\.[^.]+$/, '');
    downloadCsv(buildImportIssuesCsv(report, sheetIssues), `${base}-import-issues.csv`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted">Details</h3>
        <button
          type="button"
          onClick={download}
          className="text-xs font-bold text-foreground/70 hover:text-[var(--color-brand-green)] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-[var(--color-brand-green)]/10 transition-colors"
        >
          <Download size={14} /> Download issue report (CSV)
        </button>
      </div>

      {report?.truncated && (
        <p className="text-xs font-bold text-[var(--color-brand-orange)]">
          This file has too many issues to list them all here. The counts are exact; fix the listed ones and test again.
        </p>
      )}

      {headerErrors.length > 0 && (
        <Section icon={Columns3} title="Column problems" count={headerErrors.length} tone="red" defaultOpen>
          <ul className="flex flex-col gap-1.5">
            {headerErrors.slice(0, MAX_LISTED).map((e, i) => (
              <CellProblem key={i} error={{ ...e, column: `${e.sheet} · ${e.column}` }} />
            ))}
          </ul>
          <More total={headerErrors.length} />
        </Section>
      )}

      {failed.length > 0 && (
        <Section icon={AlertCircle} title="Rows with errors" count={failed.length} tone="red" defaultOpen>
          {failed.slice(0, MAX_LISTED).map((r) => (
            <div key={`${r.sheet}-${r.row}`} className="bg-background border border-red-500/15 rounded-lg p-3">
              <p className="text-xs font-black text-foreground mb-1.5">{rowLabel(r, multiSheet)}</p>
              <ul className="flex flex-col gap-1.5">
                {r.errors.map((e, i) => (
                  <CellProblem key={i} error={e} />
                ))}
              </ul>
            </div>
          ))}
          <More total={failed.length} />
        </Section>
      )}

      {sheets.length > 0 && (
        <Section icon={FileWarning} title="Sheets skipped" count={sheets.length} tone="orange" defaultOpen={!report}>
          {sheets.map((s, i) => (
            <p key={i} className="text-xs text-foreground/80">
              <span className="font-bold">{s.sheet}:</span> {s.message}
            </p>
          ))}
        </Section>
      )}

      {skipped.length > 0 && (
        <Section icon={Copy} title="Duplicate rows (skipped)" count={skipped.length} tone="orange">
          {skipped.slice(0, MAX_LISTED).map((r) => (
            <p key={`${r.sheet}-${r.row}`} className="text-xs text-foreground/80">
              <span className="font-bold">{rowLabel(r, multiSheet)}:</span> {r.reason}
            </p>
          ))}
          <More total={skipped.length} />
        </Section>
      )}

      {warnings.length > 0 && (
        <Section icon={Wand2} title="Automatic corrections" count={corrections} tone="orange">
          {warnings.slice(0, MAX_LISTED).map((w, i) => (
            <div key={i} className="text-xs text-foreground/80">
              <p>
                <span className="font-bold">{w.column}:</span> {w.message} <span className="text-muted">({w.count})</span>
              </p>
              <p className="font-mono text-[11px] text-muted truncate" title={w.cells.join(', ')}>
                {w.cells.slice(0, 8).join(', ')}
                {w.cells.length > 8 ? ` +${w.cells.length - 8} more` : ''}
              </p>
            </div>
          ))}
          <More total={warnings.length} />
        </Section>
      )}

      {extraColumns.length > 0 && (
        <Section icon={ListPlus} title="Extra columns saved as additional specs" count={extraColumns.length} tone="neutral">
          <p className="text-[11px] text-muted">
            These columns are not standard fields. Their values are kept as additional specifications, under the key shown.
          </p>
          {extraColumns.slice(0, MAX_LISTED).map((c, i) => (
            <p key={i} className="text-xs text-foreground/80">
              <span className="font-mono font-bold">{c.cell}</span> <span className="font-bold">{c.column}</span> →{' '}
              <span className="font-mono text-muted">{c.savedAs}</span>
            </p>
          ))}
          <More total={extraColumns.length} />
        </Section>
      )}

      {ignored.length > 0 && (
        <Section icon={EyeOff} title="Columns ignored" count={ignored.length} tone="neutral">
          {ignored.slice(0, MAX_LISTED).map((c, i) => (
            <p key={i} className="text-xs text-foreground/80">
              <span className="font-mono font-bold">{c.cell}</span> <span className="font-bold">{c.column}:</span> {c.reason}
            </p>
          ))}
          <More total={ignored.length} />
        </Section>
      )}
    </div>
  );
}
