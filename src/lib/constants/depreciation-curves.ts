/**
 * Annual standard agricultural tractor depreciation percentage curves.
 * Farm tractors hold exceptional residual value in India compared to passenger cars.
 */
export const ANNUAL_DEPRECIATION_RATES: Record<number, number> = {
  1: 0.12,  // Year 1: Initial drive-off depreciation
  2: 0.18,  // Year 2: Total cumulative ~18%
  3: 0.24,  // Year 3: Total cumulative ~24%
  4: 0.30,  // Year 4: Total cumulative ~30%
  5: 0.36,  // Year 5: Total cumulative ~36%
  6: 0.42,  // Year 6: Total cumulative ~42%
  7: 0.48,  // Year 7: Total cumulative ~48%
  8: 0.54,  // Year 8: Total cumulative ~54%
  9: 0.60,  // Year 9: Total cumulative ~60%
  10: 0.65, // Year 10+: Max cumulative depreciation cap ~65%
};

/**
 * Hourly usage penalty multipliers per 1,000 engine hours.
 * Normal agricultural usage in India is ~600 - 800 hours / year.
 */
export const HOURLY_USAGE_DEPRECIATION_PER_THOUSAND = 0.012; // 1.2% per 1,000 engine hours

/**
 * Condition grade price adjustment factors.
 */
export const CONDITION_MULTIPLIERS = {
  EXCELLENT: 1.06, // +6% for pristine, serviced tractor
  GOOD: 1.0,       // Baseline
  FAIR: 0.85,      // -15% for minor cosmetic / tyre wear
  POOR: 0.68,      // -32% for major engine overhaul / repair needed
};

/**
 * Ownership deduction per additional owner beyond 1st owner.
 */
export const ADDITIONAL_OWNER_PENALTY_PCT = 0.06; // -6% per extra owner
export const MAX_OWNERSHIP_PENALTY_PCT = 0.25;    // Cap at -25%
