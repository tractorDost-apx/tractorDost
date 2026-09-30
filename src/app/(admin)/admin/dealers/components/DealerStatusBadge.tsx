import React from 'react';
import { CheckCircle2, Clock, XCircle, Award, Power } from 'lucide-react';
import { VerificationStatus } from '@/types/models/dealer';

interface VerificationBadgeProps {
  status: VerificationStatus;
}

export function VerificationBadge({ status }: VerificationBadgeProps) {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-black tracking-wide text-emerald-400">
          <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
          VERIFIED
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black tracking-wide text-amber-400">
          <Clock size={13} className="shrink-0 text-amber-400" />
          PENDING
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-black tracking-wide text-rose-400">
          <XCircle size={13} className="shrink-0 text-rose-400" />
          REJECTED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-500/20 bg-gray-500/10 px-2.5 py-1 text-xs font-black tracking-wide text-gray-400">
          {status}
        </span>
      );
  }
}

interface CertifiedBadgeProps {
  isCertified: boolean;
}

export function CertifiedBadge({ isCertified }: CertifiedBadgeProps) {
  if (!isCertified) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-2.5 py-1 text-xs font-black tracking-wide text-amber-300 shadow-sm">
      <Award size={13} className="shrink-0 text-amber-400" />
      CERTIFIED
    </span>
  );
}

interface ActiveBadgeProps {
  isActive: boolean;
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black tracking-wider uppercase ${
        isActive
          ? 'border border-lime-400/20 bg-lime-400/10 text-lime-400'
          : 'border border-zinc-700/40 bg-zinc-700/30 text-zinc-400'
      }`}
    >
      <Power size={11} className="shrink-0" />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

interface DealerTypeBadgeProps {
  dealerType: string;
}

export function DealerTypeBadge({ dealerType }: DealerTypeBadgeProps) {
  const getLabel = (type: string) => {
    switch (type) {
      case 'BRAND_DEALER':
        return 'Brand Authorized';
      case 'MULTI_BRAND':
        return 'Multi-Brand';
      case 'USED_TRACTOR_DEALER':
        return 'Used Tractors';
      default:
        return type;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'BRAND_DEALER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'MULTI_BRAND':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'USED_TRACTOR_DEALER':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wide ${getStyle(
        dealerType
      )}`}
    >
      {getLabel(dealerType)}
    </span>
  );
}
