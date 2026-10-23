'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Save, X } from 'lucide-react';
import {
  appSettingAPI,
  CreateAppSettingInput,
  getAppSettingErrorMessage,
  getAppSettingFieldErrors,
  UpdateAppSettingInput,
} from '@/lib/api/appSettings';
import {
  APP_SETTING_DATA_TYPES,
  type AppSetting,
  type AppSettingDataType,
} from '@/types/models/appSetting';

interface AppSettingEditorProps {
  /** null opens the editor in create mode. */
  setting: AppSetting | null;
  onClose: () => void;
  onSaved: (setting: AppSetting, mode: 'create' | 'update') => void;
}

interface AppSettingFormState {
  key: string;
  value: string;
  dataType: AppSettingDataType;
  description: string;
  isPublic: boolean;
}

type AppSettingFormErrors = Partial<Record<keyof AppSettingFormState | 'form', string>>;

// Mirror the backend's appSetting.validation rules so most mistakes are caught before a request.
const KEY_RE = /^[A-Za-z0-9_.-]+$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const VALUE_MAX = 10000;
const DESCRIPTION_MAX = 200;

const DATA_TYPE_LABELS: Record<AppSettingDataType, string> = {
  string: 'Text',
  json: 'JSON',
  boolean: 'Boolean',
  number: 'Number',
};

const DATA_TYPE_HINTS: Record<AppSettingDataType, string> = {
  string: 'Any text.',
  json: 'Must be valid JSON.',
  boolean: 'Either true or false.',
  number: 'A whole or decimal number, such as 42 or 3.5.',
};

/** Stored data types from the server are plain strings. Unknown ones fall back to text in the form. */
const toFormDataType = (value: string): AppSettingDataType =>
  (APP_SETTING_DATA_TYPES as readonly string[]).includes(value)
    ? (value as AppSettingDataType)
    : 'string';

function getInitialState(setting: AppSetting | null): AppSettingFormState {
  return {
    key: setting?.key ?? '',
    value: setting?.value ?? '',
    dataType: setting ? toFormDataType(setting.dataType) : 'string',
    description: setting?.description ?? '',
    isPublic: setting?.isPublic ?? false,
  };
}

function isValueValidForDataType(value: string, dataType: AppSettingDataType): boolean {
  switch (dataType) {
    case 'boolean':
      return value === 'true' || value === 'false';
    case 'number':
      return NUMBER_RE.test(value);
    case 'json':
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    default:
      return true;
  }
}

