'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQ } from '@/lib/api/faq';

interface FaqAccordionProps {
  faqs: FAQ[];
  defaultOpenIndex?: number | null;
}

export default function FaqAccordion({
  faqs,
  defaultOpenIndex = null,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="w-full divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={faq.id || index} className="py-4 sm:py-5">
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left cursor-pointer group"
            >
              <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-[var(--color-brand-green)] transition-colors leading-snug">
                {faq.question}
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted group-hover:text-foreground transition-colors">
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>

            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100 mt-2.5' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-xs sm:text-sm text-muted leading-relaxed pr-6 whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
