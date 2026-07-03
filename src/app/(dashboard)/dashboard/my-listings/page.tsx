import React from 'react';
import { Tractor, Plus, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';

export default function MyListingsPage() {
  const dummyListings = [
    { id: 1, title: 'Mahindra 575 DI SP Plus', price: '₹5,50,000', location: 'Pune, Maharashtra', status: 'Active', image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?q=80&w=200&auto=format&fit=crop' },
    { id: 2, title: 'Swaraj 744 FE', price: '₹6,20,000', location: 'Nashik, Maharashtra', status: 'Under Review', image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=200&auto=format&fit=crop' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">My Listings</h1>
          <p className="text-muted font-medium">Manage the tractors you are currently selling.</p>
        </div>
        <Link href="/sell" className="spatial-button h-12 px-6 rounded-xl flex items-center gap-2 whitespace-nowrap">
          <Plus size={20} /> Add New Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyListings.map((tractor) => (
          <div key={tractor.id} className="glass-panel p-4 rounded-2xl flex flex-col group hover:border-[var(--color-brand-green)]/30 transition-all cursor-pointer">
            <div className="relative h-40 rounded-xl overflow-hidden mb-4">
              <img src={tractor.image} alt={tractor.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white">
                {tractor.status}
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{tractor.title}</h3>
            <p className="text-[var(--color-brand-green)] font-black text-xl mb-3">{tractor.price}</p>
            
            <div className="flex items-center gap-2 text-muted text-sm font-medium mt-auto mb-4">
              <MapPin size={16} /> <span className="truncate">{tractor.location}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button className="bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold py-2 rounded-xl text-sm transition-colors">Edit</button>
              <button className="bg-[var(--color-brand-green)]/10 hover:bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1">
                <Tag size={14} /> Mark Sold
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
