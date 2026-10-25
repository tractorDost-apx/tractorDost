export interface HpSegment {
  id: string;
  label: string;
  minHp: number;
  maxHp: number;
  description: string;
  recommendedUse: string;
}

export const HP_SEGMENTS: HpSegment[] = [
  {
    id: 'under-20',
    label: 'Under 20 HP',
    minHp: 1,
    maxHp: 20,
    description: 'Compact mini tractors for vineyards, orchards, and gardens',
    recommendedUse: 'Orchard spraying, inter-cultivation, rotary tilling in narrow lanes',
  },
  {
    id: '21-30',
    label: '21 HP - 30 HP',
    minHp: 21,
    maxHp: 30,
    description: 'Light agricultural tractors for small landholdings up to 3 acres',
    recommendedUse: 'Rotavator (3.5 ft), single bottom plough, puddling',
  },
  {
    id: '31-40',
    label: '31 HP - 40 HP',
    minHp: 31,
    maxHp: 40,
    description: 'Most popular all-round utility tractors for 3-7 acre farms',
    recommendedUse: '5 ft rotavator, cultivator, seed drill, trolley haulage up to 4 tons',
  },
  {
    id: '41-50',
    label: '41 HP - 50 HP',
    minHp: 41,
    maxHp: 50,
    description: 'Powerful tractors for medium-to-large farms and custom hiring',
    recommendedUse: '6 ft rotavator, reversible MB plough, thresher, laser leveller',
  },
  {
    id: '51-60',
    label: '51 HP - 60 HP',
    minHp: 51,
    maxHp: 60,
    description: 'Heavy duty machines for large farms, contractors, and balers',
    recommendedUse: 'Round baler, 7 ft rotavator, multi-speed threshing, sugarcane haulage',
  },
  {
    id: 'above-60',
    label: 'Above 60 HP',
    minHp: 61,
    maxHp: 150,
    description: 'High capacity commercial grade tractors with 4WD capabilities',
    recommendedUse: 'Heavy laser land levelling, large pneumatic seeders, subsoilers',
  },
];

export const BUDGET_RANGES = [
  { label: 'Under ₹3 Lakh', min: 0, max: 300000 },
  { label: '₹3 - ₹5 Lakh', min: 300000, max: 500000 },
  { label: '₹5 - ₹7 Lakh', min: 500000, max: 700000 },
  { label: '₹7 - ₹10 Lakh', min: 700000, max: 1000000 },
  { label: 'Above ₹10 Lakh', min: 1000000, max: 5000000 },
];
