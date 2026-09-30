import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function Pagination({
  page,
  limit,
  totalCount,
  totalPages,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="bg-background relative z-10 mt-auto flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] p-4 sm:flex-row">
      <div className="text-muted flex w-full flex-col items-center justify-between gap-3 text-sm font-medium sm:w-auto sm:flex-row sm:justify-start">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-foreground/5 text-foreground cursor-pointer appearance-none rounded-lg border border-transparent px-2 py-1 text-center font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>
        <div className="hidden h-4 w-px bg-[var(--border-subtle)] sm:block"></div>
        <span>
          Showing <span className="text-foreground font-bold">{(page - 1) * limit + 1}</span> to{' '}
          <span className="text-foreground font-bold">{Math.min(page * limit, totalCount)}</span> of{' '}
          <span className="text-foreground font-bold">{totalCount}</span> entries
        </span>
      </div>

      <div className="flex w-full items-center justify-center gap-1.5 sm:w-auto sm:justify-end">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="bg-foreground/5 hover:bg-foreground/10 text-foreground/80 hover:text-foreground flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 sm:px-4 sm:py-2"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {(() => {
          let startPage = Math.max(1, page - 2);
          let endPage = Math.min(totalPages, page + 2);

          if (page <= 3) {
            endPage = Math.min(totalPages, 5);
          }
          if (page >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
          }

          const pages = [];
          for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
          }

          if (totalPages === 0) {
            return (
              <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand-green)] text-xs font-bold text-white shadow-[var(--color-brand-green)]/20 shadow-md sm:h-9 sm:w-9 sm:text-sm">
                1
              </button>
            );
          }

          return (
            <>
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors sm:h-9 sm:w-9 sm:text-sm ${page === 1 ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20 shadow-md' : 'hover:bg-foreground/10 text-foreground/80'}`}
                  >
                    1
                  </button>
                  {startPage > 2 && (
                    <span className="text-muted flex items-end px-1 pb-1">...</span>
                  )}
                </>
              )}

              {pages.map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors sm:h-9 sm:w-9 sm:text-sm ${page === p ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20 shadow-md' : 'hover:bg-foreground/10 text-foreground/80'}`}
                >
                  {p}
                </button>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && (
                    <span className="text-muted flex items-end px-1 pb-1">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors sm:h-9 sm:w-9 sm:text-sm ${page === totalPages ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20 shadow-md' : 'hover:bg-foreground/10 text-foreground/80'}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </>
          );
        })()}

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="bg-foreground/5 hover:bg-foreground/10 text-foreground/80 hover:text-foreground flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 sm:px-4 sm:py-2"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
