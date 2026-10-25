'use client';

import { useState } from 'react';
import { leadAPI, CreateLeadInput, DetailAccessLeadInput } from '@/lib/api/leads';

export function useSubmitLead() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLead = async (data: CreateLeadInput): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);
    try {
      const res = await leadAPI.createLead(data);
      if (res.success) {
        setIsSuccess(true);
        return true;
      } else {
        setError((res as any).message || 'Failed to submit enquiry');
        return false;
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Error submitting enquiry');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDetailAccess = async (data: DetailAccessLeadInput): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);
    try {
      const res = await leadAPI.submitDetailAccess(data);
      if (res.success) {
        setIsSuccess(true);
        return true;
      } else {
        setError((res as any).message || 'Failed to unlock details');
        return false;
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Error unlocking details');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  };

  return { submitLead, submitDetailAccess, isSubmitting, isSuccess, error, reset };
}
