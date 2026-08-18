import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { AmortizationScheduleEntry, YearlySummaryEntry } from './emi-calculator.types';
import { formatIndianCurrency } from './emi-calculator.utils';

interface EmiAmortizationTableProps {
  schedule: AmortizationScheduleEntry[];
  yearlySummary: YearlySummaryEntry[];
}

export const EmiAmortizationTable: React.FC<EmiAmortizationTableProps> = ({
  schedule,
  yearlySummary,
}) => {
  const [activeTab, setActiveTab] = useState<'yearly' | 'monthly'>('yearly');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  
  // Pagination state for monthly table
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12; // 1 year per page

  const totalPages = Math.ceil(schedule.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = schedule.slice(indexOfFirstRow, indexOfLastRow);

  const toggleYear = (year: number) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-[var(--card-bg)] border border-[var(--card-border)] p-6 md:p-8 rounded-3xl shadow-[var(--card-shadow)] relative backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--border-subtle)] gap-4">
        <h2 className="text-xl md:text-2xl font-black uppercase text-foreground tracking-tight">
          Repayment Schedule
        </h2>

        {/* Tab Toggle */}
        <div className="flex bg-foreground/5 p-1 rounded-2xl border border-[var(--border-subtle)] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('yearly')}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === 'yearly'
                ? 'bg-background text-[var(--color-brand-green)] shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Yearly Summary
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === 'monthly'
                ? 'bg-background text-[var(--color-brand-green)] shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Monthly Schedule
          </button>
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-12 text-muted font-bold text-sm uppercase">
          Enter valid inputs above to see schedule.
        </div>
      ) : activeTab === 'yearly' ? (
        /* YEARLY BREAKDOWN (ACCORDION CARDS) */
        <div className="flex flex-col gap-3">
          {yearlySummary.map((yearEntry) => {
            const isExpanded = expandedYear === yearEntry.year;
            // Get the 12 months corresponding to this year
            const startMonthIndex = (yearEntry.year - 1) * 12;
            const yearMonths = schedule.slice(startMonthIndex, startMonthIndex + 12);
            const startingBalance = yearMonths[0]?.startingBalance || 0;

            return (
              <div
                key={yearEntry.year}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5'
                    : 'border-[var(--border-subtle)] bg-foreground/5 hover:border-[var(--border-brand-alt)]/30'
                }`}
              >
                {/* Year Header Accordion Button */}
                <button
                  onClick={() => toggleYear(yearEntry.year)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-xl text-[var(--color-brand-green)] shadow-sm">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-foreground text-sm uppercase">
                        Year {yearEntry.year}
                      </h4>
                      <p className="text-[10px] font-bold text-muted mt-0.5">
                        Start: {formatIndianCurrency(startingBalance, 'short')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Key summaries visible on desktop */}
                    <div className="hidden md:flex gap-6 text-xs font-black uppercase">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted font-bold tracking-wider">EMI Paid</span>
                        <span className="text-foreground">{formatIndianCurrency(yearEntry.emiPaid, 'short')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted font-bold tracking-wider">Interest Paid</span>
                        <span className="text-[var(--color-brand-orange)]">{formatIndianCurrency(yearEntry.interestPaid, 'short')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted font-bold tracking-wider">Outstanding</span>
                        <span className="text-foreground">{formatIndianCurrency(yearEntry.endingBalance, 'short')}</span>
                      </div>
                    </div>

                    {isExpanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[var(--border-subtle)] bg-background/50 p-4 animate-fade-in">
                    {/* Summary for mobile */}
                    <div className="grid grid-cols-3 gap-2 mb-4 md:hidden border-b border-[var(--border-subtle)] pb-4 text-center font-bold text-[10px] uppercase">
                      <div className="flex flex-col p-2 bg-foreground/5 rounded-xl">
                        <span className="text-muted tracking-wider mb-1">Total EMI</span>
                        <span className="text-foreground text-xs font-black">{formatIndianCurrency(yearEntry.emiPaid, 'short')}</span>
                      </div>
                      <div className="flex flex-col p-2 bg-foreground/5 rounded-xl">
                        <span className="text-muted tracking-wider mb-1">Total Interest</span>
                        <span className="text-[var(--color-brand-orange)] text-xs font-black">{formatIndianCurrency(yearEntry.interestPaid, 'short')}</span>
                      </div>
                      <div className="flex flex-col p-2 bg-foreground/5 rounded-xl">
                        <span className="text-muted tracking-wider mb-1">Outstanding</span>
                        <span className="text-foreground text-xs font-black">{formatIndianCurrency(yearEntry.endingBalance, 'short')}</span>
                      </div>
                    </div>

                    {/* Table of Months within Year */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-subtle)] text-[10px] font-black text-muted uppercase tracking-wider">
                            <th className="py-2.5 px-2">Month</th>
                            <th className="py-2.5 px-2 text-right">Start Balance</th>
                            <th className="py-2.5 px-2 text-right">EMI Paid</th>
                            <th className="py-2.5 px-2 text-right">Principal</th>
                            <th className="py-2.5 px-2 text-right text-[var(--color-brand-orange)]">Interest</th>
                            <th className="py-2.5 px-2 text-right">Ending Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5 font-semibold text-foreground/80">
                          {yearMonths.map((m) => (
                            <tr key={m.month} className="hover:bg-foreground/5 transition-colors">
                              <td className="py-2 px-2 font-black text-foreground">Month {m.month}</td>
                              <td className="py-2 px-2 text-right">{formatIndianCurrency(m.startingBalance)}</td>
                              <td className="py-2 px-2 text-right font-bold text-foreground">{formatIndianCurrency(m.emi)}</td>
                              <td className="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400">+{formatIndianCurrency(m.principalPaid)}</td>
                              <td className="py-2 px-2 text-right text-[var(--color-brand-orange)]">-{formatIndianCurrency(m.interestPaid)}</td>
                              <td className="py-2 px-2 text-right font-bold text-foreground">{formatIndianCurrency(m.endingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* MONTH-WISE PAGINATED TABLE */
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-foreground/5">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-black text-muted uppercase tracking-wider bg-background/50">
                  <th className="py-4 px-4">Month</th>
                  <th className="py-4 px-4 text-right">Starting Balance</th>
                  <th className="py-4 px-4 text-right">Monthly EMI</th>
                  <th className="py-4 px-4 text-right">Principal Paid</th>
                  <th className="py-4 px-4 text-right text-[var(--color-brand-orange)]">Interest Paid</th>
                  <th className="py-4 px-4 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5 text-sm font-semibold text-foreground/85">
                {currentRows.map((row) => (
                  <tr key={row.month} className="hover:bg-foreground/5 transition-colors">
                    <td className="py-3 px-4 font-black text-foreground">Month {row.month}</td>
                    <td className="py-3 px-4 text-right">{formatIndianCurrency(row.startingBalance)}</td>
                    <td className="py-3 px-4 text-right font-black text-foreground">{formatIndianCurrency(row.emi)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">+{formatIndianCurrency(row.principalPaid)}</td>
                    <td className="py-3 px-4 text-right text-[var(--color-brand-orange)]">-{formatIndianCurrency(row.interestPaid)}</td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">{formatIndianCurrency(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
              <span className="text-xs text-muted font-bold">
                Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, schedule.length)} of {schedule.length} Months
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold text-foreground disabled:opacity-40 disabled:hover:bg-foreground/5 transition-all uppercase tracking-wider"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                          : 'bg-foreground/5 hover:bg-foreground/10 text-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold text-foreground disabled:opacity-40 disabled:hover:bg-foreground/5 transition-all uppercase tracking-wider"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
