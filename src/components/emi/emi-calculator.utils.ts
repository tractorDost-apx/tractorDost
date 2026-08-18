import { EmiCalculatorInputs, EmiCalculatorResults, AmortizationScheduleEntry, YearlySummaryEntry } from './emi-calculator.types';

/**
 * Calculates monthly EMI and overall totals
 */
export const calculateEmiResults = (inputs: EmiCalculatorInputs): EmiCalculatorResults => {
  const loanAmount = Math.max(0, inputs.vehiclePrice - inputs.downPayment);
  const tenureMonths = inputs.tenureUnit === 'years' 
    ? inputs.tenureValue * 12 
    : inputs.tenureValue;
  
  if (loanAmount === 0 || tenureMonths === 0) {
    return {
      loanAmount: 0,
      monthlyEmi: 0,
      totalInterest: 0,
      totalPayable: 0,
      principalPercent: 100,
      interestPercent: 0,
    };
  }

  const annualInterestRate = inputs.interestRate;
  
  // Handle 0% interest promo rate
  if (annualInterestRate === 0) {
    const monthlyEmi = Math.round((loanAmount / tenureMonths) * 100) / 100;
    const totalPayable = loanAmount;
    return {
      loanAmount,
      monthlyEmi,
      totalInterest: 0,
      totalPayable,
      principalPercent: 100,
      interestPercent: 0,
    };
  }

  const monthlyInterestRate = (annualInterestRate / 12) / 100;
  
  // Standard EMI formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
  const emiNumerator = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths);
  const emiDenominator = Math.pow(1 + monthlyInterestRate, tenureMonths) - 1;
  const monthlyEmi = Math.round((emiNumerator / emiDenominator) * 100) / 100;

  const totalPayable = Math.round(monthlyEmi * tenureMonths * 100) / 100;
  const totalInterest = Math.max(0, Math.round((totalPayable - loanAmount) * 100) / 100);

  const principalPercent = totalPayable > 0 ? Math.round((loanAmount / totalPayable) * 10000) / 100 : 100;
  const interestPercent = totalPayable > 0 ? Math.round((totalInterest / totalPayable) * 10000) / 100 : 0;

  return {
    loanAmount,
    monthlyEmi,
    totalInterest,
    totalPayable,
    principalPercent,
    interestPercent,
  };
};

/**
 * Generates month-by-month amortization schedule
 */
export const generateAmortizationSchedule = (inputs: EmiCalculatorInputs): AmortizationScheduleEntry[] => {
  const loanAmount = Math.max(0, inputs.vehiclePrice - inputs.downPayment);
  const tenureMonths = inputs.tenureUnit === 'years' 
    ? inputs.tenureValue * 12 
    : inputs.tenureValue;
  
  const schedule: AmortizationScheduleEntry[] = [];
  if (loanAmount === 0 || tenureMonths === 0) return schedule;

  const results = calculateEmiResults(inputs);
  const monthlyEmi = results.monthlyEmi;
  const annualInterestRate = inputs.interestRate;
  const monthlyInterestRate = (annualInterestRate / 12) / 100;

  let currentBalance = loanAmount;

  for (let month = 1; month <= tenureMonths; month++) {
    const startingBalance = currentBalance;
    
    // Interest for the month
    const interestPaid = annualInterestRate === 0 
      ? 0 
      : Math.round(startingBalance * monthlyInterestRate * 100) / 100;
      
    // Principal for the month
    let principalPaid = Math.round((monthlyEmi - interestPaid) * 100) / 100;
    
    // Adjust final month to zero out remaining balance due to rounding
    if (month === tenureMonths || currentBalance - principalPaid < 1.0) {
      principalPaid = startingBalance;
    }
    
    const endingBalance = Math.max(0, Math.round((startingBalance - principalPaid) * 100) / 100);
    const actualEmiPaid = Math.round((principalPaid + interestPaid) * 100) / 100;
    
    schedule.push({
      month,
      startingBalance,
      emi: actualEmiPaid,
      principalPaid,
      interestPaid,
      endingBalance,
    });

    currentBalance = endingBalance;
    if (currentBalance <= 0) break;
  }

  return schedule;
};

/**
 * Generates a yearly summary from the amortization schedule
 */
export const generateYearlySummary = (schedule: AmortizationScheduleEntry[]): YearlySummaryEntry[] => {
  const yearlySummary: YearlySummaryEntry[] = [];
  if (schedule.length === 0) return yearlySummary;

  let currentYear = 1;
  let emiPaid = 0;
  let principalPaid = 0;
  let interestPaid = 0;

  for (let i = 0; i < schedule.length; i++) {
    const monthEntry = schedule[i];
    emiPaid += monthEntry.emi;
    principalPaid += monthEntry.principalPaid;
    interestPaid += monthEntry.interestPaid;

    // Push summary at the end of every 12 months, or the final month of the schedule
    if ((i + 1) % 12 === 0 || i === schedule.length - 1) {
      yearlySummary.push({
        year: currentYear,
        emiPaid: Math.round(emiPaid * 100) / 100,
        principalPaid: Math.round(principalPaid * 100) / 100,
        interestPaid: Math.round(interestPaid * 100) / 100,
        endingBalance: monthEntry.endingBalance,
      });

      currentYear++;
      // Reset counters for next year
      emiPaid = 0;
      principalPaid = 0;
      interestPaid = 0;
    }
  }

  return yearlySummary;
};

/**
 * Formats standard Indian Currency display (e.g. ₹ 6,50,000 or ₹ 6.50 Lakh)
 */
export const formatIndianCurrency = (value: number, type: 'short' | 'full' = 'full'): string => {
  if (value === 0) return '₹ 0';

  if (type === 'short' && value >= 100000) {
    const lakhs = value / 100000;
    if (lakhs >= 100) {
      const crores = lakhs / 100;
      return `₹ ${crores.toFixed(2)} Cr`;
    }
    return `₹ ${lakhs.toFixed(2)} Lakh`;
  }

  // standard Indian formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};
