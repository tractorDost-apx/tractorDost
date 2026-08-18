export const EMI_LIMITS = {
  VEHICLE_PRICE_MIN: 100000, // 1 Lakh
  VEHICLE_PRICE_MAX: 3000000, // 30 Lakhs
  VEHICLE_PRICE_STEP: 10000,

  DOWN_PAYMENT_MIN: 0,
  DOWN_PAYMENT_MAX_PERCENT: 90,
  DOWN_PAYMENT_STEP: 5000,

  INTEREST_RATE_MIN: 0, // Zero interest promotions
  INTEREST_RATE_MAX: 30, // Max rate for high-risk rural financing
  INTEREST_RATE_STEP: 0.25,

  TENURE_YEARS_MIN: 1,
  TENURE_YEARS_MAX: 7,
  TENURE_YEARS_STEP: 1,

  TENURE_MONTHS_MIN: 12,
  TENURE_MONTHS_MAX: 84,
  TENURE_MONTHS_STEP: 6,
};

export const EMI_DEFAULTS = {
  VEHICLE_PRICE: 600000, // ₹6 Lakh
  DOWN_PAYMENT_PERCENT: 20, // 20% down payment (₹1.2 Lakh)
  INTEREST_RATE: 12, // 12% p.a. interest rate (typical tractor loan rate range: 10.5% - 15%)
  TENURE_VALUE: 5, // 5 years
  TENURE_UNIT: 'years' as const,
};

export interface FinancingPreset {
  name: string;
  description: string;
  downPaymentPercent: number;
  interestRate: number;
  tenureValue: number;
  tenureUnit: 'years' | 'months';
}

export const FINANCING_PRESETS: FinancingPreset[] = [
  {
    name: 'Standard Farmer Loan',
    description: 'Average 20% down payment with a 5-year repayment window.',
    downPaymentPercent: 20,
    interestRate: 11.5,
    tenureValue: 5,
    tenureUnit: 'years',
  },
  {
    name: 'Low Down Payment Offer',
    description: 'Start with just 10% down payment, suitable for immediate purchases.',
    downPaymentPercent: 10,
    interestRate: 12.5,
    tenureValue: 6,
    tenureUnit: 'years',
  },
  {
    name: 'Quick Repayment Scheme',
    description: 'Higher down payment (30%) and short tenure to minimize total interest paid.',
    downPaymentPercent: 30,
    interestRate: 10.5,
    tenureValue: 3,
    tenureUnit: 'years',
  },
  {
    name: 'Promotional 0% Interest (Mock)',
    description: 'Manufacturer-subsidized 0% interest rate, available on select models.',
    downPaymentPercent: 25,
    interestRate: 0,
    tenureValue: 2,
    tenureUnit: 'years',
  },
];
