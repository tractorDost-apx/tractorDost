import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const dummyFavorites = [
    {
      id: 1,
      title: 'John Deere 5310',
      price: '₹8,50,000',
      location: 'Kolhapur, Maharashtra',
      image:
        'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Sonalika DI 745 III',
      price: '₹5,80,000',
      location: 'Satara, Maharashtra',
      image:
        'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'New Holland 3230',
      price: '₹6,10,000',
      location: 'Sangli, Maharashtra',
      image:
        'https://images.unsplash.com/photo-1605333501705-eb8b51d4d03f?q=80&w=200&auto=format&fit=crop',
    },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-black">Favorites</h1>
        <p className="text-muted font-medium">Tractors you have saved for later.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dummyFavorites.map((tractor) => (
          <div
            key={tractor.id}
            className="glass-panel group flex cursor-pointer flex-col rounded-2xl p-4 transition-all hover:border-[var(--color-brand-green)]/30"
          >
            <div className="relative mb-4 h-40 overflow-hidden rounded-xl">
              <img
                src={tractor.image}
                alt={tractor.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-red-500 backdrop-blur-md transition-colors hover:bg-red-500 hover:text-white">
                <Heart size={16} fill="currentColor" />
              </button>
            </div>
            <h3 className="text-foreground mb-1 line-clamp-1 text-lg font-bold">{tractor.title}</h3>
            <p className="mb-3 text-xl font-black text-[var(--color-brand-green)]">
              {tractor.price}
            </p>

            <div className="text-muted mt-auto mb-4 flex items-center gap-2 text-sm font-medium">
              <MapPin size={16} /> <span className="truncate">{tractor.location}</span>
            </div>

            <button className="w-full rounded-xl bg-[var(--color-brand-green)] py-3 font-bold text-white transition-colors hover:bg-[var(--color-brand-green)]/90">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
