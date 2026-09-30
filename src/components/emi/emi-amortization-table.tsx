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
    <div className="relative flex w-full flex-col gap-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--card-shadow)] backdrop-blur-md md:p-8">
      <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-foreground text-xl font-black tracking-tight uppercase md:text-2xl">
          Repayment Schedule
        </h2>

        {/* Tab Toggle */}
        <div className="bg-foreground/5 flex self-start rounded-2xl border border-[var(--border-subtle)] p-1 sm:self-auto">
          <button
            onClick={() => setActiveTab('yearly')}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold uppercase transition-all ${
              activeTab === 'yearly'
                ? 'bg-background text-[var(--color-brand-green)] shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Yearly Summary
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold uppercase transition-all ${
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
        <div className="text-muted py-12 text-center text-sm font-bold uppercase">
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
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isExpanded
                    ? 'border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5'
                    : 'bg-foreground/5 border-[var(--border-subtle)] hover:border-[var(--border-brand-alt)]/30'
                }`}
              >
                {/* Year Header Accordion Button */}
                <button
                  onClick={() => toggleYear(yearEntry.year)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors md:p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-background rounded-xl p-2 text-[var(--color-brand-green)] shadow-sm">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="text-foreground text-sm font-black uppercase">
                        Year {yearEntry.year}
                      </h4>
                      <p className="text-muted mt-0.5 text-[10px] font-bold">
                        Start: {formatIndianCurrency(startingBalance, 'short')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Key summaries visible on desktop */}
                    <div className="hidden gap-6 text-xs font-black uppercase md:flex">
                      <div className="flex flex-col">
                        <span className="text-muted text-[9px] font-bold tracking-wider">
                          EMI Paid
                        </span>
                        <span className="text-foreground">
                          {formatIndianCurrency(yearEntry.emiPaid, 'short')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted text-[9px] font-bold tracking-wider">
                          Interest Paid
                        </span>
                        <span className="text-[var(--color-brand-orange)]">
                          {formatIndianCurrency(yearEntry.interestPaid, 'short')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted text-[9px] font-bold tracking-wider">
                          Outstanding
                        </span>
                        <span className="text-foreground">
                          {formatIndianCurrency(yearEntry.endingBalance, 'short')}
                        </span>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp size={18} className="text-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-background/50 animate-fade-in border-t border-[var(--border-subtle)] p-4">
                    {/* Summary for mobile */}
                    <div className="mb-4 grid grid-cols-3 gap-2 border-b border-[var(--border-subtle)] pb-4 text-center text-[10px] font-bold uppercase md:hidden">
                      <div className="bg-foreground/5 flex flex-col rounded-xl p-2">
                        <span className="text-muted mb-1 tracking-wider">Total EMI</span>
                        <span className="text-foreground text-xs font-black">
                          {formatIndianCurrency(yearEntry.emiPaid, 'short')}
                        </span>
                      </div>
                      <div className="bg-foreground/5 flex flex-col rounded-xl p-2">
                        <span className="text-muted mb-1 tracking-wider">Total Interest</span>
                        <span className="text-xs font-black text-[var(--color-brand-orange)]">
                          {formatIndianCurrency(yearEntry.interestPaid, 'short')}
                        </span>
                      </div>
                      <div className="bg-foreground/5 flex flex-col rounded-xl p-2">
                        <span className="text-muted mb-1 tracking-wider">Outstanding</span>
                        <span className="text-foreground text-xs font-black">
                          {formatIndianCurrency(yearEntry.endingBalance, 'short')}
                        </span>
                      </div>
                    </div>

                    {/* Table of Months within Year */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="text-muted border-b border-[var(--border-subtle)] text-[10px] font-black tracking-wider uppercase">
                            <th className="px-2 py-2.5">Month</th>
                            <th className="px-2 py-2.5 text-right">Start Balance</th>
                            <th className="px-2 py-2.5 text-right">EMI Paid</th>
                            <th className="px-2 py-2.5 text-right">Principal</th>
                            <th className="px-2 py-2.5 text-right text-[var(--color-brand-orange)]">
                              Interest
                            </th>
                            <th className="px-2 py-2.5 text-right">Ending Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-foreground/5 text-foreground/80 divide-y font-semibold">
                          {yearMonths.map((m) => (
                            <tr key={m.month} className="hover:bg-foreground/5 transition-colors">
                              <td className="text-foreground px-2 py-2 font-black">
                                Month {m.month}
                              </td>
                              <td className="px-2 py-2 text-right">
                                {formatIndianCurrency(m.startingBalance)}
                              </td>
                              <td className="text-foreground px-2 py-2 text-right font-bold">
                                {formatIndianCurrency(m.emi)}
                              </td>
                              <td className="px-2 py-2 text-right text-emerald-600 dark:text-emerald-400">
                                +{formatIndianCurrency(m.principalPaid)}
                              </td>
                              <td className="px-2 py-2 text-right text-[var(--color-brand-orange)]">
                                -{formatIndianCurrency(m.interestPaid)}
                              </td>
                              <td className="text-foreground px-2 py-2 text-right font-bold">
                                {formatIndianCurrency(m.endingBalance)}
                              </td>
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
          <div className="bg-foreground/5 overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-muted bg-background/50 border-b border-[var(--border-subtle)] text-[10px] font-black tracking-wider uppercase">
                  <th className="px-4 py-4">Month</th>
                  <th className="px-4 py-4 text-right">Starting Balance</th>
                  <th className="px-4 py-4 text-right">Monthly EMI</th>
                  <th className="px-4 py-4 text-right">Principal Paid</th>
                  <th className="px-4 py-4 text-right text-[var(--color-brand-orange)]">
                    Interest Paid
                  </th>
                  <th className="px-4 py-4 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-foreground/5 text-foreground/85 divide-y text-sm font-semibold">
                {currentRows.map((row) => (
                  <tr key={row.month} className="hover:bg-foreground/5 transition-colors">
                    <td className="text-foreground px-4 py-3 font-black">Month {row.month}</td>
                    <td className="px-4 py-3 text-right">
                      {formatIndianCurrency(row.startingBalance)}
                    </td>
                    <td className="text-foreground px-4 py-3 text-right font-black">
                      {formatIndianCurrency(row.emi)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                      +{formatIndianCurrency(row.principalPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-brand-orange)]">
                      -{formatIndianCurrency(row.interestPaid)}
                    </td>
                    <td className="text-foreground px-4 py-3 text-right font-bold">
                      {formatIndianCurrency(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
              <span className="text-muted text-xs font-bold">
                Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, schedule.length)} of{' '}
                {schedule.length} Months
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground disabled:hover:bg-foreground/5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
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
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground disabled:hover:bg-foreground/5 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-40"
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
