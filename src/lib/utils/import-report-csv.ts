import type { ImportReport, SheetIssue } from '@/types/api/bulk-import';

const HEADER = ['Type', 'Sheet', 'Row', 'Sr No', 'Model', 'Cell', 'Column', 'Value', 'Message', 'Expected'];

/** Quotes a CSV cell and neutralises spreadsheet formulas, since values come from an uploaded file. */
function csvCell(v: unknown): string {
  let s = v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Every problem in an import report, one line per cell error, skipped row, warning or ignored column. */
export function buildImportIssuesCsv(report: ImportReport | null, extraSheetIssues: SheetIssue[] = []): string {
  const lines: unknown[][] = [];
  for (const e of report?.headerErrors ?? []) {
    lines.push(['Column error', e.sheet, '', '', '', e.cell, e.column, e.value, e.message, e.expected]);
  }
  for (const r of report?.failed ?? []) {
    for (const e of r.errors) {
      lines.push([e.required ? 'Missing required value' : 'Error', r.sheet, r.row, r.srNo, r.modelName, e.cell, e.column, e.value, e.message, e.expected]);
    }
  }
  for (const r of report?.skipped ?? []) {
    lines.push(['Duplicate (skipped)', r.sheet, r.row, r.srNo, r.modelName, '', '', '', r.reason]);
  }
  for (const w of report?.warnings ?? []) {
    lines.push(['Auto-corrected', w.sheet, '', '', '', w.cells.join('; '), w.column, '', `${w.message} (${w.count})`]);
  }
  for (const c of report?.extraColumns ?? []) {
    lines.push(['Saved as additional spec', c.sheet, '', '', '', c.cell, c.column, '', `Saved in ${c.savedAs}`]);
  }
  for (const c of report?.ignoredColumns ?? []) {
    lines.push(['Ignored column', c.sheet, '', '', '', c.cell, c.column, '', c.reason]);
  }
  for (const s of [...(report?.sheetIssues ?? []), ...extraSheetIssues]) {
    lines.push(['Sheet skipped', s.sheet, '', '', '', '', '', '', s.message]);
  }
  return [HEADER, ...lines].map((line) => line.map(csvCell).join(',')).join('\r\n');
}

export function downloadCsv(csv: string, fileName: string) {
  // BOM so Excel opens the file as UTF-8 (₹, ✓ and Hindi text survive).
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
