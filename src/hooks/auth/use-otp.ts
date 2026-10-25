'use client';

import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api/auth';

export function useOtp(initialMobile = '') {
  const [mobile, setMobile] = useState(initialMobile);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = useCallback(
    async (mobileNumber?: string) => {
      const target = mobileNumber || mobile;
      if (!target || !/^[6-9]\d{9}$/.test(target)) {
        setError('Please enter a valid 10-digit mobile number');
        return false;
      }
      setError(null);
      setIsSending(true);
      try {
        const res = await authAPI.sendOtp({ mobile: target });
        if (res.success) {
          setTimer(60);
          return true;
        } else {
          setError(res.message || 'Failed to send OTP');
          return false;
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Network error occurred');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [mobile]
  );

  const verifyOtp = useCallback(
    async (code?: string) => {
      const targetOtp = code || otp;
      if (!targetOtp || targetOtp.length < 4) {
        setError('Enter a valid OTP');
        return false;
      }
      setError(null);
      setIsVerifying(true);
      try {
        const res = await authAPI.verifyOtp({ mobile, otp: targetOtp });
        if (res.success) {
          return true;
        } else {
          setError(res.message || 'Invalid or expired OTP');
          return false;
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Verification failed');
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [mobile, otp]
  );

  return {
    mobile,
    setMobile,
    otp,
    setOtp,
    timer,
    canResend: timer === 0,
    isSending,
    isVerifying,
    error,
    sendOtp,
    verifyOtp,
  };
}
