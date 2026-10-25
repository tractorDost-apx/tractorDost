export interface SearchState {
  query: string;
  recentSearches: string[];
  selectedBrandId: number | null;
  selectedState: string | null;
  selectedHpRange: string | null;
}

export const initialSearchState: SearchState = {
  query: '',
  recentSearches: [],
  selectedBrandId: null,
  selectedState: null,
  selectedHpRange: null,
};
