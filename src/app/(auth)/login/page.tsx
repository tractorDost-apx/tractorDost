'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import { useAuth } from '@/store/AuthContext';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
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
      const loggedInUser = await refreshUser(); // Fetch user session via context

      const roleName = loggedInUser?.role?.name?.toUpperCase();
      const isDealer =
        roleName === 'DEALER' ||
        loggedInUser?.sellerType?.toLowerCase() === 'dealer' ||
        Boolean(loggedInUser?.dealer);
      const isAdmin = roleName === 'ADMIN' || roleName === 'SUPER_ADMIN';

      let targetPath = '';

      if (callbackUrl && callbackUrl !== '/' && callbackUrl !== '/login') {
        targetPath = callbackUrl;
      } else if (isAdmin) {
        targetPath = '/admin/dashboard';
      } else if (isDealer) {
        targetPath = '/dealer/dashboard';
      } else if (roleName === 'AGENT') {
        targetPath = '/agent/dashboard';
      } else {
        targetPath = '/dashboard';
      }

      window.location.href = targetPath;
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
    <div className="relative flex min-h-[85vh] w-full items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="animate-pulse-slow pointer-events-none absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-[var(--color-brand-green)]/10 blur-[120px]"></div>
      <div
        className="animate-pulse-slow pointer-events-none absolute right-[-10%] bottom-[-10%] h-[40vw] w-[40vw] rounded-full bg-blue-500/10 blur-[100px]"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-10 shadow-[var(--card-shadow)] backdrop-blur-3xl transition-all duration-500 hover:shadow-[var(--card-shadow-hover)] md:p-12">
        {/* Inner Card glow */}
        <div className="pointer-events-none absolute top-[-20%] right-[-10%] h-[250px] w-[250px] rounded-full bg-[var(--color-brand-green)]/10 blur-[60px]" />

        {/* Logo */}
        <div className="relative z-10 mb-8 flex items-center justify-center">
          <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-4 shadow-sm backdrop-blur-md">
            <img
              src="/TD%20Black.png"
              alt="TractorDost Logo"
              className="logo-light h-12 w-auto object-contain"
            />
            <img
              src="/TD%20White.png"
              alt="TractorDost Logo"
              className="logo-dark h-12 w-auto object-contain"
            />
          </div>
        </div>

        <h1 className="text-foreground relative z-10 mb-3 text-center text-3xl font-black tracking-tight md:text-4xl">
          {step === 1 ? 'Welcome Back' : 'Verify Identity'}
        </h1>
        <p className="text-muted relative z-10 mb-8 max-w-[300px] text-center text-sm font-medium md:text-base">
          {step === 1
            ? "Log in or create a new account to explore India's top tractors."
            : `We've sent a secure OTP to +91 ${mobile}`}
        </p>

        {error && (
          <div className="animate-in fade-in slide-in-from-bottom-2 mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-bold text-red-500">
            <ShieldCheck size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="animate-in fade-in slide-in-from-bottom-2 mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-4 text-center text-sm font-bold text-[var(--color-brand-green)]">
            <ShieldCheck size={16} /> {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="relative z-10 flex w-full flex-col gap-5">
            <div className="group relative">
              <span className="text-muted absolute top-1/2 left-5 -translate-y-1/2 text-lg font-bold transition-colors select-none group-focus-within:text-[var(--color-brand-green)]">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="bg-background/50 text-foreground placeholder:text-muted/60 hover:border-[var(--border-brand)] h-14 w-full rounded-xl border border-[var(--border-subtle)] pr-5 pl-16 text-lg font-black transition-all focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10 focus:outline-none"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || mobile.length !== 10}
              className="group mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--color-brand-green)] text-base font-black text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-[var(--color-brand-green)]/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <TractorLoader size={28} />
              ) : (
                <>
                  Continue{' '}
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1.5"
                  />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="relative z-10 flex w-full flex-col gap-5">
            {devOtpHint && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 py-2 px-4 text-xs font-bold text-[var(--color-brand-green)] animate-in fade-in">
                <span>Dev OTP:</span>
                <span className="font-mono text-sm tracking-widest bg-[var(--color-brand-green)]/20 px-2 py-0.5 rounded-md font-black">
                  {devOtpHint}
                </span>
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="bg-background/50 text-foreground placeholder:text-muted/40 hover:border-[var(--border-brand)] h-14 w-full rounded-xl border border-[var(--border-subtle)] px-5 text-center text-2xl font-black tracking-[0.5em] transition-all placeholder:tracking-widest focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10 focus:outline-none"
                required
                disabled={isLoading || isResending}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isResending || otp.length !== 6}
              className="group mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] text-base font-black text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-[var(--color-brand-green)]/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <TractorLoader size={28} /> : 'Secure Login'}
            </button>

            {timeLeft > 0 ? (
              <div className="text-muted mt-2 py-2 text-center text-sm font-bold">
                Resend OTP in{' '}
                <span className="font-black text-[var(--color-brand-green)]">{timeLeft}s</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading || isResending}
                className="mx-auto mt-2 flex items-center justify-center gap-2 py-2 text-sm font-black text-[var(--color-brand-green)] transition-colors hover:text-[var(--color-brand-green)]/80 disabled:opacity-50"
              >
                {isResending ? 'Resending OTP...' : 'Resend OTP'}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setSuccess('');
              }}
              disabled={isLoading || isResending}
              className="text-muted mt-4 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors hover:text-[var(--color-brand-green)]"
            >
              <ArrowLeft size={16} /> Use a different number
            </button>
          </form>
        )}

        <div className="text-muted/80 z-10 mt-10 max-w-[280px] text-center text-xs leading-relaxed font-bold">
          By proceeding, you agree to TractorDost&apos;s
          <br />
          <Link
            href="/terms"
            className="text-foreground decoration-muted mx-1 underline underline-offset-4 transition-colors hover:text-[var(--color-brand-green)] hover:decoration-[var(--color-brand-green)]"
          >
            Terms
          </Link>{' '}
          &
          <Link
            href="/privacy"
            className="text-foreground decoration-muted mx-1 underline underline-offset-4 transition-colors hover:text-[var(--color-brand-green)] hover:decoration-[var(--color-brand-green)]"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
