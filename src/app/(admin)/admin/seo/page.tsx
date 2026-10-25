'use client';

import React, { useState } from 'react';
import {
  Globe2,
  TrendingUp,
  Search,
  CheckCircle2,
  Sparkles,
  FileCode,
  Share2,
  Layers,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function AdminSeoPage() {
  const [siteTitle, setSiteTitle] = useState('TractorDost - Buy, Sell & Finance Tractors in India');
  const [metaDescription, setMetaDescription] = useState(
    'Explore on-road tractor prices, transparent specifications, certified used tractors, instant loans, and authorized dealer networks across India.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://tractordost.com');
  const [indexingActive, setIndexingActive] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const SITEMAP_SECTIONS = [
    { name: 'Tractor Catalog & Specs', count: '250+ URLs', status: 'Healthy', path: '/sitemap/tractors.xml' },
    { name: 'Authorized Dealers & Showrooms', count: '1,400+ URLs', status: 'Healthy', path: '/sitemap/dealers.xml' },
    { name: 'Certified Used Tractors (State & District)', count: '750+ URLs', status: 'Healthy', path: '/sitemap/used.xml' },
    { name: 'Editorial News & Field Blogs', count: '180+ URLs', status: 'Healthy', path: '/sitemap/content.xml' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
            <TrendingUp size={18} />
          </span>
          <h1 className="text-2xl font-black text-foreground">SEO & Metadata Control Engine</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Configure search engine indexing, programmatic sitemaps, OpenGraph sharing, and Schema.org rich snippets.
        </p>
      </div>

      {saved && (
        <div className="rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4 text-xs font-bold text-lime-400 flex items-center gap-2">
          <CheckCircle2 size={16} /> SEO configuration saved successfully!
        </div>
      )}

      {/* Main Grid: Form + Google SERP Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl lg:col-span-7">
          <h2 className="text-lg font-black text-foreground mb-4">Global Meta Configuration</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                Default Title Template
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2.5 text-xs font-medium focus:border-lime-400 focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Recommended length: 50-60 characters ({siteTitle.length} characters)
              </span>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2.5 text-xs font-medium focus:border-lime-400 focus:outline-none resize-none"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Recommended length: 140-160 characters ({metaDescription.length} characters)
              </span>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                Canonical Base URL
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2.5 text-xs font-mono focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={indexingActive}
                  onChange={(e) => setIndexingActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-lime-400"
                />
                <span>Enable Googlebot Indexing (robots.txt: index, follow)</span>
              </label>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 shadow-md transition-all"
              >
                <Save size={14} /> Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Right: Google SERP Simulator */}
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl lg:col-span-5 flex flex-col">
          <h2 className="text-lg font-black text-foreground mb-2 flex items-center gap-2">
            <Search size={18} className="text-lime-400" />
            Google SERP Snippet Preview
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Live simulation of how TractorDost appears in Google Search mobile and desktop cards.
          </p>

          <div className="rounded-2xl border border-border/40 bg-zinc-950 p-5 font-sans space-y-2 text-left my-auto">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-black font-black text-[10px]">
                TD
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-zinc-300 font-medium">TractorDost</span>
                <span className="text-[10px] text-zinc-500 font-mono">https://tractordost.com</span>
              </div>
            </div>

            <h3 className="text-blue-400 hover:underline cursor-pointer text-base font-medium leading-snug">
              {siteTitle}
            </h3>

            <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
              {metaDescription}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-lime-400">
              <span>★ 4.8 Rating</span>
              <span>· 500k+ Farmers</span>
              <span>· Free EMI Calculator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sitemaps & Structured Data Status */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <FileCode size={18} className="text-lime-400" />
            Programmatic Sitemaps & Rich Schema
          </h2>
          <span className="text-xs font-bold text-lime-400 flex items-center gap-1">
            <CheckCircle2 size={14} /> Auto-Regenerated Every 24h
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SITEMAP_SECTIONS.map((sec, idx) => (
            <div key={idx} className="rounded-2xl border border-border/40 bg-secondary/20 p-4 text-xs space-y-2">
              <span className="font-extrabold text-foreground text-sm block">{sec.name}</span>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Indexed URLs:</span>
                <span className="font-bold text-foreground">{sec.count}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Status:</span>
                <span className="font-bold text-lime-400">{sec.status}</span>
              </div>
              <div className="pt-1 font-mono text-[10px] text-muted-foreground truncate">
                {sec.path}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
