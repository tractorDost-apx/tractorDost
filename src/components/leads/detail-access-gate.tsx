'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Lock, ShieldCheck, X, Loader2, CheckCircle2, Download, Sparkles, MapPin } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/constants/indian-states';
import { leadAPI, type DetailAccessGrant, type DetailTargetType, type DetailAccessLeadInput } from '@/lib/api/leads';
import { captureLocation, geocodeLocationText, reverseGeocodeCoords, saveDetailAccess } from '@/lib/utils/detail-access';
import { getCapturedLeadAttribution } from '@/lib/utils/lead-attribution';

const MOBILE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What the visitor sees about the record before the detail page is unlocked */
export interface DetailGateSummary {
  eyebrow?: string | null;
  title: string;
  imageUrl?: string | null;
  priceLabel: string;
  chips: string[];
}

export interface DetailAccessGateProps {
  targetType: DetailTargetType;
  targetId: number;
  summary: DetailGateSummary;
  onUnlock?: (grant: DetailAccessGrant) => void;
  isModal?: boolean;
  onClose?: () => void;
}

interface FormValues {
  name: string;
  mobile: string;
  state: string;
  city: string;
  email: string;
  address: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = { name: '', mobile: '', state: '', city: '', email: '', address: '' };

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-white/10';

const labelClass = 'text-zinc-700 dark:text-zinc-300 mb-1.5 block text-[11px] font-bold tracking-wider uppercase';

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!MOBILE_RE.test(values.mobile.replace(/\s/g, ''))) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (!values.state) errors.state = 'Select your state';
  if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}

function submitErrorMessage(error: unknown): string {
  const fallback = 'Could not submit your details. Please try again.';
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as { message?: string; error?: { message?: string }[] } | undefined;
  return data?.error?.[0]?.message || data?.message || fallback;
}

