import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const dummyFavorites = [
    { id: 1, title: 'John Deere 5310', price: '₹8,50,000', location: 'Kolhapur, Maharashtra', image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=200&auto=format&fit=crop' },
    { id: 2, title: 'Sonalika DI 745 III', price: '₹5,80,000', location: 'Satara, Maharashtra', image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=200&auto=format&fit=crop' },
    { id: 3, title: 'New Holland 3230', price: '₹6,10,000', location: 'Sangli, Maharashtra', image: 'https://images.unsplash.com/photo-1605333501705-eb8b51d4d03f?q=80&w=200&auto=format&fit=crop' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">Favorites</h1>
        <p className="text-muted font-medium">Tractors you have saved for later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyFavorites.map((tractor) => (
          <div key={tractor.id} className="glass-panel p-4 rounded-2xl flex flex-col group hover:border-[var(--color-brand-green)]/30 transition-all cursor-pointer">
            <div className="relative h-40 rounded-xl overflow-hidden mb-4">
              <img src={tractor.image} alt={tractor.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                <Heart size={16} fill="currentColor" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{tractor.title}</h3>
            <p className="text-[var(--color-brand-green)] font-black text-xl mb-3">{tractor.price}</p>
            
            <div className="flex items-center gap-2 text-muted text-sm font-medium mt-auto mb-4">
              <MapPin size={16} /> <span className="truncate">{tractor.location}</span>
            </div>
            
            <button className="w-full bg-[var(--color-brand-green)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-brand-green)]/90 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
