'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  Copy,
  Check,
  Plus,
  Loader2,
} from 'lucide-react';
import { FAQ, FaqTargetType } from '@/lib/api/faq';

interface FaqTableProps {
  faqs: FAQ[];
  loading: boolean;
  onEdit: (faq: FAQ) => void;
  onDelete: (faq: FAQ) => void;
  onTogglePublished: (faq: FAQ) => void;
  togglingId: number | null;
  onAddNew: () => void;
}

const TARGET_TYPE_BADGES: Record<
  FaqTargetType,
  { label: string; badgeClass: string }
> = {
  GENERAL: {
    label: 'General',
    badgeClass: 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/30',
  },
  TRACTOR: {
    label: 'Tractor',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  },
  BRAND: {
    label: 'Brand',
    badgeClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  },
  LOAN: {
    label: 'Loan',
    badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  },
  BUY: {
    label: 'Buy',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  },
  SELL: {
    label: 'Sell',
    badgeClass: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  },
};

export default function FaqTable({
  faqs,
  loading,
  onEdit,
  onDelete,
  onTogglePublished,
  togglingId,
  onAddNew,
}: FaqTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedSlugId, setCopiedSlugId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const copySlug = (faq: FAQ) => {
    if (!faq.slug) return;
    navigator.clipboard.writeText(faq.slug);
    setCopiedSlugId(faq.id);
    setTimeout(() => {
      setCopiedSlugId(null);
    }, 1800);
  };

  return (
    <div className="glass-panel flex flex-col overflow-hidden rounded-2xl shadow-xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] font-black uppercase tracking-wider text-muted select-none">
            <tr>
              <th className="py-3.5 px-4 min-w-[280px]">Question</th>
              <th className="py-3.5 px-4 min-w-[120px]">Target Type</th>
              <th className="py-3.5 px-4 min-w-[130px]">Category</th>
              <th className="py-3.5 px-4 w-24 text-center">Order</th>
              <th className="py-3.5 px-4 w-32 text-center">Published</th>
              <th className="py-3.5 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2
                      size={28}
                      className="animate-spin text-[var(--color-brand-green)]"
                    />
                    <span className="text-xs font-bold text-white/70">
                      Loading FAQs...
                    </span>
                  </div>
                </td>
              </tr>
            ) : faqs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted">
                  <HelpCircle
                    size={40}
                    className="mx-auto mb-3 opacity-30 text-[var(--color-brand-green)]"
                  />
                  <p className="text-sm font-bold text-white">No FAQs found</p>
                  <p className="mt-1 text-xs max-w-sm mx-auto text-muted">
                    No FAQs matched your current filters. Try resetting the filters or create a new FAQ entry.
                  </p>
                  <button
                    onClick={onAddNew}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add New FAQ</span>
                  </button>
                </td>
              </tr>
            ) : (
              faqs.map((faq) => {
                const targetBadge =
                  TARGET_TYPE_BADGES[faq.targetType] ||
                  TARGET_TYPE_BADGES.GENERAL;
                const isExpanded = expandedId === faq.id;
                const isToggling = togglingId === faq.id;

                return (
                  <React.Fragment key={faq.id}>
                    <tr
                      className={`transition-colors hover:bg-white/[0.03] ${
                        isExpanded ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      {/* Question column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(faq.id)}
                            className="mt-0.5 text-muted hover:text-white transition-colors"
                            title={isExpanded ? 'Collapse answer' : 'Expand answer preview'}
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => toggleExpand(faq.id)}
                                className="font-bold text-white text-xs cursor-pointer hover:text-[var(--color-brand-green)] transition-colors leading-relaxed"
                              >
                                {faq.question}
                              </span>
                            </div>

                            {/* Slug and Target ID tags */}
                            <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-muted">
                              {faq.slug && (
                                <button
                                  type="button"
                                  onClick={() => copySlug(faq)}
                                  className="inline-flex items-center gap-1 font-mono text-[10px] text-white/50 hover:text-white bg-white/5 px-1.5 py-0.5 rounded transition-all"
                                  title="Click to copy slug"
                                >
                                  {copiedSlugId === faq.id ? (
                                    <>
                                      <Check size={10} className="text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={10} />
                                      <span>/{faq.slug}</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {faq.targetId !== null && (
                                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-muted">
                                  ID: #{faq.targetId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target Type column */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${targetBadge.badgeClass}`}
                        >
                          {targetBadge.label}
                        </span>
                      </td>

                      {/* Category column */}
                      <td className="py-3.5 px-4">
                        {faq.category ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/80 border border-white/5">
                            <Tag size={10} className="text-muted" />
                            {faq.category}
                          </span>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Sort Order column */}
                      <td className="py-3.5 px-4 text-center font-mono text-muted text-xs">
                        {faq.sortOrder}
                      </td>

                      {/* Published Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onTogglePublished(faq)}
                          disabled={isToggling}
                          className="group relative inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all disabled:opacity-50"
                          title={
                            faq.isPublished
                              ? 'Click to Unpublish (make draft)'
                              : 'Click to Publish'
                          }
                        >
                          {isToggling ? (
                            <Loader2
                              size={14}
                              className="animate-spin text-[var(--color-brand-green)]"
                            />
                          ) : (
                            <div
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                faq.isPublished
                                  ? 'bg-[var(--color-brand-green)]'
                                  : 'bg-zinc-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  faq.isPublished ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          )}
                          <span
                            className={
                              faq.isPublished ? 'text-emerald-400' : 'text-zinc-500'
                            }
                          >
                            {faq.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </button>
                      </td>

                      {/* Actions column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(faq)}
                            title="Edit FAQ"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-[var(--color-brand-green)] transition-all"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(faq)}
                            title="Delete FAQ"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-red-500/15 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable answer accordion row */}
                    {isExpanded && (
                      <tr className="bg-black/30 border-b border-white/5">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                              <span className="text-[11px] font-black uppercase tracking-wider text-muted">
                                Answer Content:
                              </span>
                              <span className="text-[10px] text-muted font-mono">
                                FAQ ID #{faq.id} • Created{' '}
                                {new Date(faq.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-white/90 whitespace-pre-wrap leading-relaxed font-sans">
                              {faq.answer}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
