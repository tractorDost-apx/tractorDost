'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Save, AlertCircle, Image as ImageIcon, Loader2, Upload, Trash2, RotateCcw } from 'lucide-react';
import {
  bannerAPI,
  BANNER_IMAGE_ACCEPT,
  BANNER_PLACEMENTS,
  buildBannerFormData,
  CreateBannerInput,
  getBannerErrorMessage,
  getBannerImageError,
  HOME_HERO_PLACEMENT,
  placementKey,
} from '@/lib/api/banners';
import type { Banner } from '@/types/models/banner';

interface BannerEditorProps {
  /** null opens the editor in create mode. */
  banner: Banner | null;
  onClose: () => void;
  onSaved: (banner: Banner, mode: 'create' | 'update') => void;
}

interface BannerFormState {
  placement: string;
  title: string;
  linkUrl: string;
  ctaText: string;
  altText: string;
  startDate: string;
  endDate: string;
  sortOrder: string;
  isActive: boolean;
}

type BannerFormErrors = Partial<Record<keyof BannerFormState | 'desktopImage' | 'mobileImage', string>>;

const LINK_URL_RE = /^(https?:\/\/\S+|\/(?!\/)\S*)$/i;

/** ISO string to the value a datetime-local input expects, in the admin's local time. */
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local value to ISO. An empty value means "no date", which the backend stores as null. */
function fromDateTimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

const trimOrNull = (value: string): string | null => value.trim() || null;

const formatFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function getInitialState(banner: Banner | null): BannerFormState {
  return {
    placement: banner
      ? placementKey(banner.page, banner.position)
      : placementKey(HOME_HERO_PLACEMENT.page, HOME_HERO_PLACEMENT.position),
    title: banner?.title ?? '',
    linkUrl: banner?.linkUrl ?? '',
    ctaText: banner?.ctaText ?? '',
    altText: banner?.altText ?? '',
    startDate: toDateTimeLocal(banner?.startDate ?? null),
    endDate: toDateTimeLocal(banner?.endDate ?? null),
    sortOrder: String(banner?.sortOrder ?? 0),
    isActive: banner?.isActive ?? true,
  };
}

/** Mirrors the backend's banner.validation rules so most mistakes are caught before a request. */
function validate(form: BannerFormState): BannerFormErrors {
  const errors: BannerFormErrors = {};
  const linkUrl = form.linkUrl.trim();

  if (!BANNER_PLACEMENTS.some((p) => placementKey(p.page, p.position) === form.placement)) {
    errors.placement = 'Choose where this banner appears.';
  }
  if (form.title.trim().length > 200) errors.title = 'Title must be at most 200 characters.';
  if (linkUrl && !LINK_URL_RE.test(linkUrl)) {
    errors.linkUrl = 'Use an http(s) link or a path starting with / (for example /tractors).';
  }
  if (form.ctaText.trim().length > 100) errors.ctaText = 'Button text must be at most 100 characters.';
  if (form.altText.trim().length > 300) errors.altText = 'Alt text must be at most 300 characters.';

  const start = form.startDate ? new Date(form.startDate) : null;
  const end = form.endDate ? new Date(form.endDate) : null;
  if (start && Number.isNaN(start.getTime())) errors.startDate = 'Enter a valid start date.';
  if (end && Number.isNaN(end.getTime())) errors.endDate = 'Enter a valid end date.';
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
    errors.endDate = 'End date must be on or after the start date.';
  }

  const sortOrder = Number(form.sortOrder);
  if (!Number.isInteger(sortOrder) || sortOrder < -10000 || sortOrder > 10000) {
    errors.sortOrder = 'Sort order must be a whole number between -10000 and 10000.';
  }

  return errors;
}

