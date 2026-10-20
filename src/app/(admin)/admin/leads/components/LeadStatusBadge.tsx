import React from 'react';
import {
  Sparkles,
  PhoneCall,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
  Wrench,
  Car,
  Compass,
  ArrowRightLeft,
} from 'lucide-react';
import { LeadStatus, LeadType } from '@/lib/api/leads';

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  switch (status) {
    case 'NEW':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-300 dark:border-sky-500/20 bg-sky-100 dark:bg-sky-500/10 px-2.5 py-1 text-[11px] font-black text-sky-800 dark:text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400 animate-pulse" />
          New
        </span>
      );
    case 'ATTEMPTED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-300 dark:border-purple-500/20 bg-purple-100 dark:bg-purple-500/10 px-2.5 py-1 text-[11px] font-black text-purple-900 dark:text-purple-300">
          <Clock size={11} className="text-purple-700 dark:text-purple-400" />
          Attempted
        </span>
      );
    case 'CONTACTED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300 dark:border-indigo-500/20 bg-indigo-100 dark:bg-indigo-500/10 px-2.5 py-1 text-[11px] font-black text-indigo-900 dark:text-indigo-300">
          <PhoneCall size={11} className="text-indigo-700 dark:text-indigo-400" />
          Contacted
        </span>
      );
    case 'QUALIFIED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-teal-300 dark:border-teal-500/20 bg-teal-100 dark:bg-teal-500/10 px-2.5 py-1 text-[11px] font-black text-teal-900 dark:text-teal-300">
          <Sparkles size={11} className="text-teal-700 dark:text-teal-400" />
          Qualified
        </span>
      );
    case 'INTERESTED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-900 dark:text-emerald-300">
          <CheckCircle2 size={11} className="text-emerald-700 dark:text-emerald-400" />
          Interested
        </span>
      );
    case 'DEALER_ASSIGNED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 dark:border-amber-500/20 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 text-[11px] font-black text-amber-900 dark:text-amber-300">
          <Compass size={11} className="text-amber-800 dark:text-amber-400" />
          Dealer Assigned
        </span>
      );
    case 'CONVERTED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-lime-400 dark:border-lime-500/30 bg-lime-100 dark:bg-lime-500/15 px-2.5 py-1 text-[11px] font-black text-lime-900 dark:text-lime-300 shadow-sm shadow-lime-950/10">
          <CheckCircle2 size={11} className="text-lime-700 dark:text-lime-400" />
          Converted
        </span>
      );
    case 'LOST':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 dark:border-rose-500/20 bg-rose-100 dark:bg-rose-500/10 px-2.5 py-1 text-[11px] font-black text-rose-900 dark:text-rose-400">
          <XCircle size={11} className="text-rose-700 dark:text-rose-400" />
          Lost
        </span>
      );
    case 'SPAM':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-600/30 bg-zinc-200/80 dark:bg-zinc-800/40 px-2.5 py-1 text-[11px] font-black text-zinc-800 dark:text-zinc-300">
          <AlertCircle size={11} className="text-zinc-700 dark:text-zinc-400" />
          Spam
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/5 px-2.5 py-1 text-[11px] font-black text-foreground/80">
          {status}
        </span>
      );
  }
}

export function LeadTypeBadge({ type }: { type: LeadType }) {
  const getIcon = () => {
    switch (type) {
      case 'GET_PRICE':
        return <FileSpreadsheet size={11} className="text-emerald-700 dark:text-emerald-400" />;
      case 'EMI_ENQUIRY':
        return <Calculator size={11} className="text-amber-700 dark:text-amber-400" />;
      case 'LOAN':
        return <ShieldCheck size={11} className="text-blue-700 dark:text-blue-400" />;
      case 'INSURANCE':
        return <ShieldCheck size={11} className="text-purple-700 dark:text-purple-400" />;
      case 'USED_ENQUIRY':
        return <Car size={11} className="text-orange-700 dark:text-orange-400" />;
      case 'SELL':
        return <ArrowRightLeft size={11} className="text-lime-700 dark:text-lime-400" />;
      case 'SERVICE':
        return <Wrench size={11} className="text-cyan-700 dark:text-cyan-400" />;
      case 'TEST_DRIVE':
        return <Car size={11} className="text-pink-700 dark:text-pink-400" />;
      default:
        return <HelpCircle size={11} className="text-foreground/60" />;
    }
  };

  const formatTypeName = (raw: string) => {
    return raw
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-foreground">
      {getIcon()}
      <span>{formatTypeName(type)}</span>
    </span>
  );
}

export function IntentScoreBadge({ score }: { score?: number | null }) {
  const s = score ?? 0;
  let colorClasses = 'text-zinc-800 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-500/10 border-zinc-300 dark:border-zinc-500/20';
  let barColor = 'bg-zinc-500';

  if (s >= 75) {
    colorClasses = 'text-rose-900 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/25';
    barColor = 'bg-rose-500';
  } else if (s >= 50) {
    colorClasses = 'text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/25';
    barColor = 'bg-amber-500';
  } else if (s >= 25) {
    colorClasses = 'text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/25';
    barColor = 'bg-emerald-500';
  }

  return (
    <div className="flex flex-col gap-1 min-w-[70px]">
      <div className="flex items-center justify-between gap-1">
        <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-black border ${colorClasses}`}>
          {s >= 50 && <Flame size={10} className="shrink-0" />}
          {s}%
        </span>
        <span className="text-[9px] font-bold text-muted uppercase">Intent</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${Math.min(s, 100)}%` }} />
      </div>
    </div>
  );
}

export function FollowupBadge({
  date,
  status,
}: {
  date?: string | null;
  status: LeadStatus;
}) {
  if (!date) {
    return <span className="text-[11px] text-muted italic font-medium">None scheduled</span>;
  }

  if (status === 'CONVERTED' || status === 'LOST' || status === 'SPAM') {
    return (
      <span className="text-[11px] text-muted font-medium">
        {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
      </span>
    );
  }

  const followupTime = new Date(date).getTime();
  const now = Date.now();
  const isOverdue = followupTime < now;
  const isToday =
    new Date(date).toDateString() === new Date().toDateString();

  const formatted = new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isOverdue) {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 dark:text-rose-400">
          <AlertCircle size={12} className="shrink-0 text-rose-700 dark:text-rose-400" />
          Overdue
        </span>
        <span className="text-[10px] text-rose-800 dark:text-rose-400/90 font-bold">{formatted}</span>
      </div>
    );
  }

  if (isToday) {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 dark:text-amber-400">
          <Clock size={12} className="shrink-0 text-amber-800 dark:text-amber-400" />
          Due Today
        </span>
        <span className="text-[10px] text-amber-900 dark:text-amber-300 font-bold">{formatted}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-[11px]">
      <span className="font-bold text-foreground">{formatted}</span>
      <span className="text-[10px] text-muted">Upcoming</span>
    </div>
  );
}
