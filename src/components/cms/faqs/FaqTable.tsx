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
    badgeClass: 'bg-foreground/10 text-muted border border-[var(--border-subtle)]',
  },
  TRACTOR: {
    label: 'Tractor',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  },
  BRAND: {
    label: 'Brand',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
  },
  LOAN: {
    label: 'Loan',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  },
  BUY: {
    label: 'Buy',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30',
  },
  SELL: {
    label: 'Sell',
    badgeClass: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30',
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
    <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl shadow-sm border border-[var(--border-subtle)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted select-none">
            <tr>
              <th className="py-4 px-6 min-w-[280px]">Question</th>
              <th className="py-4 px-6 min-w-[120px]">Target Type</th>
              <th className="py-4 px-6 min-w-[130px]">Category</th>
              <th className="py-4 px-6 w-24 text-center">Order</th>
              <th className="py-4 px-6 w-32 text-center">Published</th>
              <th className="py-4 px-6 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted font-bold">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2
                      size={28}
                      className="animate-spin text-[var(--color-brand-green)]"
                    />
                    <span className="text-xs">
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
                  <p className="text-sm font-bold text-foreground">No FAQs found</p>
                  <p className="mt-1 text-xs max-w-sm mx-auto">
                    No FAQs matched your current filters. Try resetting the filters or create a new FAQ entry.
                  </p>
                  <button
                    onClick={onAddNew}
                    className="spatial-button mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
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
                      className={`hover:bg-[var(--color-brand-green)]/[0.04] transition-colors ${
                        isExpanded ? 'bg-foreground/[0.02]' : ''
                      }`}
                    >
                      {/* Question column */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(faq.id)}
                            className="mt-0.5 text-muted hover:text-foreground transition-colors cursor-pointer"
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
                                className="font-bold text-foreground text-xs sm:text-sm cursor-pointer hover:text-[var(--color-brand-green)] transition-colors leading-relaxed"
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
                                  className="inline-flex items-center gap-1 font-mono text-[10px] text-muted hover:text-foreground bg-foreground/5 border border-[var(--border-subtle)] px-2 py-0.5 rounded-md transition-all cursor-pointer"
                                  title="Click to copy slug"
                                >
                                  {copiedSlugId === faq.id ? (
                                    <>
                                      <Check size={10} className="text-emerald-500" />
                                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
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
                                <span className="rounded-md bg-foreground/5 border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] font-mono text-muted">
                                  ID: #{faq.targetId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target Type column */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-black tracking-wider uppercase ${targetBadge.badgeClass}`}
                        >
                          {targetBadge.label}
                        </span>
                      </td>

                      {/* Category column */}
                      <td className="py-4 px-6">
                        {faq.category ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-foreground/5 px-2.5 py-1 text-[11px] font-bold text-foreground border border-[var(--border-subtle)]">
                            <Tag size={10} className="text-muted" />
                            {faq.category}
                          </span>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Sort Order column */}
                      <td className="py-4 px-6 text-center font-bold text-foreground text-xs">
                        #{faq.sortOrder}
                      </td>

                      {/* Published Toggle Switch */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => onTogglePublished(faq)}
                          disabled={isToggling}
                          className="group relative inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
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
                                  : 'bg-zinc-400 dark:bg-zinc-700'
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
                              faq.isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'
                            }
                          >
                            {faq.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </button>
                      </td>

                      {/* Actions column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(faq)}
                            title="Edit FAQ"
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(faq)}
                            title="Delete FAQ"
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable answer accordion row */}
                    {isExpanded && (
                      <tr className="bg-foreground/[0.02] border-b border-[var(--border-subtle)]">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-subtle)]">
                              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-brand-green)]">
                                Answer Content:
                              </span>
                              <span className="text-[10px] text-muted font-mono">
                                FAQ ID #{faq.id} • Created{' '}
                                {new Date(faq.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
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
