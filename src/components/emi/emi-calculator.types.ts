export interface EmiCalculatorInputs {
  vehiclePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  interestRate: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
  selectedBrandId?: number;
  selectedTractorId?: number;
}

export interface EmiCalculatorResults {
  loanAmount: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  principalPercent: number;
  interestPercent: number;
}

export interface AmortizationScheduleEntry {
  month: number;
  startingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface YearlySummaryEntry {
  year: number;
  emiPaid: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface EmiValidationErrors {
  vehiclePrice?: string;
  downPayment?: string;
  interestRate?: string;
  tenureValue?: string;
}
