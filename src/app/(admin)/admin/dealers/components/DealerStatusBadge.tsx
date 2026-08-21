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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
          VERIFIED
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock size={13} className="shrink-0 text-amber-400" />
          PENDING
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle size={13} className="shrink-0 text-rose-400" />
          REJECTED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-gray-500/10 text-gray-400 border border-gray-500/20">
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
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm">
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${
        isActive
          ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
          : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/40'
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
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide border ${getStyle(
        dealerType
      )}`}
    >
      {getLabel(dealerType)}
    </span>
  );
}
