// Report contract shared by the Excel bulk imports (tractors, implements). Each backend import module
// returns this shape from POST …/preview and the insert endpoint; entity reports may add fields.

export interface ImportRowRef {
  sheet: string;
  /** Excel row number, as shown in the spreadsheet. */
  row: number;
  srNo?: string;
  modelName?: string;
}

export interface ImportCellError {
  /** Cell reference ("F27"), or "Row 27" for problems that concern the whole row. */
  cell: string;
  column: string;
  value?: unknown;
  message: string;
  /** What the cell should contain, e.g. "a number, e.g. 45 or 50.5". */
  expected?: string;
  /** Database field the column maps to. */
  field?: string;
  /** Set when a required value is missing. */
  required?: boolean;
}

export interface ImportedRow extends ImportRowRef {
  status: 'created' | 'updated';
  /** Absent in a dry run for records that would be created. */
  tractorId?: number;
  implementId?: number;
  slug: string;
}

export interface SkippedRow extends ImportRowRef {
  reason: string;
}

export interface FailedRow extends ImportRowRef {
  errors: ImportCellError[];
}

export interface ImportWarning {
  sheet: string;
  column: string;
  message: string;
  count: number;
  cells: string[];
}

export interface IgnoredColumn {
  sheet: string;
  cell: string;
  column: string;
  reason: string;
}

export interface SheetIssue {
  sheet: string;
  message: string;
}

/** Problem in a header row (ambiguous or duplicated column, missing required column). Blocks the whole file. */
export interface HeaderError {
  sheet: string;
  cell?: string;
  column: string;
  value?: unknown;
  field?: string;
  expected?: string;
  message: string;
}

/** Column that is not a known field; its values are saved in a flexible JSON field (e.g. additionalSpecs). */
export interface ExtraColumn {
  sheet: string;
  cell: string;
  column: string;
  savedAs: string;
}

export interface ImportSummary {
  sheetsProcessed: number;
  totalRows: number;
  /** Rows that passed validation and are (or in a dry run, would be) created or updated. */
  validRows: number;
  created: number;
  updated: number;
  /** Duplicate rows within the file; only the first occurrence is imported. */
  skipped: number;
  failed: number;
}

export interface ImportReport {
  file: string;
  /** True for a test (preview): nothing was saved. */
  dryRun: boolean;
  /** Test only, when every row is valid: required by the insert request for this file. */
  previewToken?: string;
  /** True only when the rows were saved. The import is all-or-nothing. */
  committed: boolean;
  summary: ImportSummary;
  imported: ImportedRow[];
  skipped: SkippedRow[];
  failed: FailedRow[];
  warnings: ImportWarning[];
  ignoredColumns: IgnoredColumn[];
  sheetIssues: SheetIssue[];
  headerErrors?: HeaderError[];
  extraColumns?: ExtraColumn[];
  /** Lists were capped for a very large file; the summary counts are exact. */
  truncated?: boolean;
}

/** GET …/progress/:importId */
export interface ImportProgress {
  phase: 'validating' | 'saving';
  totalRows: number;
  /** Rows that will be written; 0 until validation finishes. */
  toSave: number;
  /** Rows written so far (uncommitted until every row is written). */
  saved: number;
  current?: ImportRowRef;
}

export interface BulkImportResponse<R extends ImportReport = ImportReport> {
  success: true;
  message: string;
  data: R;
}

/** Error body: 422 carries a report, 400 may carry sheet issues, 409/428/500 carry only a message. */
export interface BulkImportErrorBody {
  success: false;
  message: string;
  error?: ImportReport | { sheetIssues: SheetIssue[] };
}
