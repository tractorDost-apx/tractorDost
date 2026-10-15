'use client';

import React from 'react';
import { DetailAccessGate, DetailGateSummary } from './detail-access-gate';
import type { DetailAccessGrant, DetailTargetType } from '@/lib/api/leads';

export interface GetPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: DetailTargetType;
  targetId: number;
  summary: DetailGateSummary;
  onUnlock?: (grant: DetailAccessGrant) => void;
}

export function GetPriceModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  summary,
  onUnlock,
}: GetPriceModalProps) {
  if (!isOpen) return null;

  return (
    <DetailAccessGate
      targetType={targetType}
      targetId={targetId}
      summary={summary}
      onUnlock={(grant) => {
        onUnlock?.(grant);
        onClose();
      }}
      isModal={true}
      onClose={onClose}
    />
  );
}

export default GetPriceModal;
export const placeholder = 'get-price-modal.tsx';
