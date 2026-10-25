export type FuelType = 'DIESEL' | 'ELECTRIC' | 'CNG' | 'HYBRID';

export const FUEL_TYPES: { label: string; value: FuelType }[] = [
  { label: 'Diesel', value: 'DIESEL' },
  { label: 'Electric (EV)', value: 'ELECTRIC' },
  { label: 'CNG', value: 'CNG' },
  { label: 'Hybrid', value: 'HYBRID' },
];
