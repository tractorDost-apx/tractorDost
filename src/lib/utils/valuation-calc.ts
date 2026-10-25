import {
  ANNUAL_DEPRECIATION_RATES,
  HOURLY_USAGE_DEPRECIATION_PER_THOUSAND,
  CONDITION_MULTIPLIERS,
  ADDITIONAL_OWNER_PENALTY_PCT,
  MAX_OWNERSHIP_PENALTY_PCT,
} from '@/lib/constants/depreciation-curves';
import type { ConditionGrade } from '@/types/enums/condition-grades';

export interface ValuationParameters {
  baseNewPrice?: number;
  yearOfManufacture: number;
  engineHours: number;
  conditionGrade?: ConditionGrade | string;
  numberOfOwners?: number;
}

export interface CalculatedValuation {
  fairMarketPrice: number;
  dealerTradeInPrice: number;
  privatePartyPriceMin: number;
  privatePartyPriceMax: number;
  depreciationPct: number;
}

export function calculateTractorValuation(params: ValuationParameters): CalculatedValuation {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - params.yearOfManufacture);
  const basePrice = params.baseNewPrice || 550000;

  // 1. Age depreciation
  const cappedAge = Math.min(10, Math.max(1, age));
  const ageDepreciationRate = age === 0 ? 0 : ANNUAL_DEPRECIATION_RATES[cappedAge] || 0.65;

  // 2. Engine hours depreciation
  const hours = Math.max(0, params.engineHours || 0);
  const usageDepreciationRate = Math.min(0.25, (hours / 1000) * HOURLY_USAGE_DEPRECIATION_PER_THOUSAND);

  // 3. Combined base depreciation
  const totalDepreciationRate = Math.min(0.75, ageDepreciationRate + usageDepreciationRate);
  let value = basePrice * (1 - totalDepreciationRate);

  // 4. Condition Grade adjustment
  const cond = (params.conditionGrade || 'GOOD') as keyof typeof CONDITION_MULTIPLIERS;
  const conditionFactor = CONDITION_MULTIPLIERS[cond] || 1.0;
  value *= conditionFactor;

  // 5. Ownership penalty
  const owners = Math.max(1, params.numberOfOwners || 1);
  if (owners > 1) {
    const penalty = Math.min(MAX_OWNERSHIP_PENALTY_PCT, (owners - 1) * ADDITIONAL_OWNER_PENALTY_PCT);
    value *= (1 - penalty);
  }

  // Round to nearest 2,500 INR
  const fairMarketPrice = Math.round(value / 2500) * 2500;
  const dealerTradeInPrice = Math.round((fairMarketPrice * 0.88) / 2500) * 2500;
  const privatePartyPriceMin = Math.round((fairMarketPrice * 0.94) / 2500) * 2500;
  const privatePartyPriceMax = Math.round((fairMarketPrice * 1.06) / 2500) * 2500;

  return {
    fairMarketPrice,
    dealerTradeInPrice,
    privatePartyPriceMin,
    privatePartyPriceMax,
    depreciationPct: Math.round(((basePrice - fairMarketPrice) / basePrice) * 100),
  };
}
