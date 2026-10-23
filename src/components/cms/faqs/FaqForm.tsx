'use client';

import React, { useState } from 'react';
import {
  X,
  Save,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import {
  faqAPI,
  FAQ,
  FaqTargetType,
  FAQ_TARGET_TYPES,
  CreateFaqInput,
  UpdateFaqInput,
  generateFaqSlug,
} from '@/lib/api/faq';

interface FaqFormProps {
  isOpen: boolean;
  onClose: () => void;
  faq?: FAQ | null;
  onSuccess: (savedFaq: FAQ) => void;
  availableCategories?: string[];
}

const TARGET_TYPE_HINTS: Record<FaqTargetType, string> = {
  GENERAL: '',
  TRACTOR: 'Enter the Tractor ID this FAQ is attached to (e.g. 42 for Mahindra 575 DI).',
  BRAND: 'Enter the Brand ID this FAQ is attached to (e.g. 5 for Sonalika).',
  LOAN: 'Enter the Loan Scheme / Application ID.',
  SELL: 'Enter the Sell Flow / Used Listing ID if applicable.',
  BUY: 'Enter the Buying Category / Guide target ID if applicable.',
};

function FaqFormModal({
  onClose,
  faq,
  onSuccess,
  availableCategories = [],
}: Omit<FaqFormProps, 'isOpen'>) {
  const [question, setQuestion] = useState(faq ? faq.question : '');
  const [answer, setAnswer] = useState(faq ? faq.answer : '');
  const [targetType, setTargetType] = useState<FaqTargetType>(
    faq ? faq.targetType : 'GENERAL'
  );
  const [targetId, setTargetId] = useState<number | ''>(
    faq && faq.targetId !== null ? faq.targetId : ''
  );
  const [category, setCategory] = useState(faq ? faq.category ?? '' : '');
  const [slug, setSlug] = useState(faq ? faq.slug ?? '' : '');
  const [sortOrder, setSortOrder] = useState<number>(faq ? faq.sortOrder : 0);
  const [isPublished, setIsPublished] = useState<boolean>(
    faq ? faq.isPublished : true
  );

  const [autoSlug, setAutoSlug] = useState(!faq);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Question Change & Auto-Slug
  const handleQuestionChange = (val: string) => {
    setQuestion(val);
    if (autoSlug && !faq) {
      setSlug(generateFaqSlug(val));
    }
  };

  // Manual trigger to generate slug from current question
  const handleGenerateSlug = () => {
    if (!question.trim()) return;
    setSlug(generateFaqSlug(question));
  };

  const handleTargetTypeChange = (newType: FaqTargetType) => {
    setTargetType(newType);
    if (newType === 'GENERAL') {
      setTargetId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    if (trimmedQuestion.length < 3) {
      setErrorMsg('Question must be at least 3 characters long.');
      return;
    }

    if (trimmedQuestion.length > 500) {
      setErrorMsg('Question cannot exceed 500 characters.');
      return;
    }

    if (trimmedAnswer.length < 1) {
      setErrorMsg('Answer is required.');
      return;
    }

    if (trimmedAnswer.length > 5000) {
      setErrorMsg('Answer cannot exceed 5000 characters.');
      return;
    }

    // Slug validation if provided
    const cleanSlug = slug.trim();
    if (cleanSlug) {
      const slugRe = /^(?=.*[a-z])[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRe.test(cleanSlug)) {
        setErrorMsg(
          'Slug must contain lowercase letters, numbers, hyphens, and at least one letter (e.g. how-to-apply-loan).'
        );
        return;
      }
    }

    let parsedTargetId: number | null = null;
    if (targetType !== 'GENERAL' && targetId !== '') {
      parsedTargetId = Number(targetId);
      if (isNaN(parsedTargetId) || parsedTargetId <= 0) {
        setErrorMsg('Target ID must be a positive integer.');
        return;
      }
    }

    setSaving(true);

    try {
      if (faq) {
        // Edit mode
        const payload: UpdateFaqInput = {
          question: trimmedQuestion,
          answer: trimmedAnswer,
          targetType,
          targetId: parsedTargetId,
          category: category.trim() || null,
          slug: cleanSlug || null,
          sortOrder: Number(sortOrder) || 0,
          isPublished,
        };

        const res = await faqAPI.update(faq.id, payload);
        if (res.success && res.data) {
          onSuccess(res.data);
          onClose();
        }
      } else {
        // Create mode
        const payload: CreateFaqInput = {
          question: trimmedQuestion,
          answer: trimmedAnswer,
          targetType,
          targetId: parsedTargetId,
          category: category.trim() || null,
          slug: cleanSlug || null,
          sortOrder: Number(sortOrder) || 0,
          isPublished,
        };

        const res = await faqAPI.create(payload);
        if (res.success && res.data) {
          onSuccess(res.data);
          onClose();
        }
      }
    } catch (err: unknown) {
      console.error('Failed to save FAQ:', err);
      const apiErr = err as {
        response?: { data?: { message?: string; error?: unknown } };
      };
      const serverMessage =
        apiErr?.response?.data?.message || 'Failed to save FAQ. Please check input.';
      setErrorMsg(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-[var(--border-subtle)] bg-background p-6 sm:p-7 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 border border-[var(--border-subtle)] text-[var(--color-brand-green)] shadow-sm">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                {faq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <p className="text-xs font-semibold text-muted">
                {faq
                  ? `Editing FAQ #${faq.id} • ${faq.targetType}`
                  : 'Create a new question and answer entry for users'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground shrink-0 rounded-full p-2 hover:bg-foreground/5 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-bold text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1 font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Question */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-black tracking-wider text-muted uppercase">
                Question <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-muted font-mono">
                {question.length}/500
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={500}
              value={question}
              onChange={(e) => handleQuestionChange(e.target.value)}
              placeholder="e.g. What documents are required for a tractor loan?"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
            />
          </div>

          {/* Answer */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-black tracking-wider text-muted uppercase">
                Answer <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-muted font-mono">
                {answer.length}/5000
              </span>
            </div>
            <textarea
              rows={5}
              required
              maxLength={5000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a thorough, informative answer. Markdown and line breaks are preserved..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Target Type & Target ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-black tracking-wider text-muted uppercase">
                Target Type <span className="text-red-500">*</span>
              </label>
              <select
                value={targetType}
                onChange={(e) =>
                  handleTargetTypeChange(e.target.value as FaqTargetType)
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors cursor-pointer"
              >
                {FAQ_TARGET_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-background text-foreground">
                    {t.label} ({t.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Target ID (conditionally visible only if not GENERAL) */}
            {targetType !== 'GENERAL' ? (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-black tracking-wider text-muted uppercase">
                    Target ID (Optional)
                  </label>
                  <span className="text-[10px] text-muted">Entity ID</span>
                </div>
                <input
                  type="number"
                  min={1}
                  value={targetId}
                  onChange={(e) =>
                    setTargetId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="e.g. 101"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 text-xs font-mono font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
                />
                {TARGET_TYPE_HINTS[targetType] && (
                  <p className="mt-1 text-[10px] text-muted leading-tight font-medium">
                    {TARGET_TYPE_HINTS[targetType]}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center text-[11px] text-muted bg-foreground/[0.02] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5">
                <p>
                  <strong className="text-foreground">GENERAL type:</strong> Appears on
                  the global FAQ knowledge base and doesn&apos;t require a Target ID.
                </p>
              </div>
            )}
          </div>

          {/* Category & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div>
              <label className="mb-1 block text-xs font-black tracking-wider text-muted uppercase">
                Category (Optional)
              </label>
              <input
                type="text"
                list="faq-form-category-list"
                maxLength={100}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Financing, Warranty, Purchasing"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
              />
              <datalist id="faq-form-category-list">
                {availableCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Slug */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-black tracking-wider text-muted uppercase">
                  URL Slug (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:underline cursor-pointer"
                  title="Generate slug from Question"
                >
                  <Sparkles size={11} />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setAutoSlug(false);
                }}
                placeholder="documents-required-for-tractor-loan"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 font-mono text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Sort Order & Is Published toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center pt-2">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-black tracking-wider text-muted uppercase">Sort Order</label>
                <span className="text-[10px] text-muted">Lower shows first</span>
              </div>
              <input
                type="number"
                min={-10000}
                max={10000}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 text-xs font-mono font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
              />
            </div>

            {/* Is Published Toggle Switch */}
            <div className="flex items-center justify-between sm:justify-start gap-3 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5 mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? 'bg-[var(--color-brand-green)]' : 'bg-zinc-400 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <label
                  onClick={() => setIsPublished(!isPublished)}
                  className="block text-xs font-bold text-foreground cursor-pointer select-none"
                >
                  {isPublished ? 'Published (Live)' : 'Draft (Unpublished)'}
                </label>
                <p className="text-[10px] text-muted">
                  {isPublished
                    ? 'Visible to visitors on site'
                    : 'Only visible to admins'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--color-brand-green)]/20 hover:bg-[var(--color-brand-orange)] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{faq ? 'Updating FAQ...' : 'Creating FAQ...'}</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{faq ? 'Update FAQ' : 'Create FAQ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FaqForm({
  isOpen,
  onClose,
  faq,
  onSuccess,
  availableCategories = [],
}: FaqFormProps) {
  if (!isOpen) return null;

  return (
    <FaqFormModal
      key={faq ? `edit-${faq.id}` : 'create-faq'}
      onClose={onClose}
      faq={faq}
      onSuccess={onSuccess}
      availableCategories={availableCategories}
    />
  );
}
