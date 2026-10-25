import type { CompareItem } from '@/hooks/ui/use-compare';

export interface CompareState {
  items: CompareItem[];
  maxItems: number;
}

export const initialCompareState: CompareState = {
  items: [],
  maxItems: 4,
};
