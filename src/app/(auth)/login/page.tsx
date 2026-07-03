'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import { useAuth } from '@/store/AuthContext';
import { Loader2, Phone, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
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

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await authAPI.requestOtp(mobile);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="spatial-panel p-8 md:p-12 max-w-md w-full relative overflow-hidden flex flex-col items-center">
        {/* Decorative blur */}
        <div className="absolute top-[-20%] right-[-10%] h-[200px] w-[200px] rounded-full bg-[var(--color-brand-green)]/20 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-20%] h-[150px] w-[150px] rounded-full bg-[var(--color-spatial-accent-blue)]/15 blur-[50px] pointer-events-none" />
        
        {/* Logo or Icon */}
        <div className="h-16 w-16 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          {step === 1 ? <Phone size={32} /> : <ShieldCheck size={32} />}
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 text-center tracking-tight">
          {step === 1 ? 'Welcome to TractorDost' : 'Verify your number'}
        </h1>
        <p className="text-muted text-sm md:text-base text-center mb-8 font-medium">
          {step === 1 
            ? 'Enter your mobile number to log in or create a new account.' 
            : `We've sent an OTP to +91 ${mobile}`}
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="w-full flex flex-col gap-4 z-10">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-lg select-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full h-14 bg-foreground/5 border border-foreground/10 rounded-2xl pl-14 pr-4 text-lg font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || mobile.length !== 10}
              className="spatial-button w-full h-14 rounded-2xl text-base mt-2 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-4 z-10">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-character OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="w-full h-14 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 text-center text-2xl tracking-[0.5em] font-black text-foreground placeholder:text-muted placeholder:tracking-normal placeholder:text-base focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="spatial-button w-full h-14 rounded-2xl text-base mt-2 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Verify & Login'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
              }}
              disabled={isLoading}
              className="mt-2 text-sm text-muted hover:text-foreground font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} /> Back to mobile number
            </button>
          </form>
        )}
        
        <div className="mt-8 text-xs text-muted font-medium text-center z-10">
          By continuing, you agree to TractorDost's{' '}
          <Link href="/terms" className="text-foreground hover:underline">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="text-foreground hover:underline">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
