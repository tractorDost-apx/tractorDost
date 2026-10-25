'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { brandAPI, type Brand } from '@/lib/api/brands';
import { INDIAN_STATES } from '@/lib/constants/indian-states';
import {
  CONDITION_OPTIONS,
  EMPTY_FILTER_VALUES,
  OWNERSHIP_OPTIONS,
  clearFilterGroup,
  validateFilterValues,
  type UsedListingFilterValues,
} from '@/lib/utils/used-listing-filters';
import { DealerFilterPicker } from './DealerFilterPicker';

interface UsedListingFilterPanelProps {
  /** Filters currently applied to the grid */
  applied: UsedListingFilterValues;
  onApply: (filters: UsedListingFilterValues) => void;
  onClose: () => void;
}

const inputClass =
  'bg-background w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-xs font-bold text-foreground outline-none focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/10';

const CURRENT_YEAR = new Date().getFullYear();

/** Keeps a value that is not in the list (e.g. from an old URL) visible in its select */
function withCurrent(options: string[], current: string): string[] {
  return current && !options.includes(current) ? [...options, current] : options;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-muted text-[10px] font-black tracking-widest uppercase">{title}</h3>
      {children}
    </section>
  );
}

interface RangeFieldProps {
  label: string;
  type: 'number' | 'date' | 'text';
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  error?: string;
  onReset?: () => void;
  numberMin?: number;
  numberMax?: number;
}

function RangeField({
  label,
  type,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  error,
  onReset,
  numberMin,
  numberMax,
}: RangeFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground text-xs font-bold">{label}</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-muted text-[10px] font-black tracking-wider uppercase transition-colors hover:text-[var(--color-brand-green)]"
          >
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type={type}
          aria-label={`${label} from`}
          aria-invalid={!!error}
          value={minValue}
          placeholder={minPlaceholder}
          min={numberMin}
          max={numberMax}
          onChange={(e) => onMinChange(e.target.value)}
          className={`${inputClass} ${error ? 'border-rose-500/50' : ''}`}
        />
        <input
          type={type}
          aria-label={`${label} to`}
          aria-invalid={!!error}
          value={maxValue}
          placeholder={maxPlaceholder}
          min={numberMin}
          max={numberMax}
          onChange={(e) => onMaxChange(e.target.value)}
          className={`${inputClass} ${error ? 'border-rose-500/50' : ''}`}
        />
      </div>
      {error && <p className="text-xs font-bold text-rose-400">{error}</p>}
    </div>
  );
}

/**
 * Filter panel for the staff used-listings grid. Edits happen on a local draft and reach the grid
 * only on Apply, so changing one field never resets the others.
 */
