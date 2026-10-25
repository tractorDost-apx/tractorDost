'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  {
    threshold = 0.1,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: UseIntersectionObserverOptions = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef?.current;
    if (!node || frozen || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([firstEntry]) => setEntry(firstEntry), {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}
