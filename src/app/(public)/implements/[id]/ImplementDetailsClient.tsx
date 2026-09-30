'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ArrowLeft,
  Wrench,
  FileText,
  Play,
  Share2,
  Gauge,
  Weight,
  Layers,
  Tractor,
  PhoneCall,
  Sparkles,
  Info,
  Building2,
  Tag,
  Ruler,
  Zap,
  Settings,
} from 'lucide-react';
import { Implement } from '@/lib/api/implements';

export interface ExtraSpecItem {
  name: string;
  value: string;
  unit?: string | null;
}

export interface GroupedSpecs {
  sectionName: string;
  specs: ExtraSpecItem[];
}

export function parseAdditionalSpecs(additionalSpecs: any): GroupedSpecs[] {
  if (!additionalSpecs || typeof additionalSpecs !== 'object') return [];

  const groupedMap: Map<string, ExtraSpecItem[]> = new Map();

  // 1. Process extraSpecs array if present
  if (Array.isArray(additionalSpecs.extraSpecs)) {
    additionalSpecs.extraSpecs.forEach((item: any) => {
      if (!item || typeof item !== 'object') return;

      const name = item.name || item.specName || item.title || item.key;
      const value = item.value;
      if (!name || value === null || value === undefined || value === '') return;

      const section = (item.section || item.category || 'Performance & Specs').trim();
      const unit =
        item.unit && item.unit !== '-' && item.unit !== 'N/A' && item.unit !== 'null'
          ? item.unit
          : null;

      const specItem: ExtraSpecItem = {
        name: String(name).trim(),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value).trim(),
        unit: unit ? String(unit).trim() : null,
      };

      if (!groupedMap.has(section)) {
        groupedMap.set(section, []);
      }
      groupedMap.get(section)!.push(specItem);
    });
  }

  // 2. Process top-level key-value pairs (excluding 'extraSpecs' key itself)
  Object.entries(additionalSpecs).forEach(([key, val]) => {
    if (key === 'extraSpecs') return;
    if (val === null || val === undefined || val === '') return;

    if (typeof val === 'object' && !Array.isArray(val)) {
      const sectionName = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase());

      Object.entries(val).forEach(([subKey, subVal]) => {
        if (subVal === null || subVal === undefined || subVal === '') return;
        const subName = subKey
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .trim()
          .replace(/^\w/, (c) => c.toUpperCase());

        const specItem: ExtraSpecItem = {
          name: subName,
          value: typeof subVal === 'object' ? JSON.stringify(subVal) : String(subVal),
        };

        if (!groupedMap.has(sectionName)) {
          groupedMap.set(sectionName, []);
        }
        groupedMap.get(sectionName)!.push(specItem);
      });

      return;
    }

    const formattedName = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());

    const section = 'General Specifications';
    const specItem: ExtraSpecItem = {
      name: formattedName,
      value: typeof val === 'object' ? JSON.stringify(val) : String(val),
    };

    if (!groupedMap.has(section)) {
      groupedMap.set(section, []);
    }
    groupedMap.get(section)!.push(specItem);
  });

  return Array.from(groupedMap.entries()).map(([sectionName, specs]) => ({
    sectionName,
    specs,
  }));
}

function SpecCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-background flex flex-col gap-1.5 rounded-2xl border border-[var(--border-subtle)] p-4 shadow-sm transition-colors hover:border-[var(--color-brand-green)]/40">
      <div className="text-muted flex items-center gap-2 text-[11px] font-extrabold tracking-wider uppercase">
        {icon && <span className="text-[var(--color-brand-green)]">{icon}</span>}
        <span>{label}</span>
      </div>
      <span className="text-foreground text-base font-black tracking-tight">{value}</span>
    </div>
  );
}

