import {
  ConditionGrade,
  ListingStatus,
  type ListingFilters,
  type ListingSortBy,
} from '@/types/models/used-listing';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';

/** Status tabs on the staff grid; 'ALL' sends no listingStatus */
export type StatusTab = 'ALL' | ListingStatus;

/** Filter inputs as the admin edits them. Every value is a string; '' means "not set". */
export interface UsedListingFilterValues {
  dealerId: string;
  tractorBrand: string;
  tractorModel: string;
  ownership: string;
  conditionGrade: string;
  yearMin: string;
  yearMax: string;
  state: string;
  district: string;
  city: string;
  priceMin: string;
  priceMax: string;
  minViews: string;
  maxViews: string;
  minLeads: string;
  maxLeads: string;
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
}

export interface UsedListingQuery {
  status: StatusTab;
  search: string;
  sortBy: ListingSortBy;
  page: number;
  limit: number;
  filters: UsedListingFilterValues;
}

/** Chip / clear groups: each one is a label on screen and the set of inputs it clears */
export type FilterGroup =
  | 'dealer'
  | 'brand'
  | 'model'
  | 'ownership'
  | 'condition'
  | 'year'
  | 'state'
  | 'district'
  | 'city'
  | 'price'
  | 'views'
  | 'leads'
  | 'created'
  | 'updated';

export type FilterErrors = Partial<
  Record<'price' | 'year' | 'views' | 'leads' | 'created' | 'updated', string>
>;

export const EMPTY_FILTER_VALUES: UsedListingFilterValues = {
  dealerId: '',
  tractorBrand: '',
  tractorModel: '',
  ownership: '',
  conditionGrade: '',
  yearMin: '',
  yearMax: '',
  state: '',
  district: '',
  city: '',
  priceMin: '',
  priceMax: '',
  minViews: '',
  maxViews: '',
  minLeads: '',
  maxLeads: '',
  createdFrom: '',
  createdTo: '',
  updatedFrom: '',
  updatedTo: '',
};

export const PAGE_SIZE_OPTIONS: readonly number[] = [10, 20, 50, 100];

export const DEFAULT_USED_LISTING_QUERY: UsedListingQuery = {
  status: 'ALL',
  search: '',
  sortBy: 'created_desc',
  page: 1,
  limit: 10,
  filters: EMPTY_FILTER_VALUES,
};

export const USED_LISTING_SORT_OPTIONS: { value: ListingSortBy; label: string }[] = [
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'views_desc', label: 'Most Viewed' },
  { value: 'views_asc', label: 'Least Viewed' },
  { value: 'leads_desc', label: 'Most Enquiries' },
  { value: 'leads_asc', label: 'Least Enquiries' },
  { value: 'updated_desc', label: 'Recently Updated' },
  { value: 'updated_asc', label: 'Oldest Updated' },
];

export const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'ALL', label: 'All Listings' },
  { value: ListingStatus.PENDING_APPROVAL, label: 'PENDING APPROVAL' },
  { value: ListingStatus.ACTIVE, label: 'ACTIVE' },
  { value: ListingStatus.REJECTED, label: 'REJECTED' },
  { value: ListingStatus.SOLD, label: 'SOLD' },
];

const CONDITION_LABELS: Record<ConditionGrade, string> = {
  [ConditionGrade.EXCELLENT]: 'Excellent',
  [ConditionGrade.GOOD]: 'Good',
  [ConditionGrade.FAIR]: 'Fair',
  [ConditionGrade.POOR]: 'Poor',
};

const GROUP_KEYS: Record<FilterGroup, (keyof UsedListingFilterValues)[]> = {
  dealer: ['dealerId'],
  brand: ['tractorBrand'],
  model: ['tractorModel'],
  ownership: ['ownership'],
  condition: ['conditionGrade'],
  year: ['yearMin', 'yearMax'],
  state: ['state'],
  district: ['district'],
  city: ['city'],
  price: ['priceMin', 'priceMax'],
  views: ['minViews', 'maxViews'],
  leads: ['minLeads', 'maxLeads'],
  created: ['createdFrom', 'createdTo'],
  updated: ['updatedFrom', 'updatedTo'],
};

