import type { ConditionGrade } from '@/types/enums/condition-grades';

export interface SellTractorFormValues {
  // Step 1: Tractor Basics
  tractorBrand: string;
  tractorModel: string;
  yearOfManufacture: number;
  ownership: number;
  hoursUsed: number;

  // Step 2: Pricing & Location
  askingPrice: number;
  negotiable: boolean;
  financeAvailable: boolean;
  state: string;
  district: string;
  villageCity?: string;
  pincode?: string;

  // Step 3: Condition & Health
  conditionGrade: ConditionGrade;
  tyreCondition?: ConditionGrade;
  engineConditionPct?: number;
  hydraulicsCondition?: ConditionGrade;
  clutchCondition?: ConditionGrade;
  bodyCondition?: ConditionGrade;
  majorRepairs?: string;
  description?: string;

  // Step 4: Documentation
  rcAvailable: boolean;
  insuranceValidity?: string;
  loanClearanceStatus?: 'NOC_AVAILABLE' | 'UNDER_FINANCE' | 'NOT_APPLICABLE';

  // Step 5: Media & Seller Details
  photos?: string[];
  sellerName?: string;
  sellerPhone?: string;
}

export interface ValuationRequestFormValues {
  tractorBrand: string;
  tractorModel: string;
  yearOfManufacture: number;
  hoursUsed: number;
  conditionGrade: ConditionGrade;
  state: string;
  district: string;
  mobile: string;
}

export interface InspectionBookingFormValues {
  listingId: number;
  preferredDate: string;
  preferredTimeSlot: string;
  inspectionAddress: string;
  contactMobile: string;
  notes?: string;
}
