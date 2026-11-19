'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Universal Scroll Restoration & Scroll-To-Top Controller
 *
 * Resolves Next.js App Router bug where navigating between routes or opening
 * product cards leaves the window scrolled down at the footer.
 *
 * 1. Sets history.scrollRestoration = 'manual' to prevent browsers from
 *    re-applying previous page scroll offsets to newly mounted pages.
 * 2. On route changes (pathname or searchParams), smoothly / instantly
 *    resets window and document scroll to top (0, 0), unless an anchor hash (#) is present.
 * 3. Uses multi-frame safety checks (RAF + micro-timers) to guarantee that
 *    async server components, streaming layouts, and hydration shifts do not
 *    clamp or pop the viewport down to the footer.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef<string | null>(null);

  // Disable browser automatic scroll restoration globally
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Skip if nothing changed
    if (prevPathRef.current === fullPath) return;
    prevPathRef.current = fullPath;

    // If an anchor hash exists (e.g. #section-emi-calc or #reviews), scroll to that section
    const hash = window.location.hash;
    if (hash) {
      try {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } catch (_) {}
    }

    // Otherwise, immediately and decisively reset scroll to the top
    const scrollToTopImmediate = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    scrollToTopImmediate();

    // Re-assert in next animation frames & micro-delays to withstand React 19 hydration shifts
    const rafId = requestAnimationFrame(scrollToTopImmediate);
    const t1 = setTimeout(scrollToTopImmediate, 30);
    const t2 = setTimeout(scrollToTopImmediate, 120);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, searchParams]);

  return null;
}
