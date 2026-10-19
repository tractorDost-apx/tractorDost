'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Globe,
  Languages,
  Check,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  INDIAN_LANGUAGES,
  LanguageOption,
  translatePost,
  TranslatedPostContent,
} from '@/lib/services/translationService';

interface FloatingLanguageSelectorProps {
  slug: string;
  originalTitle: string;
  originalExcerpt: string;
  originalContent: string;
  onTranslationChange: (translated: TranslatedPostContent) => void;
}

const STORAGE_LANG_KEY = 'tractorDost_blog_lang';

export default function FloatingLanguageSelector({
  slug,
  originalTitle,
  originalExcerpt,
  originalContent,
  onTranslationChange,
}: FloatingLanguageSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Sync with URL query parameter or localStorage on initial mount
  useEffect(() => {
    const urlLang = searchParams.get('lang')?.toLowerCase();
    const storedLang =
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_LANG_KEY)?.toLowerCase() : null;

    const initialLang = urlLang || storedLang || 'en';
    const isValid = INDIAN_LANGUAGES.some((l) => l.code === initialLang);
    const target = isValid ? initialLang : 'en';

    setActiveLang(target);
    if (target !== 'en') {
      performTranslation(target, false);
    }
  }, [slug]);

  // Handle outside click to close panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Translation handler
  const performTranslation = async (langCode: string, updateUrl = true) => {
    if (langCode === 'en') {
      setActiveLang('en');
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_LANG_KEY, 'en');
      }
      onTranslationChange({
        title: originalTitle,
        excerpt: originalExcerpt,
        contentHtml: originalContent,
        lang: 'en',
      });
      if (updateUrl) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('lang');
        const query = params.toString();
        router.push(`/blogs/${slug}${query ? `?${query}` : ''}`, { scroll: false });
      }
      return;
    }

    setIsTranslating(true);
    setErrorToast(null);

    try {
      const result = await translatePost(
        slug,
        originalTitle,
        originalExcerpt,
        originalContent,
        langCode
      );

      setActiveLang(langCode);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_LANG_KEY, langCode);
      }
      onTranslationChange(result);

      if (updateUrl) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('lang', langCode);
        router.push(`/blogs/${slug}?${params.toString()}`, { scroll: false });
      }
    } catch (err: any) {
      console.error('Translation failed:', err);
      const targetOption = INDIAN_LANGUAGES.find((l) => l.code === langCode);
      const langName = targetOption ? targetOption.name : langCode;

      setErrorToast(`Could not translate to ${langName}. Showing original article.`);
      setActiveLang('en');
      onTranslationChange({
        title: originalTitle,
        excerpt: originalExcerpt,
        contentHtml: originalContent,
        lang: 'en',
      });

      // Auto-dismiss error toast
      setTimeout(() => {
        setErrorToast(null);
      }, 4500);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSelectLanguage = (code: string) => {
    setIsOpen(false);
    if (code === activeLang) return;
    performTranslation(code, true);
  };

  const activeOption = INDIAN_LANGUAGES.find((l) => l.code === activeLang) || INDIAN_LANGUAGES[0];

  return (
    <>
      {/* Error Toast Notification */}
      {errorToast && (
        <div className="fixed bottom-24 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-red-300 bg-white/95 p-4 text-xs font-semibold text-red-600 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200 dark:border-red-500/40 dark:bg-black/90 dark:text-red-400 sm:right-8">
          <AlertCircle size={18} className="shrink-0 text-red-500 dark:text-red-400" />
          <span className="flex-1 leading-relaxed">{errorToast}</span>
          <button
            onClick={() => setErrorToast(null)}
            className="rounded-lg p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Widget Container */}
      <div ref={panelRef} className="fixed bottom-6 right-4 z-50 sm:bottom-8 sm:right-8">
        {/* Language Selection Popup (Opens Upward) */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 w-72 sm:w-80 rounded-3xl border border-zinc-200 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 dark:border-white/15 dark:bg-[#0a110d]/95">
            {/* Popup Header */}
            <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Languages size={18} className="text-[var(--color-brand-green)]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Read in your language
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all dark:border-transparent dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <p className="mb-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              Choose your preferred Indian language. Translations update instantly.
            </p>

            {/* Language Options Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {INDIAN_LANGUAGES.map((lang) => {
                const isSelected = activeLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[var(--color-brand-green)] text-white shadow-md shadow-[var(--color-brand-green)]/25'
                        : 'border border-zinc-200/60 bg-zinc-100/70 text-zinc-800 hover:bg-zinc-200 hover:text-zinc-900 dark:border-transparent dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{lang.native}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {lang.name}
                      </span>
                    </div>
                    {isSelected && <Check size={14} className="shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Circular Floating Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Read in your language"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--color-brand-green-dark)] to-[var(--color-brand-green)] text-white shadow-[0_10px_35px_rgba(74,118,53,0.45)] border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_rgba(74,118,53,0.6)] active:scale-95 focus:outline-none"
        >
          {isTranslating ? (
            <Loader2 size={24} className="animate-spin text-white" />
          ) : (
            <Globe
              size={24}
              className="transition-transform duration-300 group-hover:rotate-45"
            />
          )}

          {/* Active Language Badge */}
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-black uppercase text-black shadow-md border border-black/10">
            {activeOption.code.toUpperCase()}
          </span>

          {/* Hover Tooltip (desktop only) */}
          <span className="pointer-events-none absolute right-16 hidden rounded-xl bg-black/90 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-xl backdrop-blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block border border-white/10">
            Translate Article ({activeOption.native})
          </span>
        </button>
      </div>
    </>
  );
}
