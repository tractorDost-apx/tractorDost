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
    <div className="flex flex-col items-center justify-center p-4 bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] relative overflow-hidden h-full">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-16 h-16 bg-[var(--color-brand-orange)]/5 rounded-full blur-xl pointer-events-none" />

      <h3 className="text-sm font-black uppercase tracking-wider text-muted mb-6">
        Payment Breakdown
      </h3>

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* SVG Donut Chart */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
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
          <span className="text-[10px] font-black uppercase text-muted tracking-wider">Total Payable</span>
          <span className="text-base font-black text-foreground mt-0.5">
            {formatIndianCurrency(total, 'short')}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown values */}
      <div className="grid grid-cols-2 gap-4 w-full mt-6 border-t border-[var(--border-subtle)] pt-4">
        {/* Principal Legend */}
        <div className="flex flex-col gap-1 items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--color-brand-green)] shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-muted">Principal</span>
          </div>
          <span className="text-sm font-black text-foreground">
            {formatIndianCurrency(loanAmount)}
          </span>
          <span className="text-[10px] font-black text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-2 py-0.5 rounded-full">
            {principalPercent.toFixed(1)}%
          </span>
        </div>

        {/* Interest Legend */}
        <div className="flex flex-col gap-1 items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--color-brand-orange)] shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-muted">Interest</span>
          </div>
          <span className="text-sm font-black text-foreground">
            {formatIndianCurrency(totalInterest)}
          </span>
          <span className="text-[10px] font-black text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/10 px-2 py-0.5 rounded-full">
            {interestPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
