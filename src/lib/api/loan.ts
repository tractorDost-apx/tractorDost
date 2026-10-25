import { apiClient } from './axios/axios';
import { leadAPI, LeadType } from './leads';
import { emiAPI, CreateEmiCalculationPayload } from './emi';

export interface LoanPartner {
  id: string;
  name: string;
  logo: string;
  minRate: number;
  maxRate: number;
  maxTenureMonths: number;
  maxFundingPct: number;
  processingFeePct: number;
  popularFor: string;
}

export interface LoanApplicationPayload {
  name: string;
  mobile: string;
  email?: string;
  state: string;
  district?: string;
  city?: string;
  loanType: 'NEW_TRACTOR' | 'USED_TRACTOR' | 'LOAN_AGAINST_TRACTOR' | 'IMPLEMENT';
  tractorBrand?: string;
  tractorModel?: string;
  tractorId?: number;
  loanAmountRequested: number;
  tenureMonths: number;
  annualIncome?: number;
  landHoldingAcres?: number;
  message?: string;
  sourcePage?: string;
}

export const LOAN_PARTNERS: LoanPartner[] = [
  {
    id: 'sbi',
    name: 'State Bank of India (SBI)',
    logo: 'https://companiesmarketcap.com/img/company-logos/256/SBIN.NS.png',
    minRate: 8.95,
    maxRate: 11.5,
    maxTenureMonths: 84,
    maxFundingPct: 85,
    processingFeePct: 0.5,
    popularFor: 'Lowest interest rates & maximum subsidy support',
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    logo: 'https://companiesmarketcap.com/img/company-logos/256/HDB.png',
    minRate: 9.5,
    maxRate: 12.5,
    maxTenureMonths: 60,
    maxFundingPct: 90,
    processingFeePct: 1.0,
    popularFor: 'Fast approval in 30 minutes with minimal documents',
  },
  {
    id: 'mahindra-finance',
    name: 'Mahindra Finance',
    logo: 'https://companiesmarketcap.com/img/company-logos/256/M_MFIN.NS.png',
    minRate: 10.25,
    maxRate: 14.0,
    maxTenureMonths: 60,
    maxFundingPct: 85,
    processingFeePct: 1.5,
    popularFor: 'Special rural schemes with flexible seasonal repayment',
  },
  {
    id: 'chola',
    name: 'Cholamandalam Finance',
    logo: 'https://companiesmarketcap.com/img/company-logos/256/CHOLAFIN.NS.png',
    minRate: 10.5,
    maxRate: 14.5,
    maxTenureMonths: 60,
    maxFundingPct: 80,
    processingFeePct: 1.5,
    popularFor: 'Easy approvals for used tractors and first-time buyers',
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    logo: 'https://companiesmarketcap.com/img/company-logos/256/KOTAKBANK.NS.png',
    minRate: 9.75,
    maxRate: 13.0,
    maxTenureMonths: 72,
    maxFundingPct: 90,
    processingFeePct: 1.0,
    popularFor: 'Customized EMI tailored to harvesting cycles',
  },
];

export const loanAPI = {
  /**
   * Submit loan application as an enterprise lead in backend
   */
  applyForLoan: async (payload: LoanApplicationPayload) => {
    return await leadAPI.createLead({
      leadType: 'LOAN' as LeadType,
      name: payload.name,
      mobile: payload.mobile,
      email: payload.email,
      state: payload.state,
      district: payload.district,
      city: payload.city,
      budget: payload.loanAmountRequested,
      interestedBrand: payload.tractorBrand,
      interestedModel: payload.tractorModel,
      tractorId: payload.tractorId,
      sourcePage: payload.sourcePage || '/loan',
      message: `[Loan Type: ${payload.loanType}] Requested: ₹${payload.loanAmountRequested?.toLocaleString('en-IN')}, Tenure: ${payload.tenureMonths} Months, Land: ${payload.landHoldingAcres || 0} Acres. ${payload.message || ''}`.trim(),
    });
  },

  /**
   * Calculate EMI and amortization schedule using capitalization API
   */
  calculateLoanEmi: async (payload: CreateEmiCalculationPayload) => {
    return await emiAPI.saveCalculation(payload);
  },

  /**
   * Fetch approved partner banks and financial institutions
   */
  getLoanPartners: () => {
    return LOAN_PARTNERS;
  },
};
