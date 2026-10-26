'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Tractor, ExternalLink, IndianRupee, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface FavoriteTractor {
  id: number | string;
  title: string;
  price: string;
  location: string;
  year?: number | string;
  hours?: number | string;
  image?: string;
  href: string;
}

const DEFAULT_SAMPLE_FAVORITES: FavoriteTractor[] = [
  {
    id: 1,
    title: 'Mahindra 575 DI SP Plus',
    price: '₹5,80,000',
    location: 'Kolhapur, Maharashtra',
    year: 2021,
    hours: '1,450',
    href: '/used-tractors',
  },
  {
    id: 2,
    title: 'Swaraj 744 FE 4WD',
    price: '₹6,40,000',
    location: 'Satara, Maharashtra',
    year: 2022,
    hours: '980',
    href: '/used-tractors',
  },
  {
    id: 3,
    title: 'John Deere 5310 PowerTech',
    price: '₹7,90,000',
    location: 'Pune, Maharashtra',
    year: 2020,
    hours: '2,100',
    href: '/used-tractors',
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteTractor[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tractordost:user_favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFavorites(parsed);
          setHydrated(true);
          return;
        }
      }
    } catch (_) {}
    // Fallback to initial sample favorites
    setFavorites(DEFAULT_SAMPLE_FAVORITES);
    setHydrated(true);
  }, []);

  const handleRemove = (id: number | string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    try {
      localStorage.setItem('tractordost:user_favorites', JSON.stringify(updated));
    } catch (_) {}
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-1 text-3xl font-black">Favorites & Wishlist</h1>
          <p className="text-muted text-xs font-medium sm:text-sm">
            Tractors you have saved to compare, review, and track later.
          </p>
        </div>

        <Link
          href="/used-tractors"
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
        >
          Browse All Tractors
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
            <Heart size={32} />
          </div>
          <h3 className="text-foreground text-lg font-bold">No Saved Tractors Yet</h3>
          <p className="text-muted mt-1 max-w-sm text-xs font-medium">
            Browse through our verified new and used tractors and click the heart icon to save them here.
          </p>
          <Link
            href="/used-tractors"
            className="mt-6 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md hover:opacity-90"
          >
            Explore Used Tractors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((tractor) => (
            <div
              key={tractor.id}
              className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-5 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-md"
            >
              <div>
                <div className="bg-foreground/5 relative mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                  {tractor.image ? (
                    <img
                      src={tractor.image}
                      alt={tractor.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Tractor size={48} className="text-muted/30" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(tractor.id)}
                    className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-rose-500 backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white"
                    title="Remove from favorites"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>

                <h3 className="text-foreground mb-1 line-clamp-1 text-base font-black">
                  {tractor.title}
                </h3>
                <p className="mb-2 text-xl font-black text-[var(--color-brand-green)]">
                  {tractor.price}
                </p>

                {(tractor.year || tractor.hours) && (
                  <p className="text-muted mb-3 text-xs font-bold">
                    {tractor.year ? `Year: ${tractor.year}` : ''}
                    {tractor.year && tractor.hours ? ' • ' : ''}
                    {tractor.hours ? `${tractor.hours} hrs` : ''}
                  </p>
                )}

                <div className="text-muted mb-4 flex items-center gap-1.5 text-xs font-bold">
                  <MapPin size={15} /> <span className="truncate">{tractor.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
                <Link
                  href={tractor.href}
                  className="flex-1 rounded-xl bg-[var(--color-brand-green)] py-2.5 text-center text-xs font-black tracking-wider text-white uppercase transition-colors hover:bg-[var(--color-brand-green)]/90"
                >
                  View Details
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(tractor.id)}
                  className="text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-[var(--border-subtle)] p-2.5 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