export function UsedListingFilterPanel({ applied, onApply, onClose }: UsedListingFilterPanelProps) {
  const [draft, setDraft] = useState(applied);
  const [syncedApplied, setSyncedApplied] = useState(applied);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Filter chips and "Clear all" can change the applied filters while the panel is open.
  // Resyncing during render (not in an effect) avoids an extra render pass.
  if (applied !== syncedApplied) {
    setSyncedApplied(applied);
    setDraft(applied);
  }

  useEffect(() => {
    brandAPI
      .getAllBrands({ limit: 100 })
      .then((res) => {
        if (res.success) setBrands(res.data.data.filter((brand) => brand.isActive));
      })
      .catch(() => setBrands([]));
  }, []);

  const errors = validateFilterValues(draft);
  const hasErrors = Object.keys(errors).length > 0;

  const bind = (key: keyof UsedListingFilterValues) => ({
    value: draft[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((d) => ({ ...d, [key]: e.target.value })),
  });

  const rangeHandlers = (
    minKey: keyof UsedListingFilterValues,
    maxKey: keyof UsedListingFilterValues
  ) => ({
    onMinChange: (value: string) => setDraft((d) => ({ ...d, [minKey]: value })),
    onMaxChange: (value: string) => setDraft((d) => ({ ...d, [maxKey]: value })),
  });

  const dealerId =
    draft.dealerId !== '' && Number.isFinite(Number(draft.dealerId))
      ? Number(draft.dealerId)
      : null;
  const brandNames = withCurrent(
    brands.map((brand) => brand.name),
    draft.tractorBrand
  );
  const stateNames = withCurrent([...INDIAN_STATES], draft.state);

  return (
    <div className="animate-fade-in rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 shadow-[var(--card-shadow)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-foreground text-base font-black tracking-tight">Filter listings</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg p-1.5 transition-colors"
          aria-label="Close filters"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Section title="Dealer">
          <DealerFilterPicker
            value={dealerId}
            onChange={(id) => setDraft((d) => ({ ...d, dealerId: id === null ? '' : String(id) }))}
          />
        </Section>

        <Section title="Tractor Details">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-foreground text-xs font-bold">Brand</span>
              <select {...bind('tractorBrand')} className={inputClass}>
                <option value="">All brands</option>
                {brandNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-foreground text-xs font-bold">Model</span>
              <input
                {...bind('tractorModel')}
                type="text"
                maxLength={100}
                placeholder="e.g. 575 DI"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-foreground text-xs font-bold">Ownership</span>
              <select {...bind('ownership')} className={inputClass}>
                <option value="">Any owner</option>
                {OWNERSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-foreground text-xs font-bold">Condition</span>
              <select {...bind('conditionGrade')} className={inputClass}>
                <option value="">Any condition</option>
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <RangeField
            label="Manufacturing year"
            type="number"
            numberMin={1900}
            numberMax={CURRENT_YEAR + 1}
            minValue={draft.yearMin}
            maxValue={draft.yearMax}
            minPlaceholder="From"
            maxPlaceholder="To"
            error={errors.year}
            {...rangeHandlers('yearMin', 'yearMax')}
          />
        </Section>

        <Section title="Location">
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-xs font-bold">State</span>
            <select {...bind('state')} className={inputClass}>
              <option value="">All states</option>
              {stateNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-xs font-bold">District</span>
            <input
              {...bind('district')}
              type="text"
              maxLength={100}
              placeholder="e.g. Pune"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground text-xs font-bold">City / village</span>
            <input
              {...bind('city')}
              type="text"
              maxLength={100}
              placeholder="e.g. Baramati"
              className={inputClass}
            />
          </label>
        </Section>

        <Section title="Price">
          <RangeField
            label="Asking price (₹)"
            type="number"
            numberMin={0}
            minValue={draft.priceMin}
            maxValue={draft.priceMax}
            error={errors.price}
            onReset={() => setDraft((d) => clearFilterGroup(d, 'price'))}
            {...rangeHandlers('priceMin', 'priceMax')}
          />
        </Section>

        <Section title="Activity">
          <RangeField
            label="Views"
            type="number"
            numberMin={0}
            minValue={draft.minViews}
            maxValue={draft.maxViews}
            error={errors.views}
            {...rangeHandlers('minViews', 'maxViews')}
          />
          <RangeField
            label="Enquiries (leads)"
            type="number"
            numberMin={0}
            minValue={draft.minLeads}
            maxValue={draft.maxLeads}
            error={errors.leads}
            {...rangeHandlers('minLeads', 'maxLeads')}
          />
        </Section>

        <Section title="Date">
          <RangeField
            label="Listed on"
            type="date"
            minValue={draft.createdFrom}
            maxValue={draft.createdTo}
            error={errors.created}
            {...rangeHandlers('createdFrom', 'createdTo')}
          />
          <RangeField
            label="Last updated"
            type="date"
            minValue={draft.updatedFrom}
            maxValue={draft.updatedTo}
            error={errors.updated}
            {...rangeHandlers('updatedFrom', 'updatedTo')}
          />
        </Section>
      </div>

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-end">
        {hasErrors && (
          <p className="text-xs font-bold text-rose-400 sm:mr-auto">
            Fix the highlighted ranges to apply.
          </p>
        )}
        <button
          type="button"
          onClick={() => setDraft(EMPTY_FILTER_VALUES)}
          className="bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl px-5 py-2.5 text-sm font-bold transition-colors"
        >
          Reset Filters
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          disabled={hasErrors}
          className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-opacity disabled:pointer-events-none disabled:opacity-50"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