/** Creates an object URL for a local file and frees it when the file changes or the modal closes. */
function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 transition-all dark:bg-black/40 dark:text-white dark:placeholder-white/30 ${
    hasError
      ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
      : 'border-zinc-200 focus:border-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] dark:border-white/10'
  }`;

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  );
}

interface ImageUploadFieldProps {
  label: string;
  required?: boolean;
  hint: string;
  error?: string;
  /** A file picked in this form. Takes precedence over the stored image. */
  file: File | null;
  /** The image already stored for this banner, when editing. */
  storedUrl: string | null;
  /** The stored image is marked for removal and will be cleared on save. */
  markedForRemoval: boolean;
  onSelect: (file: File) => void;
  onRemove?: () => void;
  onRestore?: () => void;
}

function ImageUploadField({
  label,
  required,
  hint,
  error,
  file,
  storedUrl,
  markedForRemoval,
  onSelect,
  onRemove,
  onRestore,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const localUrl = useObjectUrl(file);
  const shownUrl = localUrl ?? (markedForRemoval ? null : storedUrl);
  const hasImage = Boolean(shownUrl);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <div
        className={`flex flex-col overflow-hidden rounded-xl border border-dashed bg-zinc-50 dark:bg-black/40 ${
          error ? 'border-red-500/60' : 'border-zinc-300 dark:border-white/15'
        }`}
      >
        <div className="relative aspect-[16/9] w-full bg-zinc-100 dark:bg-black/60">
          {hasImage ? (
            // Remote S3 images are not whitelisted in next.config, so a plain <img> is used.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownUrl ?? undefined} alt={`${label} preview`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center text-[11px] text-zinc-500">
              <ImageIcon size={22} className="opacity-50" />
              <span>{markedForRemoval ? 'This image will be removed when you save.' : 'No image chosen'}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 p-2.5 dark:border-white/10">
          <span className="min-w-0 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
            {file ? `${file.name} · ${formatFileSize(file.size)}` : storedUrl && !markedForRemoval ? 'Current image' : hint}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {markedForRemoval && onRestore && (
              <button
                type="button"
                onClick={onRestore}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-700 transition-all hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <RotateCcw size={12} />
                <span>Undo</span>
              </button>
            )}
            {!markedForRemoval && onRemove && hasImage && (
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition-all hover:bg-red-500/20 dark:text-red-400"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-lg bg-[var(--color-brand-green)] px-2.5 py-1.5 text-[11px] font-bold text-white transition-all hover:opacity-90"
            >
              <Upload size={12} />
              <span>{hasImage ? 'Replace' : 'Choose image'}</span>
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={BANNER_IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (picked) onSelect(picked);
            // Clear the input so picking the same file again still fires onChange.
            e.target.value = '';
          }}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-red-500">{error}</p>
      ) : (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  );
}

export default function BannerEditor({ banner, onClose, onSaved }: BannerEditorProps) {
  const isEditing = banner !== null;
  const [form, setForm] = useState<BannerFormState>(() => getInitialState(banner));
  const [errors, setErrors] = useState<BannerFormErrors>({});
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [removeMobile, setRemoveMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setField = <K extends keyof BannerFormState>(key: K, value: BannerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /** Rejects a bad file before it is kept, so the form never holds a file the server would refuse. */
  const selectDesktop = (picked: File) => {
    const problem = getBannerImageError(picked);
    setErrors((prev) => ({ ...prev, desktopImage: problem ?? undefined }));
    if (!problem) setDesktopFile(picked);
  };

  const selectMobile = (picked: File) => {
    const problem = getBannerImageError(picked);
    setErrors((prev) => ({ ...prev, mobileImage: problem ?? undefined }));
    if (!problem) {
      setMobileFile(picked);
      setRemoveMobile(false);
    }
  };

  const removeMobileImage = () => {
    setMobileFile(null);
    setRemoveMobile(Boolean(banner?.mobileImageUrl));
    setErrors((prev) => ({ ...prev, mobileImage: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const fieldErrors = validate(form);
    if (!isEditing && !desktopFile) fieldErrors.desktopImage = 'Choose a desktop image.';
    if (errors.desktopImage) fieldErrors.desktopImage = errors.desktopImage;
    if (errors.mobileImage) fieldErrors.mobileImage = errors.mobileImage;
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const [page, position] = form.placement.split('|');
    const payload: CreateBannerInput = {
      page,
      position,
      title: trimOrNull(form.title),
      linkUrl: trimOrNull(form.linkUrl),
      ctaText: trimOrNull(form.ctaText),
      altText: trimOrNull(form.altText),
      startDate: fromDateTimeLocal(form.startDate),
      endDate: fromDateTimeLocal(form.endDate),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
    };
    const formData = buildBannerFormData(payload, {
      desktop: desktopFile ?? undefined,
      mobile: mobileFile ?? undefined,
      removeMobile: removeMobile && !mobileFile,
    });

    setSaving(true);
    try {
      if (banner) {
        const res = await bannerAPI.update(banner.id, formData);
        onSaved(res.data, 'update');
      } else {
        const res = await bannerAPI.create(formData);
        onSaved(res.data, 'create');
      }
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save banner:', err);
      setSaveError(getBannerErrorMessage(err, 'Could not save the banner. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-6 dark:bg-black/75">
      <div className="relative my-8 w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-7 dark:border-white/15 dark:bg-[#121814]">
        <div className="mb-5 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                {isEditing ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isEditing ? `Editing banner #${banner.id}` : 'Create a banner for the homepage'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-50 dark:border-transparent dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            title="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {saveError && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1 font-medium">{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Placement" required error={errors.placement}>
              <select
                value={form.placement}
                onChange={(e) => setField('placement', e.target.value)}
                className={`${inputClass(Boolean(errors.placement))} cursor-pointer font-bold`}
              >
                {BANNER_PLACEMENTS.map((p) => (
                  <option key={placementKey(p.page, p.position)} value={placementKey(p.page, p.position)}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sort order" error={errors.sortOrder} hint="Lower numbers appear first.">
              <input
                type="number"
                min={-10000}
                max={10000}
                step={1}
                value={form.sortOrder}
                onChange={(e) => setField('sortOrder', e.target.value)}
                className={inputClass(Boolean(errors.sortOrder))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Desktop image"
              required
              hint="JPEG, PNG or WebP, up to 5 MB."
              error={errors.desktopImage}
              file={desktopFile}
              storedUrl={banner?.imageUrl ?? null}
              markedForRemoval={false}
              onSelect={selectDesktop}
            />
            <ImageUploadField
              label="Mobile image"
              hint="Optional. Shown on screens under 768px wide. If empty, the desktop image is used."
              error={errors.mobileImage}
              file={mobileFile}
              storedUrl={banner?.mobileImageUrl ?? null}
              markedForRemoval={removeMobile}
              onSelect={selectMobile}
              onRemove={removeMobileImage}
              onRestore={() => setRemoveMobile(false)}
            />
          </div>

          <Field label="Title" error={errors.title} hint="Shown over the image.">
            <input
              type="text"
              maxLength={200}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={inputClass(Boolean(errors.title))}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Button text" error={errors.ctaText}>
              <input
                type="text"
                maxLength={100}
                value={form.ctaText}
                onChange={(e) => setField('ctaText', e.target.value)}
                placeholder="e.g. Explore tractors"
                className={inputClass(Boolean(errors.ctaText))}
              />
            </Field>
            <Field label="Link URL" error={errors.linkUrl} hint="https://... or a path such as /tractors.">
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => setField('linkUrl', e.target.value)}
                placeholder="/tractors"
                className={inputClass(Boolean(errors.linkUrl))}
              />
            </Field>
          </div>

          <Field label="Alt text" error={errors.altText} hint="Describes the image for screen readers.">
            <input
              type="text"
              maxLength={300}
              value={form.altText}
              onChange={(e) => setField('altText', e.target.value)}
              className={inputClass(Boolean(errors.altText))}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Starts at" error={errors.startDate} hint="Leave empty to start immediately.">
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
                className={inputClass(Boolean(errors.startDate))}
              />
            </Field>
            <Field label="Ends at" error={errors.endDate} hint="Leave empty to run without an end.">
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
                className={inputClass(Boolean(errors.endDate))}
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setField('isActive', e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[var(--color-brand-green)]"
            />
            Active (eligible to show when within its date window)
          </label>

          <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create banner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