export default function ImplementDetailsClient({
  implement,
  similarImplements = [],
}: {
  implement: Implement;
  similarImplements?: Implement[];
}) {
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>('image');

  const formatPrice = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Price on Request';

    const formatValue = (val: number) => {
      if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
      return `₹ ${val.toLocaleString('en-IN')}`;
    };

    if (min && max && min !== max) {
      return `${formatValue(min)} - ${formatValue(max)}`;
    }
    return formatValue(min || max || 0);
  };

  const getHpDisplay = (impl: Implement) => {
    const min = impl.tractorHPMin ?? impl.compatibleHpMin;
    const max = impl.tractorHPMax ?? impl.compatibleHpMax;
    if (min && max) return `${min} - ${max} HP`;
    if (min) return `>= ${min} HP`;
    if (max) return `<= ${max} HP`;
    return null;
  };

  const getWidthDisplay = (impl: Implement) => {
    if (impl.width) return `${impl.width} mm`;
    if (impl.workingWidthFt) return `${impl.workingWidthFt} Feet`;
    return null;
  };

  const handleShare = () => {
    if (!implement) return;
    const text = `Check out the ${implement.brand?.name || ''} ${implement.modelName} implement on TractorDost! Estimated Price: ${formatPrice(implement.priceMin, implement.priceMax)}.`;
    const url = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const priceFormatted = formatPrice(implement.priceMin, implement.priceMax);
  const primaryMediaUrl = implement.videoThumbnailUrl || implement.brand?.logoUrl || null;
  const hpDisplay = getHpDisplay(implement);
  const widthDisplay = getWidthDisplay(implement);

  const groupedSpecs = parseAdditionalSpecs(implement.additionalSpecs);

  return (
    <div className="animate-fade-in relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pt-6 pb-24 sm:px-6 lg:px-8">
      {/* BREADCRUMBS & BACK BUTTON */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/implements"
          className="text-muted hover:text-foreground bg-background/50 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold shadow-sm backdrop-blur-md transition-colors"
        >
          <ArrowLeft size={16} /> Back to Implements Catalog
        </Link>

        <nav className="text-muted flex items-center gap-2 text-xs font-bold">
          <Link href="/" className="transition-colors hover:text-[var(--color-brand-green)]">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link
            href="/implements"
            className="transition-colors hover:text-[var(--color-brand-green)]"
          >
            Implements
          </Link>
          {implement.brand?.name && (
            <>
              <ChevronRight size={12} />
              <Link
                href={`/implements?brand=${implement.brand.slug || implement.brand.id}`}
                className="transition-colors hover:text-[var(--color-brand-green)]"
              >
                {implement.brand.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-foreground max-w-[200px] truncate">{implement.modelName}</span>
        </nav>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* LEFT COLUMN: Media Preview, Description & Grouped Specs */}
        <div className="flex w-full flex-col gap-8 lg:w-[58%]">
          {/* MEDIA BOX */}
          <div className="spatial-panel flex flex-col gap-4 rounded-[2.5rem] p-4">
            <div className="from-foreground/5 group relative flex h-[380px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-6 md:h-[480px]">
              {/* Floating Top Right Buttons */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={handleShare}
                  className="bg-background/80 text-foreground flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-brand-green)] hover:text-white"
                  title="Share via WhatsApp"
                >
                  <Share2 size={18} />
                </button>

                {implement.brochureUrl && (
                  <a
                    href={implement.brochureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-background/80 text-foreground flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-brand-green)] hover:text-white"
                    title="Download Brochure PDF"
                  >
                    <FileText size={18} />
                  </a>
                )}

                {implement.videoUrl && (
                  <a
                    href={implement.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-background/80 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--color-brand-orange)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-brand-orange)] hover:text-white"
                    title="Watch Video Review"
                  >
                    <Play size={18} className="ml-0.5" />
                  </a>
                )}
              </div>

              {/* Main Media Display */}
              {activeMediaTab === 'video' && implement.videoUrl ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[1.5rem] bg-black/20">
                  <Play size={64} className="animate-pulse text-[var(--color-brand-orange)]" />
                  <a
                    href={implement.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-[var(--color-brand-orange)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase transition-transform hover:scale-105"
                  >
                    Open Video in New Tab
                  </a>
                </div>
              ) : primaryMediaUrl ? (
                <img
                  src={primaryMediaUrl}
                  alt={implement.modelName}
                  className="relative z-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-muted/30 flex flex-col items-center gap-3">
                  <Wrench size={100} strokeWidth={1} />
                  <span className="text-muted/60 text-sm font-bold tracking-widest uppercase">
                    {implement.category?.name || 'Farm Implement'}
                  </span>
                </div>
              )}
            </div>

            {/* Media Tabs / Action Bar */}
            <div className="custom-scrollbar flex items-center gap-3 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveMediaTab('image')}
                className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${activeMediaTab === 'image' ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-white shadow-md' : 'bg-background text-muted hover:text-foreground border-[var(--border-subtle)]'}`}
              >
                Implement Preview
              </button>

              {implement.videoUrl && (
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${activeMediaTab === 'video' ? 'border-[var(--color-brand-orange)] bg-[var(--color-brand-orange)] text-white shadow-md' : 'bg-background text-muted hover:text-foreground border-[var(--border-subtle)]'}`}
                >
                  <Play size={14} /> Video Review
                </button>
              )}

              {implement.brochureUrl && (
                <a
                  href={implement.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-background text-muted hover:text-foreground flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold transition-all"
                >
                  <FileText size={14} /> Download Brochure PDF
                </a>
              )}
            </div>
          </div>

          {/* OVERVIEW & DESCRIPTION */}
          {implement.description && (
            <div className="spatial-panel flex flex-col gap-4 rounded-[2.5rem] p-8">
              <h3 className="text-foreground flex items-center gap-2 text-xl font-black">
                <Info size={20} className="text-[var(--color-brand-green)]" /> Overview &
                Description
              </h3>
              {implement.description.includes('<') ? (
                <div
                  className="text-muted prose dark:prose-invert max-w-none text-base leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: implement.description }}
                />
              ) : (
                <p className="text-muted text-base leading-relaxed font-medium whitespace-pre-line">
                  {implement.description}
                </p>
              )}
            </div>
          )}

          {/* DIRECT TECHNICAL SPECIFICATIONS GRID */}
          <div className="spatial-panel flex flex-col gap-6 rounded-[2.5rem] p-8">
            <h3 className="text-foreground flex items-center gap-2 text-xl font-black">
              <Settings size={20} className="text-[var(--color-brand-green)]" /> Technical
              Specifications
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {implement.implementType && (
                <SpecCard
                  label="Implement Type"
                  value={implement.implementType}
                  icon={<Tag size={16} />}
                />
              )}
              {hpDisplay && (
                <SpecCard
                  label="Tractor Power Requirement"
                  value={hpDisplay}
                  icon={<Gauge size={16} />}
                />
              )}
              {widthDisplay && (
                <SpecCard label="Working Width" value={widthDisplay} icon={<Layers size={16} />} />
              )}
              {implement.length && (
                <SpecCard
                  label="Overall Length"
                  value={`${implement.length} mm`}
                  icon={<Ruler size={16} />}
                />
              )}
              {implement.height && (
                <SpecCard
                  label="Overall Height"
                  value={`${implement.height} mm`}
                  icon={<Ruler size={16} />}
                />
              )}
              {implement.weightKg && (
                <SpecCard
                  label="Total Weight"
                  value={`${implement.weightKg} Kg`}
                  icon={<Weight size={16} />}
                />
              )}
              {implement.engineHp && (
                <SpecCard
                  label="Engine Power"
                  value={`${implement.engineHp} HP`}
                  icon={<Zap size={16} />}
                />
              )}
              {implement.cylinders && (
                <SpecCard
                  label="Cylinders"
                  value={String(implement.cylinders)}
                  icon={<Settings size={16} />}
                />
              )}
              {implement.ptoInputSpeedRpm && (
                <SpecCard
                  label="PTO Input Speed"
                  value={`${implement.ptoInputSpeedRpm} RPM`}
                  icon={<Gauge size={16} />}
                />
              )}
              {implement.numberOfSpeeds && (
                <SpecCard
                  label="Number of Speeds"
                  value={String(implement.numberOfSpeeds)}
                  icon={<Settings size={16} />}
                />
              )}
              {implement.transmissionType && (
                <SpecCard
                  label="Transmission"
                  value={implement.transmissionType}
                  icon={<Settings size={16} />}
                />
              )}
              {implement.brakes && (
                <SpecCard
                  label="Brake System"
                  value={implement.brakes}
                  icon={<Settings size={16} />}
                />
              )}
            </div>
          </div>

          {/* DYNAMIC ADDITIONAL SPECIFICATIONS GROUPED BY SECTION */}
          {groupedSpecs.length > 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-foreground flex items-center gap-2.5 px-2 text-2xl font-black">
                <Sparkles size={22} className="text-[var(--color-brand-orange)]" /> Additional
                Technical Specifications
              </h3>

              {groupedSpecs.map((group, gIdx) => (
                <div key={gIdx} className="spatial-panel flex flex-col gap-5 rounded-[2.5rem] p-8">
                  <h4 className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 text-lg font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-brand-green)]"></span>
                    {group.sectionName}
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-background flex flex-col justify-between gap-1.5 rounded-2xl border border-[var(--border-subtle)] p-4 shadow-sm transition-colors hover:border-[var(--color-brand-green)]/40"
                      >
                        <span className="text-muted text-[11px] font-extrabold tracking-wider uppercase">
                          {spec.name}
                        </span>
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="text-foreground text-base font-black tracking-tight">
                            {spec.value}
                          </span>
                          {spec.unit && (
                            <span className="rounded-md border border-[var(--color-brand-orange)]/20 bg-[var(--color-brand-orange)]/10 px-2 py-0.5 text-xs font-bold text-[var(--color-brand-orange)]">
                              {spec.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Price, Key Matrix & Compat Tractors */}
        <div className="flex w-full flex-col gap-8 lg:w-[42%]">
          {/* PRICE & HEADER SUMMARY CARD */}
          <div className="spatial-panel relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] p-8">
            <div className="flex items-center gap-2">
              {implement.brand?.name && (
                <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                  {implement.brand.name}
                </span>
              )}
              {implement.category?.name && (
                <span className="bg-foreground/5 text-muted rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold tracking-wider uppercase">
                  {implement.category.name}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-foreground text-3xl font-black tracking-tight md:text-4xl">
                {implement.brand?.name ? `${implement.brand.name} ` : ''}
                {implement.modelName}
              </h1>
              {implement.usageType && (
                <p className="text-muted mt-1 text-sm font-bold">
                  Primary Usage: <span className="text-foreground">{implement.usageType}</span>
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-orange)]/10 p-6">
              <span className="text-muted text-xs font-black tracking-widest uppercase">
                Estimated Starting Price
              </span>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-foreground text-3xl font-black tracking-tight md:text-4xl">
                  {priceFormatted}
                </span>
                <span className="text-muted text-[10px] font-bold tracking-wider uppercase">
                  Ex-Showroom Price
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-4 text-sm font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/30 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PhoneCall size={18} /> Contact Dealer / Get Best Price
              </button>

              <button
                onClick={handleShare}
                className="bg-background text-foreground flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] py-3.5 text-xs font-bold tracking-wider uppercase transition-colors hover:border-[var(--color-brand-green)]"
              >
                <Share2 size={16} /> Share Spec Sheet on WhatsApp
              </button>
            </div>
          </div>

          {/* KEY SPECIFICATIONS MATRIX */}
          <div className="spatial-panel flex flex-col gap-6 rounded-[2.5rem] p-8">
            <h3 className="text-foreground text-xl font-black">Key Specifications</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <Gauge size={18} />
                </div>
                <span className="text-muted text-[10px] font-bold tracking-wider uppercase">
                  Required HP
                </span>
                <span className="text-foreground text-lg font-black">
                  {hpDisplay || 'Standard'}
                </span>
              </div>

              <div className="bg-background flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
                  <Layers size={18} />
                </div>
                <span className="text-muted text-[10px] font-bold tracking-wider uppercase">
                  Working Width
                </span>
                <span className="text-foreground text-lg font-black">
                  {widthDisplay || 'Standard'}
                </span>
              </div>

              <div className="bg-background flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Weight size={18} />
                </div>
                <span className="text-muted text-[10px] font-bold tracking-wider uppercase">
                  Total Weight
                </span>
                <span className="text-foreground text-lg font-black">
                  {implement.weightKg ? `${implement.weightKg} Kg` : 'N/A'}
                </span>
              </div>

              <div className="bg-background flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Building2 size={18} />
                </div>
                <span className="text-muted text-[10px] font-bold tracking-wider uppercase">
                  Manufacturer
                </span>
                <span className="text-foreground truncate text-lg font-black">
                  {implement.brand?.name || 'Generic'}
                </span>
              </div>
            </div>
          </div>

          {/* COMPATIBLE TRACTORS LIST */}
          {implement.compatibleTractors && implement.compatibleTractors.length > 0 && (
            <div className="spatial-panel flex flex-col gap-6 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground flex items-center gap-2 text-xl font-black">
                  <Tractor size={20} className="text-[var(--color-brand-green)]" /> Compatible
                  Tractors
                </h3>
                <span className="text-muted bg-foreground/5 rounded-full px-2.5 py-1 text-xs font-bold">
                  {implement.compatibleTractors.length} Tractors
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {implement.compatibleTractors.map((t: any) => (
                  <Link
                    key={t.id}
                    href={`/tractors/${t.id}`}
                    className="bg-background group flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4 transition-colors hover:border-[var(--color-brand-green)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-foreground/5 flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-brand-green)]">
                        <Tractor size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                          {t.brand?.name}
                        </p>
                        <h4 className="text-foreground text-base font-black transition-colors group-hover:text-[var(--color-brand-green)]">
                          {t.modelName}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {t.hp && (
                        <span className="bg-foreground/5 text-foreground rounded-lg px-3 py-1 text-xs font-bold">
                          {t.hp} HP
                        </span>
                      )}
                      <ChevronRight
                        size={16}
                        className="text-muted transition-all group-hover:translate-x-1 group-hover:text-[var(--color-brand-green)]"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
