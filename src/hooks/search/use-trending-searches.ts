'use client';

export const DEFAULT_TRENDING_SEARCHES = [
  'Mahindra 575 DI XP Plus',
  'Swaraj 744 XT',
  'John Deere 5310 4WD',
  'Sonalika DI 745 III',
  'Massey Ferguson 241 DI',
  'Eicher 380 Super DI',
  'Mini Tractor under 3 Lakh',
  'Rotavator 6 Feet Price',
  'Combine Harvester Subsidy',
  'Second Hand Tractor in Maharashtra',
];

export function useTrendingSearches() {
  return { trendingSearches: DEFAULT_TRENDING_SEARCHES };
}
