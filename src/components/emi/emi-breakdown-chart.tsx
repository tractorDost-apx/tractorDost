import React from 'react';
import { formatIndianCurrency } from './emi-calculator.utils';

interface EmiBreakdownChartProps {
  loanAmount: number;
  totalInterest: number;
  principalPercent: number;
  interestPercent: number;
}

export const EmiBreakdownChart: React.FC<EmiBreakdownChartProps> = ({
  loanAmount,
  totalInterest,
  principalPercent,
  interestPercent,
}) => {
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius; // ~439.82

  // Avoid division by zero
  const total = loanAmount + totalInterest;
  const safePrincipalPercent = total > 0 ? (loanAmount / total) * 100 : 100;
  const safeInterestPercent = total > 0 ? (totalInterest / total) * 100 : 0;

  // Calculate stroke dash offsets
  // Principal starts at offset 0
  const principalStrokeDash = circumference;
  const principalOffset = 0;

  // Interest starts where Principal ends
  const interestStrokeDash = circumference;
  const interestOffset = circumference - (safePrincipalPercent / 100) * circumference;

  return (
    <div className="bg-foreground/5 relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-16 w-16 rounded-full bg-[var(--color-brand-orange)]/5 blur-xl" />

      <h3 className="text-muted mb-6 text-sm font-black tracking-wider uppercase">
        Payment Breakdown
      </h3>

      <div className="relative flex h-48 w-48 items-center justify-center">
        {/* SVG Donut Chart */}
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Base track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />

          {/* Principal segment (Green) */}
          {loanAmount > 0 && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="var(--color-brand-green)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${(safePrincipalPercent / 100) * circumference} ${circumference}`}
              strokeDashoffset={principalOffset}
              strokeLinecap={safeInterestPercent > 0 ? 'butt' : 'round'}
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* Interest segment (Orange) */}
          {totalInterest > 0 && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="var(--color-brand-orange)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${(safeInterestPercent / 100) * circumference} ${circumference}`}
              strokeDashoffset={interestOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* Center label inside Donut */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-muted text-[10px] font-black tracking-wider uppercase">
            Total Payable
          </span>
          <span className="text-foreground mt-0.5 text-base font-black">
            {formatIndianCurrency(total, 'short')}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown values */}
      <div className="mt-6 grid w-full grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-4">
        {/* Principal Legend */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--color-brand-green)]" />
            <span className="text-muted text-xs font-black tracking-wider uppercase">
              Principal
            </span>
          </div>
          <span className="text-foreground text-sm font-black">
            {formatIndianCurrency(loanAmount)}
          </span>
          <span className="rounded-full bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-black text-[var(--color-brand-green)]">
            {principalPercent.toFixed(1)}%
          </span>
        </div>

        {/* Interest Legend */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--color-brand-orange)]" />
            <span className="text-muted text-xs font-black tracking-wider uppercase">Interest</span>
          </div>
          <span className="text-foreground text-sm font-black">
            {formatIndianCurrency(totalInterest)}
          </span>
          <span className="rounded-full bg-[var(--color-brand-orange)]/10 px-2 py-0.5 text-[10px] font-black text-[var(--color-brand-orange)]">
            {interestPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