const SORT_VALUES = USED_LISTING_SORT_OPTIONS.map((option) => option.value);
const STATUS_VALUES: StatusTab[] = STATUS_TABS.map((tab) => tab.value);

function ordinal(n: number): string {
  const suffix =
    n % 10 === 1 && n % 100 !== 11
      ? 'st'
      : n % 10 === 2 && n % 100 !== 12
        ? 'nd'
        : n % 10 === 3 && n % 100 !== 13
          ? 'rd'
          : 'th';
  return `${n}${suffix}`;
}

/** Owner count options; the API matches `ownership` exactly */
export const OWNERSHIP_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${ordinal(i + 1)} owner`,
}));

export const CONDITION_OPTIONS = Object.values(ConditionGrade).map((grade) => ({
  value: grade,
  label: CONDITION_LABELS[grade],
}));

/** Reads the grid state from the URL. Unknown or malformed values fall back to defaults. */
export function parseUsedListingQuery(params: Pick<URLSearchParams, 'get'>): UsedListingQuery {
  const status = params.get('status') as StatusTab | null;
  const sort = params.get('sort') as ListingSortBy | null;
  const page = Number(params.get('page'));
  const limit = Number(params.get('limit'));

  const filters = { ...EMPTY_FILTER_VALUES };
  for (const key of Object.keys(EMPTY_FILTER_VALUES) as (keyof UsedListingFilterValues)[]) {
    filters[key] = params.get(key) ?? '';
  }

  return {
    status: status && STATUS_VALUES.includes(status) ? status : 'ALL',
    search: params.get('q') ?? '',
    sortBy: sort && SORT_VALUES.includes(sort) ? sort : DEFAULT_USED_LISTING_QUERY.sortBy,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE_OPTIONS.includes(limit) ? limit : DEFAULT_USED_LISTING_QUERY.limit,
    filters,
  };
}

/** Writes only non-default values, so the default grid has a clean URL */
export function serializeUsedListingQuery(query: UsedListingQuery): string {
  const params = new URLSearchParams();
  if (query.status !== 'ALL') params.set('status', query.status);
  if (query.search) params.set('q', query.search);
  if (query.sortBy !== DEFAULT_USED_LISTING_QUERY.sortBy) params.set('sort', query.sortBy);
  if (query.page !== 1) params.set('page', String(query.page));
  if (query.limit !== DEFAULT_USED_LISTING_QUERY.limit) params.set('limit', String(query.limit));
  for (const [key, value] of Object.entries(query.filters)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

/** A finite number, or undefined for '' and anything that is not a number */
function toNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Maps the grid state onto GET /used-listings/getAll query params */
export function toListingFilters(query: UsedListingQuery): ListingFilters {
  const f = query.filters;
  return {
    search: toText(query.search),
    listingStatus: query.status === 'ALL' ? undefined : query.status,
    sortBy: query.sortBy,
    page: query.page,
    limit: query.limit,
    dealerId: toNumber(f.dealerId),
    tractorBrand: toText(f.tractorBrand),
    tractorModel: toText(f.tractorModel),
    ownership: toNumber(f.ownership),
    conditionGrade: toText(f.conditionGrade) as ConditionGrade | undefined,
    yearMin: toNumber(f.yearMin),
    yearMax: toNumber(f.yearMax),
    state: toText(f.state),
    district: toText(f.district),
    city: toText(f.city),
    priceMin: toNumber(f.priceMin),
    priceMax: toNumber(f.priceMax),
    minViews: toNumber(f.minViews),
    maxViews: toNumber(f.maxViews),
    minLeads: toNumber(f.minLeads),
    maxLeads: toNumber(f.maxLeads),
    createdFrom: toText(f.createdFrom),
    createdTo: toText(f.createdTo),
    updatedFrom: toText(f.updatedFrom),
    updatedTo: toText(f.updatedTo),
  };
}

/** Message for an inverted or negative numeric range, or undefined when the range is fine */
function numberRangeError(
  min: string,
  max: string,
  label: string,
  floor: number
): string | undefined {
  const lo = toNumber(min);
  const hi = toNumber(max);
  if ((lo !== undefined && lo < floor) || (hi !== undefined && hi < floor)) {
    return `${label} must be ${floor} or more`;
  }
  if (lo !== undefined && hi !== undefined && lo > hi) {
    return `The minimum ${label.toLowerCase()} is above the maximum`;
  }
  return undefined;
}

function dateRangeError(from: string, to: string): string | undefined {
  // Both values come from <input type="date">, so they are YYYY-MM-DD and compare as strings
  if (from && to && from > to) return 'The start date is after the end date';
  return undefined;
}

/** Field-level problems in the filter panel. Apply stays disabled while any exist. */
export function validateFilterValues(f: UsedListingFilterValues): FilterErrors {
  const errors: FilterErrors = {};
  const price = numberRangeError(f.priceMin, f.priceMax, 'Price', 0);
  const year = numberRangeError(f.yearMin, f.yearMax, 'Year', 1900);
  const views = numberRangeError(f.minViews, f.maxViews, 'Views', 0);
  const leads = numberRangeError(f.minLeads, f.maxLeads, 'Enquiries', 0);
  const created = dateRangeError(f.createdFrom, f.createdTo);
  const updated = dateRangeError(f.updatedFrom, f.updatedTo);
  if (price) errors.price = price;
  if (year) errors.year = year;
  if (views) errors.views = views;
  if (leads) errors.leads = leads;
  if (created) errors.created = created;
  if (updated) errors.updated = updated;
  return errors;
}

/** Empties one group's inputs; other groups are left as they are */
export function clearFilterGroup(
  f: UsedListingFilterValues,
  group: FilterGroup
): UsedListingFilterValues {
  const next = { ...f };
  for (const key of GROUP_KEYS[group]) next[key] = '';
  return next;
}

export interface ActiveFilterChip {
  group: FilterGroup;
  label: string;
}

function rangeText(
  min: string,
  max: string,
  format: (value: number) => string
): string | undefined {
  const lo = toNumber(min);
  const hi = toNumber(max);
  if (lo !== undefined && hi !== undefined) return `${format(lo)} – ${format(hi)}`;
  if (lo !== undefined) return `from ${format(lo)}`;
  if (hi !== undefined) return `up to ${format(hi)}`;
  return undefined;
}

const plain = (value: number) => value.toLocaleString('en-IN');

/** One chip per filter group that is set. `dealerName` is null while the name is loading. */
export function activeFilterChips(
  f: UsedListingFilterValues,
  dealerName: string | null
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  const add = (group: FilterGroup, label: string | undefined, prefix: string) => {
    if (label) chips.push({ group, label: `${prefix}: ${label}` });
  };

  const dealerId = toNumber(f.dealerId);
  if (dealerId !== undefined) add('dealer', dealerName ?? `#${dealerId}`, 'Dealer');
  add('brand', toText(f.tractorBrand), 'Brand');
  add('model', toText(f.tractorModel), 'Model');
  const ownership = toNumber(f.ownership);
  if (ownership !== undefined) add('ownership', ordinal(ownership) + ' owner', 'Ownership');
  if (f.conditionGrade)
    add('condition', CONDITION_LABELS[f.conditionGrade as ConditionGrade], 'Condition');
  add(
    'year',
    rangeText(f.yearMin, f.yearMax, (value) => String(value)),
    'Year'
  );
  add('state', toText(f.state), 'State');
  add('district', toText(f.district), 'District');
  add('city', toText(f.city), 'City');
  add(
    'price',
    rangeText(f.priceMin, f.priceMax, (value) => formatINR(value)),
    'Price'
  );
  add('views', rangeText(f.minViews, f.maxViews, plain), 'Views');
  add('leads', rangeText(f.minLeads, f.maxLeads, plain), 'Enquiries');
  if (f.createdFrom || f.createdTo) {
    add(
      'created',
      `${f.createdFrom ? formatDate(f.createdFrom) : 'any'} – ${f.createdTo ? formatDate(f.createdTo) : 'any'}`,
      'Listed'
    );
  }
  if (f.updatedFrom || f.updatedTo) {
    add(
      'updated',
      `${f.updatedFrom ? formatDate(f.updatedFrom) : 'any'} – ${f.updatedTo ? formatDate(f.updatedTo) : 'any'}`,
      'Updated'
    );
  }
  return chips;
}
