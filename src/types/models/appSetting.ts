export const APP_SETTING_DATA_TYPES = ['string', 'json', 'boolean', 'number'] as const;

export type AppSettingDataType = (typeof APP_SETTING_DATA_TYPES)[number];

/**
 * Setting as returned to admin callers. `value` is decrypted plaintext on the server, so it is
 * sensitive and is masked in the UI until an admin asks to reveal it.
 */
export interface AppSetting {
  id: number;
  key: string;
  value: string;
  dataType: string;
  description: string | null;
  isPublic: boolean;
  updatedBy: number | null;
  updatedAt: string;
}

/** Delete response. The backend leaves out the value. */
export type AppSettingSummary = Omit<AppSetting, 'value'>;

export interface AppSettingListMeta {
  totalItems: number;
  itemCount: number;
  totalPages: number;
  currentPage: number;
}
