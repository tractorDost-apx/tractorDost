'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import { useAuth } from '@/store/AuthContext';
import { ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Star, CheckCircle2, Lock } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const roleName = user?.role?.name?.toUpperCase();
      const isDealer =
        roleName === 'DEALER' ||
        user?.sellerType?.toLowerCase() === 'dealer' ||
        Boolean(user?.dealer);
      const isAdmin = roleName === 'ADMIN' || roleName === 'SUPER_ADMIN';

      if (callbackUrl && callbackUrl !== '/' && callbackUrl !== '/login') {
        window.location.href = callbackUrl;
      } else if (isAdmin) {
        window.location.href = '/admin/dashboard';
      } else if (isDealer) {
        window.location.href = '/dealer/dashboard';
      } else if (roleName === 'AGENT') {
        window.location.href = '/agent/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    }
  }, [authLoading, isAuthenticated, user, callbackUrl]);

  React.useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authAPI.requestOtp(mobile);
      const devOtp = res?.data?.devOtp || res?.devOtp;
      if (devOtp) {
        setOtp(devOtp);
        setDevOtpHint(devOtp);
      }
      setStep(2);
      setTimeLeft(60);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-character OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authAPI.verifyOtp(otp);
      if (res?.data?.accessToken && typeof window !== 'undefined') {
        try {
          localStorage.setItem('accessToken', res.data.accessToken);
          document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=900; SameSite=Lax`;
        } catch (_) {}
      }
      const loggedInUser = await refreshUser();
      const targetUser = loggedInUser || user;

      let targetPath = callbackUrl && callbackUrl !== '/' ? callbackUrl : '';

      if (!targetPath && targetUser?.role?.name) {
        switch (targetUser.role.name) {
          case 'ADMIN':
            targetPath = '/admin/dashboard';
            break;
          case 'DEALER':
            targetPath = '/dealer/dashboard';
            break;
          case 'CUSTOMER':
            targetPath = '/dashboard';
            break;
          default:
            targetPath = '/dashboard';
        }
      }

      window.location.href = targetPath || '/dashboard';
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const res = await authAPI.requestOtp(mobile);
      const devOtp = res?.data?.devOtp || res?.devOtp;
      if (devOtp) {
        setOtp(devOtp);
        setDevOtpHint(devOtp);
      }
      setSuccess('OTP resent successfully!');
      setTimeLeft(60);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex w-full items-center justify-center py-2 sm:py-6">
      {/* Ambient Atmospheric Glows */}
      <div className="pointer-events-none fixed top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-[var(--color-brand-green)]/10 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-[var(--color-brand-orange)]/10 blur-[130px]" />

      {/* Main Split Authentication Card (Matches reference design) */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[24px] sm:rounded-[32px] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c100e] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        
        {/* ========================================================
            LEFT COLUMN (Desktop Only): HERO PHOTOGRAPHY & BRAND STORY
            ======================================================== */}
        <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between overflow-hidden bg-stone-900 p-8 text-white select-none">
          {/* Background Photo with subtle zoom */}
          <img
            src="/images/hero/slide-1.jpg"
            alt="TractorDost Agricultural Showcase"
            className="absolute inset-0 h-full w-full object-cover object-center filter brightness-95"
            loading="eager"
          />
          {/* Rich Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Top Branding Pill */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md px-3 py-1.5 border border-white/20 shadow-sm">
              <img
                src="/TD%20White.png"
                alt="TractorDost"
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-orange)]/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              <Sparkles size={11} /> Official Portal
            </span>
          </div>

          {/* Bottom Trust & Testimonial Section */}
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-current" />
              ))}
              <span className="ml-1 text-xs font-bold text-white/90">4.9/5 from 50,000+ Farmers</span>
            </div>

            <p className="text-sm font-medium leading-relaxed text-white/95">
              “Bharat&apos;s most trusted ecosystem for verified tractors, authorized dealers & seamless farm financing.”
            </p>

            <div className="flex flex-col gap-1.5 border-t border-white/15 pt-3 text-xs text-white/80 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[var(--color-brand-green)] shrink-0" />
                <span>100% Verified Ex-Showroom & On-Road Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[var(--color-brand-green)] shrink-0" />
                <span>Direct Authorized OEM Dealership Network</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[var(--color-brand-green)] shrink-0" />
                <span>Instant Pre-Approved Tractor Loans & EMIs</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (Desktop & Mobile): CLEAN LOGIN FORM
            (Matches the user reference layout: Welcome Back, details,
            clean inputs, remember me, forgot, and orange Sign In button)
            ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Mobile-only Top Brand Header */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2">
                <img
                  src="/TD%20Black.png"
                  alt="TractorDost Logo"
                  className="logo-light h-7 w-auto object-contain"
                />
                <img
                  src="/TD%20White.png"
                  alt="TractorDost Logo"
                  className="logo-dark h-7 w-auto object-contain"
                />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                Secure Sign In
              </span>
            </div>

            {/* Header Titles */}
            <div className="flex flex-col gap-1 mb-6 sm:mb-8">
              <h1 className="text-foreground text-2xl sm:text-3xl font-black tracking-tight">
                {step === 1 ? 'Welcome Back' : 'Verify Identity'}
              </h1>
              <p className="text-muted text-xs sm:text-sm font-medium">
                {step === 1
                  ? 'Please enter your details to sign in.'
                  : `Enter the 6-character OTP sent to +91 ${mobile}`}
              </p>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="animate-in fade-in slide-in-from-bottom-2 mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs sm:text-sm font-bold text-red-500">
                <ShieldCheck size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="animate-in fade-in slide-in-from-bottom-2 mb-4 flex items-center gap-2 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3 text-xs sm:text-sm font-bold text-[var(--color-brand-green)]">
                <ShieldCheck size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* STEP 1: MOBILE NUMBER INPUT */}
            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="flex flex-col gap-4" noValidate>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="mobile" className="text-[11px] font-bold tracking-wider uppercase text-zinc-700 dark:text-zinc-300">
                      Mobile Number
                    </label>
                    <span className="text-[11px] font-bold text-[var(--color-brand-orange)]">
                      Instant OTP
                    </span>
                  </div>

                  <div className="group relative flex items-center">
                    <span className="absolute left-3.5 flex items-center text-xs font-bold text-muted bg-foreground/5 px-2 py-1 rounded-md select-none border border-black/5 dark:border-white/5">
                      +91
                    </span>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-white/5 pl-16 pr-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-foreground placeholder:text-muted/60 transition-colors focus:border-[var(--color-brand-orange)] focus:bg-white dark:focus:bg-white/10 focus:outline-none"
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Remember Me & Help Row (Matches reference design) */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 dark:border-white/20 text-[var(--color-brand-orange)] focus:ring-[var(--color-brand-orange)] cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <Link
                    href="/contact"
                    className="text-xs font-bold text-[var(--color-brand-orange)] hover:underline"
                  >
                    Forgot / Help?
                  </Link>
                </div>

                {/* Sign In CTA Button (Matches vibrant orange button in reference design) */}
                <button
                  type="submit"
                  disabled={isLoading || mobile.length !== 10}
                  className="mt-2 flex h-12 sm:h-13 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-orange)] text-sm sm:text-base font-black text-white shadow-lg shadow-[var(--color-brand-orange)]/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isLoading ? (
                    <TractorLoader size={24} />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: OTP VERIFICATION */
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4" noValidate>
                {devOtpHint && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 py-2 px-3 text-xs font-bold text-[var(--color-brand-green)]">
                    <span>Dev OTP:</span>
                    <span className="font-mono text-sm tracking-widest bg-[var(--color-brand-green)]/20 px-2 py-0.5 rounded-md font-black">
                      {devOtpHint}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="otp" className="text-[11px] font-bold tracking-wider uppercase text-zinc-700 dark:text-zinc-300">
                      Enter 6-Digit OTP
                    </label>
                    {timeLeft > 0 ? (
                      <span className="text-[11px] font-bold text-muted">
                        Resend in <span className="text-[var(--color-brand-orange)] font-black">{timeLeft}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading || isResending}
                        className="text-[11px] font-bold text-[var(--color-brand-orange)] hover:underline cursor-pointer"
                      >
                        {isResending ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>

                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-white/5 px-4 py-3 sm:py-3.5 text-center text-xl sm:text-2xl font-black tracking-[0.4em] text-foreground placeholder:tracking-widest transition-colors focus:border-[var(--color-brand-orange)] focus:bg-white dark:focus:bg-white/10 focus:outline-none"
                    required
                    disabled={isLoading || isResending}
                    autoFocus
                  />
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading || isResending || otp.length !== 6}
                  className="mt-2 flex h-12 sm:h-13 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-orange)] text-sm sm:text-base font-black text-white shadow-lg shadow-[var(--color-brand-orange)]/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isLoading ? <TractorLoader size={24} /> : 'Verify & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setSuccess('');
                  }}
                  disabled={isLoading || isResending}
                  className="text-muted mx-auto mt-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft size={14} /> Change mobile number ({mobile})
                </button>
              </form>
            )}
          </div>

          {/* Footer Terms & Help */}
          <div className="mt-8 border-t border-black/5 dark:border-white/10 pt-4 text-center">
            <p className="text-[11px] text-muted leading-relaxed font-medium">
              By signing in, you agree to TractorDost&apos;s{' '}
              <Link href="/terms" className="font-bold text-foreground hover:text-[var(--color-brand-orange)] underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-bold text-foreground hover:text-[var(--color-brand-orange)] underline underline-offset-2">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
