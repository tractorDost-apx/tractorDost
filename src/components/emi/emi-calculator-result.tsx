import React, { useState } from 'react';
import { Copy, Check, Share2, Info, CloudUpload, AlertCircle } from 'lucide-react';
import { EmiCalculatorInputs, EmiCalculatorResults } from './emi-calculator.types';
import { formatIndianCurrency } from './emi-calculator.utils';

interface EmiCalculatorResultProps {
  inputs: EmiCalculatorInputs;
  results: EmiCalculatorResults;
}

export const EmiCalculatorResult: React.FC<EmiCalculatorResultProps> = ({
  inputs,
  results,
}) => {
  const { vehiclePrice, downPayment, downPaymentPercent, interestRate, tenureValue, tenureUnit } = inputs;
  const { loanAmount, monthlyEmi, totalInterest, totalPayable } = results;

  const [copied, setCopied] = useState(false);

  const getTenureString = () => {
    if (tenureUnit === 'years') {
      return `${tenureValue} Year${tenureValue > 1 ? 's' : ''} (${tenureValue * 12} Months)`;
    }
    return `${tenureValue} Month${tenureValue > 1 ? 's' : ''}`;
  };

  const handleShare = () => {
    const shareText = `🚜 Tractor Dost - EMI Calculation Summary 🚜
---------------------------------------------
Tractor Price     : ${formatIndianCurrency(vehiclePrice)}
Down Payment      : ${formatIndianCurrency(downPayment)} (${downPaymentPercent}%)
Loan Amount       : ${formatIndianCurrency(loanAmount)}
Interest Rate     : ${interestRate}% P.A.
Tenure            : ${getTenureString()}
---------------------------------------------
Monthly EMI       : ${formatIndianCurrency(monthlyEmi)} / month
Total Interest    : ${formatIndianCurrency(totalInterest)}
Total Amount Paid : ${formatIndianCurrency(totalPayable)}
---------------------------------------------
Calculate your tractor loan at: ${typeof window !== 'undefined' ? window.location.href : 'https://tractordost.com/emi-calculator'}`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-[var(--card-bg)] border border-[var(--card-border)] p-6 md:p-8 rounded-3xl shadow-[var(--card-shadow)] relative overflow-hidden backdrop-blur-md">
      {/* Accent lighting glow */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--color-brand-orange)]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-2">
        <h2 className="text-xl md:text-2xl font-black uppercase text-foreground tracking-tight">
          Calculation Result
        </h2>
        <div className="flex gap-2">
          {/* Share button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              copied
                ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20'
                : 'bg-foreground/5 hover:bg-[var(--color-brand-green)]/10 text-muted hover:text-[var(--color-brand-green)] border border-transparent hover:border-[var(--color-brand-green)]/20'
            }`}
          >
            {copied ? (
              <>
                <Check size={13} /> Copied!
              </>
            ) : (
              <>
                <Share2 size={13} /> Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action status banners */}
      {copied && (
        <div className="bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/25 text-[var(--color-brand-green)] text-xs font-bold py-2.5 px-4 rounded-xl text-center animate-pulse">
          Summary text has been copied to your clipboard.
        </div>
      )}

      {/* EMI CALCULATION HERO */}
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[var(--color-brand-green)]/5 to-[var(--color-brand-green)]/15 border border-[var(--color-brand-green)]/10 rounded-2xl text-center relative">
        <span className="text-[10px] font-black uppercase text-[var(--color-brand-green)] tracking-widest bg-[var(--color-brand-green)]/10 px-3 py-1 rounded-full mb-2">
          Estimated Monthly Installment
        </span>
        <span className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-brand-green)] tracking-tight">
          {formatIndianCurrency(monthlyEmi)}<span className="text-xs md:text-sm font-black text-muted">/month</span>
        </span>
        <p className="text-[10px] font-bold text-muted mt-3 flex items-center gap-1">
          <Info size={11} /> Actual interest rate and charges vary by bank.
        </p>
      </div>

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loan Amount */}
        <div className="flex flex-col gap-1.5 p-4 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted">Loan Amount</span>
          <span className="text-lg font-black text-foreground">
            {formatIndianCurrency(loanAmount)}
          </span>
          <span className="text-[9px] font-bold text-muted">
            Price - Down Payment
          </span>
        </div>

        {/* Total Interest */}
        <div className="flex flex-col gap-1.5 p-4 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted">Total Interest</span>
          <span className="text-lg font-black text-[var(--color-brand-orange)]">
            {formatIndianCurrency(totalInterest)}
          </span>
          <span className="text-[9px] font-bold text-muted">
            Interest portion of loan
          </span>
        </div>

        {/* Total Amount Paid */}
        <div className="flex flex-col gap-1.5 p-4 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted">Total Payable</span>
          <span className="text-lg font-black text-foreground">
            {formatIndianCurrency(totalPayable)}
          </span>
          <span className="text-[9px] font-bold text-muted">
            Principal + Interest
          </span>
        </div>
      </div>
    </div>
  );
};