function validate(form: AppSettingFormState, original: AppSetting | null): AppSettingFormErrors {
  const errors: AppSettingFormErrors = {};
  const key = form.key.trim();

  if (!original) {
    if (!key) errors.key = 'Key is required.';
    else if (key.length > 100) errors.key = 'Key must be at most 100 characters.';
    else if (!KEY_RE.test(key)) {
      errors.key = "Key may only contain letters, numbers, '.', '_' and '-'.";
    }
  }

  // Edit mode only checks the value when it is sent. The backend requires a value and its type
  // together, so a changed type also sends the value.
  const valueIsSent =
    !original ||
    form.value !== original.value ||
    form.dataType !== toFormDataType(original.dataType);
  if (valueIsSent) {
    if (form.value.length === 0) errors.value = 'Value is required.';
    else if (form.value.length > VALUE_MAX)
      errors.value = `Value must be at most ${VALUE_MAX} characters.`;
    else if (form.value.startsWith('enc:')) errors.value = "Value cannot start with 'enc:'.";
    else if (!isValueValidForDataType(form.value, form.dataType)) {
      errors.value = `Value does not match the ${DATA_TYPE_LABELS[form.dataType].toLowerCase()} type. ${DATA_TYPE_HINTS[form.dataType]}`;
    }
  }

  if (form.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${DESCRIPTION_MAX} characters.`;
  }

  return errors;
}

/** Sends only the fields that changed. Returns null when nothing changed. */
function buildUpdatePayload(
  form: AppSettingFormState,
  original: AppSetting
): UpdateAppSettingInput | null {
  const payload: UpdateAppSettingInput = {};
  const originalType = toFormDataType(original.dataType);

  if (form.value !== original.value || form.dataType !== originalType) {
    payload.value = form.value;
    payload.dataType = form.dataType;
  }

  const description = form.description.trim();
  if (description !== (original.description ?? '')) payload.description = description || null;

  if (form.isPublic !== original.isPublic) payload.isPublic = form.isPublic;

  return Object.keys(payload).length > 0 ? payload : null;
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

export default function AppSettingEditor({ setting, onClose, onSaved }: AppSettingEditorProps) {
  const isEdit = setting !== null;

  // In edit mode the setting is fetched by key so the form starts from the latest stored value.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<AppSettingFormState>(() => getInitialState(setting));
  const [original, setOriginal] = useState<AppSetting | null>(null);
  const [errors, setErrors] = useState<AppSettingFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [revealValue, setRevealValue] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!setting) return;
    let active = true;
    appSettingAPI
      .getByKey(setting.key)
      .then((res) => {
        if (!active || !res.data) return;
        setOriginal(res.data);
        setForm(getInitialState(res.data));
      })
      .catch((err: unknown) => {
        console.error('Failed to load app setting:', err);
        if (active) {
          setLoadError(getAppSettingErrorMessage(err, 'Could not load this setting.'));
        }
      });
    return () => {
      active = false;
    };
  }, [setting]);

  const loading = isEdit && original === null && loadError === null;
  const payload = original ? buildUpdatePayload(form, original) : null;
  const canSave = !submitting && (!isEdit || payload !== null);
  const masked = !revealValue;

  const update = <K extends keyof AppSettingFormState>(field: K, value: AppSettingFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Switching to boolean seeds a valid value, because the select always shows one of its options.
  const changeDataType = (dataType: AppSettingDataType) => {
    setForm((prev) => ({
      ...prev,
      dataType,
      value:
        dataType === 'boolean' && prev.value !== 'true' && prev.value !== 'false'
          ? 'true'
          : prev.value,
    }));
    setErrors((prev) => ({ ...prev, dataType: undefined, value: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const nextErrors = validate(form, original);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (original) {
        const res = await appSettingAPI.update(original.key, payload ?? {});
        if (!res.data) throw new Error('Missing setting in update response');
        onSaved(res.data, 'update');
      } else {
        const input: CreateAppSettingInput = {
          key: form.key.trim(),
          value: form.value,
          dataType: form.dataType,
          description: form.description.trim() || undefined,
          isPublic: form.isPublic,
        };
        const res = await appSettingAPI.create(input);
        if (!res.data) throw new Error('Missing setting in create response');
        onSaved(res.data, 'create');
      }
    } catch (err: unknown) {
      // Log the status only, because the request body holds the value.
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      console.error('Failed to save app setting', { status });
      const fieldErrors = getAppSettingFieldErrors(err);
      if (status === 409) {
        setErrors({
          key: getAppSettingErrorMessage(err, 'A setting with this key already exists.'),
        });
      } else if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as AppSettingFormErrors);
      } else {
        setFormError(getAppSettingErrorMessage(err, 'Could not save the setting.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/75">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#121814]">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-6 py-4 dark:border-white/10">
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              {isEdit ? 'Edit setting' : 'New setting'}
            </h3>
            {isEdit && setting && (
              <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {setting.key}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs font-bold text-zinc-500">
            <Loader2 size={16} className="animate-spin text-[var(--color-brand-green)]" />
            Loading setting...
          </div>
        ) : loadError ? (
          <div className="px-6 py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              Could not load this setting
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-600 dark:text-zinc-400">
              {loadError}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-700 dark:text-red-300"
                >
                  <AlertCircle size={14} className="mt-px shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Field
                label="Key"
                required={!isEdit}
                error={errors.key}
                hint={
                  isEdit
                    ? 'Keys cannot be changed. Create a new setting to use a different key.'
                    : 'Letters, numbers, ".", "_" and "-". Up to 100 characters.'
                }
              >
                <input
                  type="text"
                  value={form.key}
                  disabled={isEdit || submitting}
                  onChange={(e) => update('key', e.target.value)}
                  placeholder="site.contact_email"
                  autoComplete="off"
                  className={`${inputClass(Boolean(errors.key))} font-mono disabled:opacity-60`}
                />
              </Field>

              <Field label="Data type" required error={errors.dataType}>
                <select
                  value={form.dataType}
                  disabled={submitting}
                  onChange={(e) => changeDataType(e.target.value as AppSettingDataType)}
                  className={`${inputClass(false)} cursor-pointer`}
                >
                  {APP_SETTING_DATA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {DATA_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </Field>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Value <span className="text-red-500">*</span>
                  </label>
                  {form.dataType !== 'boolean' && (
                    <button
                      type="button"
                      onClick={() => setRevealValue((v) => !v)}
                      className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                    >
                      {revealValue ? <EyeOff size={12} /> : <Eye size={12} />}
                      {revealValue ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>

                {form.dataType === 'boolean' ? (
                  <select
                    value={form.value === 'false' ? 'false' : 'true'}
                    disabled={submitting}
                    onChange={(e) => update('value', e.target.value)}
                    className={`${inputClass(Boolean(errors.value))} cursor-pointer`}
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : form.dataType === 'json' || form.dataType === 'string' ? (
                  <textarea
                    value={form.value}
                    disabled={submitting}
                    onChange={(e) => update('value', e.target.value)}
                    rows={form.dataType === 'json' ? 6 : 3}
                    spellCheck={false}
                    autoComplete="off"
                    data-lpignore="true"
                    className={`${inputClass(Boolean(errors.value))} resize-y ${form.dataType === 'json' ? 'font-mono' : ''} ${masked ? '[-webkit-text-security:disc]' : ''}`}
                  />
                ) : (
                  <input
                    type={masked ? 'password' : 'text'}
                    inputMode="decimal"
                    value={form.value}
                    disabled={submitting}
                    onChange={(e) => update('value', e.target.value)}
                    autoComplete="off"
                    data-lpignore="true"
                    className={`${inputClass(Boolean(errors.value))} font-mono`}
                  />
                )}
                {errors.value ? (
                  <p className="mt-1 text-[11px] font-medium text-red-500">{errors.value}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {DATA_TYPE_HINTS[form.dataType]} Values are encrypted when stored.
                  </p>
                )}
              </div>

              <Field
                label="Description"
                error={errors.description}
                hint={`Optional. Up to ${DESCRIPTION_MAX} characters. ${form.description.trim().length}/${DESCRIPTION_MAX}`}
              >
                <input
                  type="text"
                  value={form.description}
                  disabled={submitting}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="What this setting controls"
                  className={inputClass(Boolean(errors.description))}
                />
              </Field>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-white/10 dark:bg-black/40">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                    {!form.isPublic && <Lock size={12} className="text-zinc-500" />}
                    Public
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Public settings can be read by anyone through the public get endpoint. Private
                    settings are visible only to admins.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isPublic}
                  aria-label="Public setting"
                  disabled={submitting}
                  onClick={() => update('isPublic', !form.isPublic)}
                  className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-50 ${
                    form.isPublic ? 'bg-[var(--color-brand-green)]' : 'bg-zinc-300 dark:bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.isPublic ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5 border-t border-zinc-200 px-6 py-4 dark:border-white/10">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isEdit && !payload ? 'No changes to save.' : ''}
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSave}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>
                    {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create setting'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
