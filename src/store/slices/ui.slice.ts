export interface UiState {
  theme: 'light' | 'dark' | 'system';
  isMobileMenuOpen: boolean;
  isSearchModalOpen: boolean;
  isLocationModalOpen: boolean;
  activeLanguage: 'en' | 'hi' | 'mr';
}

export const initialUiState: UiState = {
  theme: 'system',
  isMobileMenuOpen: false,
  isSearchModalOpen: false,
  isLocationModalOpen: false,
  activeLanguage: 'en',
};
