'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { Lock, ShieldCheck, X, Loader2, CheckCircle2, Download, Sparkles } from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { INDIAN_STATES } from '@/lib/constants/indian-states';
import { leadAPI, type DetailAccessGrant, type DetailTargetType, type DetailAccessLeadInput } from '@/lib/api/leads';
import { captureLocation, saveDetailAccess } from '@/lib/utils/detail-access';

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

interface Coordinates {
  latitude: number;
  longitude: number;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = { name: '', mobile: '', state: '', city: '', email: '', address: '' };

const inputClass =
  'bg-secondary/20 border border-border/50 rounded-xl px-4 py-3 text-foreground w-full focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all text-sm';

const labelClass = 'text-muted-foreground mb-2 block text-xs font-bold tracking-widest uppercase';

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
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const found = validate(values);
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // Automatically attempt to capture user's current location without blocking submission
      const coords = await captureLocation(4000);

      const payload: DetailAccessLeadInput = {
        targetType,
        targetId,
        name: values.name.trim(),
        mobile: values.mobile.replace(/\s/g, ''),
        state: values.state,
        city: values.city.trim() || undefined,
        email: values.email.trim() || undefined,
        address: values.address.trim() || undefined,
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
    <div className="grid w-full gap-6 lg:grid-cols-12 items-stretch">
      {/* Left Column: Product Teaser & Benefits */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-5 rounded-[2rem] border border-[var(--border-subtle)] bg-secondary/15 p-5 sm:p-7 relative overflow-hidden">
        {/* Ambient glow inside card */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-[var(--color-brand-green)]/15 blur-3xl" />
        
        <div className="flex flex-col gap-5">
          <div className="glass-inner flex h-48 sm:h-56 items-center justify-center overflow-hidden rounded-2xl p-4 bg-black/25 border border-white/5">
            {summary.imageUrl ? (
              <img src={summary.imageUrl} alt={summary.title} className="h-full w-full object-contain" loading="lazy" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-lime-400">
                  <Lock size={32} />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Gated Details</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {summary.eyebrow && (
              <span className="text-lime-400 text-xs font-black tracking-[0.2em] uppercase">{summary.eyebrow}</span>
            )}
            <h1 className="text-foreground text-2xl sm:text-3xl leading-tight font-black tracking-tight">{summary.title}</h1>
            <p className="text-lime-400 text-lg sm:text-xl font-black">{summary.priceLabel}</p>
          </div>

          {summary.chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summary.chips.map((chip) => (
                <span key={chip} className="glass-inner text-foreground rounded-full px-3 py-1.5 text-xs font-bold border border-white/5">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Benefits checklist */}
        <div className="mt-2 flex flex-col gap-2.5 border-t border-border/40 pt-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-lime-400 shrink-0" />
            <span>Complete engine, transmission & hydraulic specs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-lime-400 shrink-0" />
            <span>Exact on-road state pricing & estimated EMIs</span>
          </div>
          <div className="flex items-center gap-2">
            <Download size={14} className="text-lime-400 shrink-0" />
            <span>Direct official brochure downloads</span>
          </div>
        </div>
      </div>

      {/* Right Column: Lead Form */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-5 rounded-[2rem] border border-[var(--border-subtle)] bg-secondary/10 p-5 sm:p-7">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-lime-400">
              <Sparkles size={11} /> Quick Unlock
            </span>
          </div>
          <h2 className="text-foreground text-2xl font-black tracking-tight">Get the full details</h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Share your details to unlock the complete specifications, on-road prices and brochures for this {kindLabel}.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
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
            {errors.mobile && <p className="mt-1 text-xs text-red-400">{errors.mobile}</p>}
          </div>

          <div>
            <label htmlFor="lead-state" className={labelClass}>
              State *
            </label>
            <select
              id="lead-state"
              name="state"
              value={values.state}
              onChange={update('state')}
              aria-invalid={Boolean(errors.state)}
              className={inputClass}
            >
              <option value="">Select your state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state} className="bg-background text-foreground">
                  {state}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-xs text-red-400">{errors.state}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-city" className={labelClass}>
                City <span className="normal-case tracking-normal">(optional)</span>
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
            <div>
              <label htmlFor="lead-email" className={labelClass}>
                Email <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={values.email}
                onChange={update('email')}
                aria-invalid={Boolean(errors.email)}
                className={inputClass}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="lead-address" className={labelClass}>
              Address <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="lead-address"
              name="address"
              rows={2}
              maxLength={300}
              autoComplete="street-address"
              placeholder="Tehsil, Village, or Street details..."
              value={values.address}
              onChange={update('address')}
              className={`${inputClass} resize-none`}
            />
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {submitError}
            </p>
          )}

          <SpatialButton
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full py-3.5 text-base font-black rounded-xl bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/90 text-white shadow-lg shadow-[var(--color-brand-green)]/25 flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Unlocking Details...</span>
              </>
            ) : (
              'View full details'
            )}
          </SpatialButton>

          <p className="text-muted-foreground flex items-center justify-center gap-2 text-center text-[11px]">
            <ShieldCheck size={14} className="text-lime-400" />
            We use your details to contact you about this {kindLabel}.
          </p>
        </form>

        {/* Logged in users bypass the form completely */}
        <div className="border-border/40 flex flex-col gap-2 border-t pt-4">
          <p className="text-muted-foreground text-center text-xs">Have an account?</p>
          <SpatialButton variant="glass" href={loginHref} className="w-full py-2.5 text-xs font-bold">
            Login for direct access to all details
          </SpatialButton>
        </div>
      </div>
    </div>
  );

  // Centric PopUp with Foggy Backdrop Overlay
  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-300"
      >
        {/* Foggy frosted glass backdrop overlay covering full viewport */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-2xl transition-all"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Atmospheric ambient foggy glows */}
        <div className="pointer-events-none fixed top-1/4 left-1/4 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/20 blur-[140px]" />
        <div className="pointer-events-none fixed bottom-1/4 right-1/4 -z-10 h-[30rem] w-[30rem] translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--color-brand-orange)]/15 blur-[140px]" />

        {/* Centric Modal Dialog */}
        <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] border border-[var(--border-brand)] bg-[#0d120e]/95 p-5 sm:p-8 md:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(74,118,53,0.18)] backdrop-blur-3xl custom-scrollbar animate-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 absolute top-5 right-5 sm:top-7 sm:right-7 z-20 rounded-full p-2.5 transition-all hover:scale-105 active:scale-95"
          >
            <X size={18} />
          </button>
          {dialogContent}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full rounded-[2.5rem] border border-[var(--border-subtle)] p-6 sm:p-8">
      {dialogContent}
    </div>
  );
}

export function DetailAccessModal(props: DetailAccessGateProps) {
  return <DetailAccessGate {...props} isModal={true} />;
}
