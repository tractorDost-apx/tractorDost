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
  onLimitChange
}: PaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="mt-auto p-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-background z-10 relative">
      <div className="flex flex-col sm:flex-row items-center gap-3 text-sm font-medium text-muted w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select 
            value={limit} 
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-foreground/5 border border-transparent rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20 text-foreground font-bold cursor-pointer appearance-none text-center"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-[var(--border-subtle)]"></div>
        <span>
          Showing <span className="font-bold text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-bold text-foreground">{Math.min(page * limit, totalCount)}</span> of <span className="font-bold text-foreground">{totalCount}</span> entries
        </span>
      </div>
      
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        <button 
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors text-foreground/80 hover:text-foreground"
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
              <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-bold rounded-xl bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/20">
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
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-bold rounded-xl transition-colors ${page === 1 ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/20' : 'hover:bg-foreground/10 text-foreground/80'}`}
                  >
                    1
                  </button>
                  {startPage > 2 && <span className="text-muted px-1 flex items-end pb-1">...</span>}
                </>
              )}

              {pages.map(p => (
                <button 
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-bold rounded-xl transition-colors ${page === p ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/20' : 'hover:bg-foreground/10 text-foreground/80'}`}
                >
                  {p}
                </button>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span className="text-muted px-1 flex items-end pb-1">...</span>}
                  <button 
                    onClick={() => onPageChange(totalPages)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-bold rounded-xl transition-colors ${page === totalPages ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/20' : 'hover:bg-foreground/10 text-foreground/80'}`}
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
          className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors text-foreground/80 hover:text-foreground"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
