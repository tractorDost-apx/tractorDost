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
  const { refreshUser } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);

  React.useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

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
      await authAPI.requestOtp(mobile);
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
      await authAPI.verifyOtp(otp);
      const user = await refreshUser(); // Fetch user session via context
      
      let targetPath = callbackUrl !== '/' ? callbackUrl : null;
      
      if (!targetPath && user?.role?.name) {
        switch (user.role.name) {
          case 'ADMIN':
          case 'SUPER_ADMIN':
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
      
      router.push(targetPath || '/dashboard');
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
      await authAPI.requestOtp(mobile);
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
    <div className="flex min-h-[85vh] items-center justify-center p-4 relative w-full">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-brand-green)]/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="bg-[var(--card-bg)] backdrop-blur-3xl p-10 md:p-12 max-w-[440px] w-full relative overflow-hidden flex flex-col items-center rounded-3xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] z-10 transition-all duration-500">
        
        {/* Inner Card glow */}
        <div className="absolute top-[-20%] right-[-10%] h-[250px] w-[250px] rounded-full bg-[var(--color-brand-green)]/10 blur-[60px] pointer-events-none" />
        
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 relative z-10">
          <div className="p-4 bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] shadow-sm backdrop-blur-md">
            <img src="/TD%20Black.png" alt="TractorDost Logo" className="h-12 w-auto logo-light object-contain" />
            <img src="/TD%20White.png" alt="TractorDost Logo" className="h-12 w-auto logo-dark object-contain" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 text-center tracking-tight relative z-10">
          {step === 1 ? 'Welcome Back' : 'Verify Identity'}
        </h1>
        <p className="text-muted text-sm md:text-base text-center mb-8 font-medium relative z-10 max-w-[300px]">
          {step === 1 
            ? 'Log in or create a new account to explore India\'s top tractors.' 
            : `We've sent a secure OTP to +91 ${mobile}`}
        </p>

        {error && (
          <div className="w-full p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl font-bold text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <ShieldCheck size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="w-full p-4 mb-6 bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] text-sm rounded-2xl font-bold text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <ShieldCheck size={16} /> {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="w-full flex flex-col gap-5 z-10 relative">
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold text-lg select-none group-focus-within:text-[var(--color-brand-green)] transition-colors">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full h-14 bg-background/50 border border-[var(--border-subtle)] rounded-xl pl-16 pr-5 text-lg font-black text-foreground placeholder:text-muted/60 focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10 transition-all hover:border-foreground/20"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || mobile.length !== 10}
              className="w-full h-14 rounded-xl text-base font-black mt-2 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-brand-green)] text-white shadow-lg shadow-[var(--color-brand-green)]/20 hover:shadow-[var(--color-brand-green)]/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <TractorLoader size={28} />
              ) : (
                <>
                  Continue <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-5 z-10 relative">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="w-full h-14 bg-background/50 border border-[var(--border-subtle)] rounded-xl px-5 text-center text-2xl tracking-[0.5em] font-black text-foreground placeholder:text-muted/40 placeholder:tracking-widest focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10 transition-all hover:border-foreground/20"
                required
                disabled={isLoading || isResending}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || isResending || otp.length !== 6}
              className="w-full h-14 rounded-xl text-base font-black mt-2 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-brand-green)] text-white shadow-lg shadow-[var(--color-brand-green)]/20 hover:shadow-[var(--color-brand-green)]/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <TractorLoader size={28} />
              ) : (
                'Secure Login'
              )}
            </button>

            {timeLeft > 0 ? (
              <div className="text-center text-sm text-muted font-bold mt-2 py-2">
                Resend OTP in <span className="text-[var(--color-brand-green)] font-black">{timeLeft}s</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading || isResending}
                className="mt-2 text-sm text-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]/80 font-black flex items-center justify-center gap-2 transition-colors py-2 mx-auto disabled:opacity-50"
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
              className="mt-4 text-sm text-muted hover:text-[var(--color-brand-green)] font-bold flex items-center justify-center gap-2 transition-colors py-2"
            >
              <ArrowLeft size={16} /> Use a different number
            </button>
          </form>
        )}
        
        <div className="mt-10 text-xs text-muted/80 font-bold text-center z-10 leading-relaxed max-w-[280px]">
          By proceeding, you agree to TractorDost&apos;s<br />
          <Link href="/terms" className="text-foreground hover:text-[var(--color-brand-green)] transition-colors underline decoration-muted hover:decoration-[var(--color-brand-green)] underline-offset-4 mx-1">Terms</Link> & 
          <Link href="/privacy" className="text-foreground hover:text-[var(--color-brand-green)] transition-colors underline decoration-muted hover:decoration-[var(--color-brand-green)] underline-offset-4 mx-1">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
