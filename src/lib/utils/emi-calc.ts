export interface EmiCalculationResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  amortization?: { month: number; principal: number; interest: number; balance: number }[];
}

/**
 * Calculates monthly EMI based on standard compound interest formula:
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EmiCalculationResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalPayable: 0 };
  }

  const monthlyRate = annualInterestRate / 12 / 100;

  if (monthlyRate === 0) {
    const monthlyEmi = Math.round(principal / tenureMonths);
    return {
      monthlyEmi,
      totalInterest: 0,
      totalPayable: principal,
    };
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  const totalPayable = monthlyEmi * tenureMonths;
  const totalInterest = totalPayable - principal;

  return {
    monthlyEmi,
    totalInterest,
    totalPayable,
  };
}
