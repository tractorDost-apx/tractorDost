export interface LoanTypeMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  interestRateMin: number;
  interestRateMax: number;
  maxTenureYears: number;
  maxFinancingPct: number;
  processingFeePct: number;
  features: string[];
  eligibility: string[];
  requiredDocuments: string[];
}

export const LOAN_TYPES_DATA: Record<string, LoanTypeMeta> = {
  'new-tractor': {
    id: 'new-tractor',
    slug: 'new-tractor',
    title: 'New Tractor Loan',
    subtitle: 'Finance up to 90% of on-road tractor cost with lowest interest rates',
    interestRateMin: 9.5,
    interestRateMax: 12.5,
    maxTenureYears: 7,
    maxFinancingPct: 90,
    processingFeePct: 0.5,
    features: [
      'Up to 90% funding on ex-showroom or on-road price',
      'Flexible repayment: monthly, quarterly, or half-yearly crop harvest cycles',
      'Quick in-principle sanction within 24 to 48 hours',
      'Direct disbursal to OEM authorized dealerships',
    ],
    eligibility: [
      'Minimum age 18 years, maximum 65 years at loan maturity',
      'Must own minimum 2 acres of cultivable agricultural land',
      'Kisan Credit Card (KCC) or stable agricultural income proof',
    ],
    requiredDocuments: [
      'Aadhaar Card and PAN Card of borrower & co-borrower',
      '7/12 extract / 8A / Jamabandi / Khasra-Khatoni land documents',
      'Last 6 months bank account statement',
      'Dealer proforma quotation for selected tractor model',
    ],
  },
  'used-tractor': {
    id: 'used-tractor',
    slug: 'used-tractor',
    title: 'Used Tractor Loan',
    subtitle: 'Quick loans on pre-owned certified tractors up to 10 years old',
    interestRateMin: 12.0,
    interestRateMax: 15.5,
    maxTenureYears: 5,
    maxFinancingPct: 75,
    processingFeePct: 1.0,
    features: [
      'Up to 75% of certified fair market valuation',
      'Tractors up to 10 years of manufacturing age eligible',
      'Free 120-point mechanical inspection by TractorDost engineers',
      'Assistance with RTO RC transfer and hypothecation',
    ],
    eligibility: [
      'Farmer or commercial haulage operator with 1+ year experience',
      'Valid identity and residential proof in operational district',
      'Clean track record with zero active NPA defaults',
    ],
    requiredDocuments: [
      'KYC documents (Aadhaar & PAN)',
      'Original RC copy and fitness certificate of tractor',
      'Tractor valuation certificate issued by TractorDost',
      'Bank passbook or 6-month statement',
    ],
  },
  'loan-against-tractor': {
    id: 'loan-against-tractor',
    slug: 'loan-against-tractor',
    title: 'Loan Against Tractor (Refinance)',
    subtitle: 'Unlock instant liquidity from your existing debt-free tractor',
    interestRateMin: 11.5,
    interestRateMax: 14.5,
    maxTenureYears: 4,
    maxFinancingPct: 70,
    processingFeePct: 1.0,
    features: [
      'Cash in hand for farm expansion, seeds, fertilizers, or emergencies',
      'Keep driving and working your tractor without interruption',
      'Simple hypothecation endorsement on existing RC book',
      'Disbursal directly to farmer savings account within 3 days',
    ],
    eligibility: [
      'Tractor must be 100% debt-free (NOC from previous financier if financed earlier)',
      'Tractor age must not exceed 8 years',
      'Registered in the borrower’s own name',
    ],
    requiredDocuments: [
      'KYC (Aadhaar, PAN, Voter ID)',
      'Original RC Book with clear title and zero active hypothecation',
      'Valid comprehensive vehicle insurance and pollution certificate',
      'Cancelled cheque of bank account for direct disbursal',
    ],
  },
  implement: {
    id: 'implement',
    slug: 'implement',
    title: 'Farm Implement & Machinery Loan',
    subtitle: 'Financing for rotavators, balers, seeders, and harvesters under SMAM',
    interestRateMin: 10.5,
    interestRateMax: 13.5,
    maxTenureYears: 5,
    maxFinancingPct: 80,
    processingFeePct: 0.75,
    features: [
      'Financing for rotavators, balers, multi-crop threshers, and combine headers',
      'Full compatibility with Central/State SMAM agricultural subsidy schemes',
      'Repayment aligned with seasonal crop harvesting revenues',
    ],
    eligibility: [
      'Active farmer owning a tractor of compatible horsepower (30+ HP)',
      'Registration on national/state agriculture DBT portal',
    ],
    requiredDocuments: [
      'Aadhaar, PAN, and passport size photographs',
      'Existing tractor RC copy showing ownership',
      'Proforma invoice from authorized equipment implement dealer',
      'Land revenue records',
    ],
  },
};

export const LOAN_TYPE_LIST: LoanTypeMeta[] = Object.values(LOAN_TYPES_DATA);