export function DetailAccessGate({
  targetType,
  targetId,
  summary,
  onUnlock,
  isModal = true,
  onClose,
}: DetailAccessGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Pre-warm high-accuracy GPS in the background so coordinates are already cached when user clicks submit
    captureLocation(6000).then((coords) => {
      if (coords) {
        setDetectedCoords(coords);
      }
    });
  }, []);

  useEffect(() => {
    if (isModal && mounted) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModal, mounted]);

  const update = (field: keyof FormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push(targetType === 'TRACTOR' ? '/tractors' : '/implements');
    }
  };

  const handleDetectLocation = async () => {
    setLocating(true);
    setLocationStatus('Pinpointing GPS location...');
    try {
      const coords = await captureLocation(8000);
      if (coords) {
        setDetectedCoords(coords);
        setLocationStatus(`GPS Pinpointed (±${coords.accuracy ?? 10}m)`);
        // Reverse geocode to auto-fill State and City if empty
        const geo = await reverseGeocodeCoords(coords.latitude, coords.longitude);
        if (geo) {
          setValues((prev) => ({
            ...prev,
            state: prev.state || geo.state || prev.state,
            city: prev.city || geo.city || prev.city,
            address: prev.address || geo.address || prev.address,
          }));
        }
      } else {
        setLocationStatus('GPS unavailable. Selected State and City will be used.');
      }
    } catch {
      setLocationStatus(null);
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const found = validate(values);
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // 1. Use pre-warmed GPS coordinates if available, or attempt high-accuracy GPS capture
      let coords = detectedCoords;
      if (!coords) {
        coords = await captureLocation(4000);
      }

      // 2. If browser GPS was unavailable or blocked, fallback to geocoding selected City & State
      if (!coords && (values.city || values.state)) {
        coords = await geocodeLocationText(values.city, values.state);
      }

      const attribution = getCapturedLeadAttribution({
        pagePath: pathname,
        defaultPageLabel: targetType === 'TRACTOR' ? 'Tractor Detail Page' : 'Implement Detail Page',
        defaultCampaign: 'Detail Access Gate (Specs & Features Unlock)',
      });

      const payload: DetailAccessLeadInput = {
        targetType,
        targetId,
        name: values.name.trim(),
        mobile: values.mobile.replace(/\s/g, ''),
        state: values.state,
        city: values.city.trim() || undefined,
        email: values.email.trim() || undefined,
        address: values.address.trim() || undefined,
        sourcePage: attribution.sourcePage,
        sourceCampaign: attribution.sourceCampaign,
      };

      if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
        payload.latitude = coords.latitude;
        payload.longitude = coords.longitude;
      }

      const res = await leadAPI.createDetailAccessLead(payload);
      const grant = res.data.detailAccess;

      saveDetailAccess(grant, targetType, targetId);
      onUnlock?.(grant);

      const targetUrl = targetType === 'TRACTOR' ? `/tractors/${targetId}` : `/implements/${targetId}`;
      if (pathname !== targetUrl) {
        router.push(targetUrl);
      }
      onClose?.();
    } catch (error) {
      setSubmitError(submitErrorMessage(error));
      setSubmitting(false);
    }
  };

  const kindLabel = targetType === 'TRACTOR' ? 'tractor' : 'implement';
  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;

  const dialogContent = (
    <div className="flex w-full flex-col lg:flex-row items-stretch">
      {/* ========================================================
          MOBILE PRODUCT HEADER (< lg): COMPACT & SLEEK
          (Prevents huge stacked card pushing the form off-screen)
          ======================================================== */}
      <div className="flex items-center gap-3.5 border-b border-black/5 dark:border-white/10 bg-stone-50/80 dark:bg-white/[0.03] p-4 pr-12 lg:hidden">
        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-black/5 dark:bg-black/40 dark:border-white/10">
          {summary.imageUrl ? (
            <img src={summary.imageUrl} alt={summary.title} className="h-full w-full object-contain" loading="lazy" />
          ) : (
            <Lock size={20} className="text-[var(--color-brand-green)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {summary.eyebrow && (
            <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--color-brand-green)] line-clamp-1">
              {summary.eyebrow}
            </span>
          )}
          <h3 className="text-base font-black text-foreground tracking-tight truncate">
            {summary.title}
          </h3>
          <p className="text-xs font-black text-[var(--color-brand-green)]">
            {summary.priceLabel}
          </p>
          {summary.chips.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              {summary.chips.slice(0, 2).map((chip) => (
                <span key={chip} className="text-[9px] font-bold text-muted bg-foreground/5 px-1.5 py-0.5 rounded-md">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          DESKTOP PRODUCT SHOWCASE (lg:): SEAMLESS INTEGRATED PANEL
          (No nested card-in-card; integrated into left half of dialog)
          ======================================================== */}
      <div className="hidden lg:flex lg:w-[42%] shrink-0 flex-col justify-between border-r border-black/5 dark:border-white/10 bg-stone-50/90 dark:bg-white/[0.02] p-6 sm:p-7 relative overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-[var(--color-brand-green)]/10 blur-3xl dark:bg-[var(--color-brand-green)]/15" />

        <div className="flex flex-col gap-4">
          {/* Product Image sitting naturally without double borders */}
          <div className="flex h-44 items-center justify-center p-2">
            {summary.imageUrl ? (
              <img src={summary.imageUrl} alt={summary.title} className="h-full w-full object-contain drop-shadow-md" loading="lazy" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--color-brand-green)]">
                <Lock size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Gated Details</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {summary.eyebrow && (
              <span className="text-[var(--color-brand-green)] dark:text-lime-400 text-xs font-black tracking-[0.2em] uppercase">
                {summary.eyebrow}
              </span>
            )}
            <h1 className="text-foreground text-2xl font-black tracking-tight leading-tight">
              {summary.title}
            </h1>
            <p className="text-[var(--color-brand-green)] dark:text-lime-400 text-lg font-black">
              {summary.priceLabel}
            </p>
          </div>

          {summary.chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {summary.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full px-2.5 py-1 text-xs font-bold border border-black/5 bg-white text-zinc-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Benefits checklist */}
        <div className="mt-4 flex flex-col gap-2 border-t border-black/5 dark:border-white/10 pt-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[var(--color-brand-green)] dark:text-lime-400 shrink-0" />
            <span>Complete engine, transmission & hydraulic specs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[var(--color-brand-green)] dark:text-lime-400 shrink-0" />
            <span>Exact on-road state pricing & estimated EMIs</span>
          </div>
          <div className="flex items-center gap-2">
            <Download size={14} className="text-[var(--color-brand-green)] dark:text-lime-400 shrink-0" />
            <span>Direct official brochure downloads</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          LEAD FORM PANEL (Desktop & Mobile): CLEAN & ACCESSIBLE
          ======================================================== */}
      <div className="flex-1 flex flex-col justify-between p-5 sm:p-7 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-green)] dark:bg-lime-400/10 dark:border-lime-400/20 dark:text-lime-400">
              <Sparkles size={11} /> Quick Unlock
            </span>
          </div>
          <h2 className="text-foreground text-xl sm:text-2xl font-black tracking-tight mt-1">
            Unlock Full Details
          </h2>
          <p className="text-muted text-xs sm:text-sm leading-relaxed">
            Share your details to view complete specifications, on-road prices and brochures for this {kindLabel}.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3.5">
          <div>
            <label htmlFor="lead-name" className={labelClass}>
              Full name *
            </label>
            <input
              id="lead-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Ramesh Kumar"
              value={values.name}
              onChange={update('name')}
              aria-invalid={Boolean(errors.name)}
              className={inputClass}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="lead-mobile" className={labelClass}>
              Mobile number *
            </label>
            <input
              id="lead-mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={13}
              placeholder="10-digit mobile number"
              value={values.mobile}
              onChange={update('mobile')}
              aria-invalid={Boolean(errors.mobile)}
              className={inputClass}
            />
            {errors.mobile && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.mobile}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="lead-state" className={labelClass}>
                State *
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:underline cursor-pointer"
                title="Detect precise GPS location for accurate pricing"
              >
                {locating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <MapPin size={12} />
                )}
                <span>{detectedCoords ? 'GPS Pinpointed ✓' : 'Detect Location (GPS)'}</span>
              </button>
            </div>
            {locationStatus && (
              <p className="mb-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {locationStatus}
              </p>
            )}
            <select
              id="lead-state"
              name="state"
              value={values.state}
              onChange={update('state')}
              aria-invalid={Boolean(errors.state)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="" className="bg-background text-foreground">Select your state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state} className="bg-background text-foreground">
                  {state}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="lead-city" className={labelClass}>
              City <span className="normal-case tracking-normal text-muted">(optional)</span>
            </label>
            <input
              id="lead-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              placeholder="e.g. Pune"
              value={values.city}
              onChange={update('city')}
              className={inputClass}
            />
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1 py-3 text-xs sm:text-sm font-black rounded-xl bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-dark)] text-white shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-98 cursor-pointer uppercase tracking-wider"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Unlocking Details...</span>
              </>
            ) : (
              'Unlock Full Details'
            )}
          </button>

          <p className="text-muted flex items-center justify-center gap-1.5 text-center text-[10.5px] font-medium">
            <ShieldCheck size={13} className="text-[var(--color-brand-green)] shrink-0" />
            <span>100% verified specs & privacy protected.</span>
          </p>
        </form>

        {/* Logged in users bypass the form completely */}
        <div className="border-t border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5 pt-3.5 mt-3 text-xs">
          <span className="text-muted">Already have an account?</span>
          <Link
            href={loginHref}
            className="font-bold text-[var(--color-brand-green)] hover:underline"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );

  // Centric PopUp with Frosted Backdrop Overlay
  if (isModal) {
    if (!mounted) return null;

    const modalElement = (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto p-3.5 sm:p-6 md:p-8 animate-in fade-in duration-300"
      >
        {/* Frosted glass backdrop overlay covering full viewport including navbar */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all dark:bg-black/85 dark:backdrop-blur-2xl"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Atmospheric ambient glows */}
        <div className="pointer-events-none fixed top-1/4 left-1/4 -z-10 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/10 blur-[140px] dark:bg-[var(--color-brand-green)]/20" />
        <div className="pointer-events-none fixed bottom-1/4 right-1/4 -z-10 h-[24rem] w-[24rem] translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--color-brand-orange)]/10 blur-[140px] dark:bg-[var(--color-brand-orange)]/15" />

        {/* Single Seamless Centric Modal Dialog (No nested containers) */}
        <div className="relative z-10 w-full max-w-3xl max-h-[92vh] my-auto overflow-hidden rounded-[24px] sm:rounded-[32px] border border-black/10 bg-white shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-200 dark:border-white/15 dark:bg-[#0c100e] flex flex-col">
          {/* Floating Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="absolute top-3 right-3 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-zinc-600 transition-all hover:scale-105 active:scale-95 cursor-pointer dark:bg-white/10 dark:hover:bg-white/20 dark:text-zinc-200"
          >
            <X size={18} />
          </button>
          {dialogContent}
        </div>
      </div>
    );

    return createPortal(modalElement, document.body);
  }

  return (
    <div className="w-full rounded-[24px] sm:rounded-[32px] border border-black/10 bg-white overflow-hidden shadow-xl dark:border-white/15 dark:bg-[#0c100e]">
      {dialogContent}
    </div>
  );
}

export function DetailAccessModal(props: DetailAccessGateProps) {
  return <DetailAccessGate {...props} isModal={true} />;
}
