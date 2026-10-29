'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  CheckCircle2,
  Shield,
  Calendar,
  Wrench,
  CircleDollarSign,
  Share2,
  Flame,
  Star,
  Tractor as TractorIcon,
  ArrowLeft,
  Download,
  Play,
  Percent,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Tractor as TractorModel, TractorTeaser, tractorAPI } from '@/lib/api/tractors';
import { CompareFrequencyRecord } from '@/lib/api/compare';
import { useDetailAccess } from '@/hooks/leads/use-detail-access';
import { DetailAccessGate, DetailGateSummary } from '@/components/leads/detail-access-gate';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { generateTractorBrochurePdf } from '@/lib/utils/tractorBrochurePdf';

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const formatEnum = (val: string | undefined | null) => {
  if (!val) return '';
  return val
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatLakh = (price: number) =>
  price >= 100000 ? `${(price / 100000).toFixed(2)} Lakh` : price.toLocaleString('en-IN');

/** What the lead gate shows about the tractor. Only teaser fields, so nothing gated is shown. */
function tractorGateSummary(teaser: TractorTeaser): DetailGateSummary {
  const isImage = (m: { mediaType: string }) => m.mediaType !== 'VIDEO' && m.mediaType !== 'PDF';
  const image = teaser.media?.find((m) => m.isPrimary && isImage(m)) ?? teaser.media?.find(isImage);
  const price = Number(teaser.exShowroomPriceMin);
  const driveLabel = teaser.driveType === 'FOUR_WD' ? '4WD' : teaser.driveType === 'TWO_WD' ? '2WD' : null;

  return {
    eyebrow: teaser.brand?.name,
    title: teaser.modelName,
    imageUrl: image?.url ?? null,
    priceLabel: price ? `Ex-showroom from ₹ ${formatLakh(price)}` : 'Price on request',
    chips: [teaser.hp ? `${teaser.hp} HP` : null, driveLabel].filter((chip): chip is string => Boolean(chip)),
  };
}

/**
 * Full tractor details, behind the lead gate. The teaser is public. The full record loads from the API,
 * which answers 403 until the visitor is signed in or has submitted the enquiry for this tractor.
 */
export default function TractorDetailsClient({
  teaser,
  rivals,
  similarTractors,
}: {
  teaser: TractorTeaser;
  rivals: CompareFrequencyRecord[];
  similarTractors: TractorModel[];
}) {
  const { state, unlock } = useDetailAccess(teaser.id, tractorAPI.getTractorById, 'TRACTOR');

  if (state.status === 'granted') {
    return <TractorDetailsView tractor={state.data} rivals={rivals} similarTractors={similarTractors} />;
  }

  return (
    <div className="animate-fade-in relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pb-24 sm:px-6 lg:px-8">
      <Link
        href="/tractors"
        className="text-muted hover:text-foreground bg-background/50 mb-6 inline-flex w-max items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold shadow-sm backdrop-blur-md transition-colors"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {state.status === 'loading' && (
        <div className="flex justify-center py-24">
          <TractorLoader size={48} />
        </div>
      )}
      {state.status === 'locked' && (
        <DetailAccessGate
          targetType="TRACTOR"
          targetId={teaser.id}
          summary={tractorGateSummary(teaser)}
          onUnlock={unlock}
        />
      )}
      {state.status === 'unavailable' && (
        <p className="text-muted py-24 text-center font-bold">This tractor is no longer available.</p>
      )}
      {state.status === 'error' && (
        <p className="text-muted py-24 text-center font-bold">
          We could not load this tractor. Please refresh the page and try again.
        </p>
      )}
    </div>
  );
}

function TractorDetailsView({
  tractor,
  rivals,
  similarTractors,
}: {
  tractor: TractorModel;
  rivals: CompareFrequencyRecord[];
  similarTractors: TractorModel[];
}) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedState, setSelectedState] = useState<string>(
    tractor.priceByState?.[0]?.state || ''
  );

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [brochureSuccess, setBrochureSuccess] = useState(false);
  const [brochureError, setBrochureError] = useState<string | null>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(event.target as Node)
      ) {
        setIsShareOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShareOpen(false);
      }
    };

    if (isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShareOpen]);

  const handleShareWhatsApp = () => {
    if (!tractor) return;
    const url = window.location.href;
    const priceText = formatPrice(tractor.exShowroomPriceMin);
    const hpText = tractor.hp ? `${tractor.hp} HP` : '';
    const cylinders = tractor.spec?.cylinders ? `${tractor.spec.cylinders} Cylinders` : '';
    const lift = tractor.spec?.liftingCapacityKg ? `${tractor.spec.liftingCapacityKg} Kg Lift` : '';
    const specs = [hpText, cylinders, lift].filter(Boolean).join(' • ');

    const text = [
      `🚜 *${tractor.brand?.name || ''} ${tractor.modelName}*`,
      specs ? `⚡ *Specs:* ${specs}` : '',
      `💰 *Price:* Starting at ${priceText}`,
      tractor.isFeatured ? `⭐ Featured Model on TractorDost` : '',
      '',
      `Check out full specifications, features, photos & on-road pricing:`,
      url,
    ]
      .filter((line) => line !== '')
      .join('\n');

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsShareOpen(false);
  };

  const handleDownloadBrochure = async () => {
    if (isGeneratingPdf || !tractor) return;
    setIsGeneratingPdf(true);
    setBrochureError(null);
    setBrochureSuccess(false);

    try {
      await generateTractorBrochurePdf(tractor);
      setBrochureSuccess(true);
      setTimeout(() => {
        setBrochureSuccess(false);
        setIsShareOpen(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error generating tractor brochure:', err);
      setBrochureError('Failed to generate brochure. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const mediaList = tractor.media || [];
  const primaryMedia = mediaList.find((m) => m.isPrimary) || mediaList[0];
  const activeMedia = mediaList[activeMediaIndex] || primaryMedia;
  const activeMediaUrl = activeMedia?.url;

  const currentPriceObj = tractor.priceByState?.find((p) => p.state === selectedState);
  const emiEstimate = currentPriceObj?.onRoadPrice
    ? Math.round((Number(currentPriceObj.onRoadPrice) * 1.15) / 60)
    : null;

  return (
    <div className="animate-fade-in relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pb-24 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/tractors"
        className="text-muted hover:text-foreground bg-background/50 mb-6 inline-flex w-max items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold shadow-sm backdrop-blur-md transition-colors"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* LEFT COLUMN: Gallery & Main Specs */}
        <div className="flex w-full flex-col gap-8 lg:w-[60%]">
          {/* MEDIA GALLERY */}
          <div className="spatial-panel flex flex-col gap-4 rounded-[2.5rem] p-4">
            {/* Main Image */}
            <div className="from-foreground/5 group relative flex h-[400px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-gradient-to-br to-transparent md:h-[500px]">
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2" ref={shareDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  aria-expanded={isShareOpen}
                  aria-label="Share and Download"
                  className={`bg-background/80 text-foreground relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] shadow-sm backdrop-blur-md transition-all hover:bg-[var(--color-brand-green)] hover:text-white ${
                    isShareOpen
                      ? 'bg-[var(--color-brand-green)] text-white shadow-md ring-2 ring-[var(--color-brand-green)]/30'
                      : ''
                  }`}
                  title="Share & Download Brochure"
                >
                  <Share2 size={18} />
                </button>

                {/* Share Dropdown Menu */}
                {isShareOpen && (
                  <div className="bg-background/95 border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-150 absolute top-12 right-0 z-50 w-64 origin-top-right rounded-2xl border p-2 shadow-2xl backdrop-blur-xl sm:w-72">
                    <div className="text-muted border-b border-[var(--border-subtle)]/60 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase">
                      Share & Download
                    </div>

                    <div className="mt-1 flex flex-col gap-1">
                      {/* Option 1: WhatsApp */}
                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 transition-transform group-hover:scale-105 dark:text-emerald-400">
                          <WhatsAppIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-sm font-bold leading-snug">
                            WhatsApp
                          </p>
                          <p className="text-muted text-[11px] leading-tight">
                            Share details & page link
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-muted transition-transform group-hover:translate-x-0.5"
                        />
                      </button>

                      <div className="bg-[var(--border-subtle)]/60 my-0.5 h-[1px] w-full" />

                      {/* Option 2: Download Brochure */}
                      <button
                        type="button"
                        disabled={isGeneratingPdf}
                        onClick={handleDownloadBrochure}
                        className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[var(--color-brand-green)]/10 disabled:opacity-75"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] transition-transform group-hover:scale-105">
                          {isGeneratingPdf ? (
                            <Loader2
                              size={18}
                              className="animate-spin text-[var(--color-brand-green)]"
                            />
                          ) : brochureSuccess ? (
                            <CheckCircle2
                              size={18}
                              className="text-[var(--color-brand-green)]"
                            />
                          ) : (
                            <Download size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-sm font-bold leading-snug">
                            {brochureSuccess ? 'Brochure Downloaded!' : 'Download Brochure'}
                          </p>
                          <p className="text-muted text-[11px] leading-tight">
                            {isGeneratingPdf
                              ? 'Generating PDF brochure...'
                              : brochureSuccess
                              ? 'Brochure saved to device'
                              : 'Complete PDF specifications'}
                          </p>
                        </div>
                        {isGeneratingPdf ? (
                          <span className="text-[10px] font-bold text-[var(--color-brand-green)]">
                            PDF
                          </span>
                        ) : (
                          <ChevronRight
                            size={16}
                            className="text-muted transition-transform group-hover:translate-x-0.5"
                          />
                        )}
                      </button>

                      {brochureError && (
                        <p className="px-3 py-1.5 text-xs font-semibold text-red-500">
                          {brochureError}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {tractor.videoUrl && (
                  <a
                    href={tractor.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-background/80 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--color-brand-orange)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-brand-orange)] hover:text-white"
                    title="Watch Video"
                  >
                    <Play size={18} className="ml-1" />
                  </a>
                )}
              </div>
              {tractor.isFeatured && (
                <div className="absolute top-4 left-4 z-10 rounded-full bg-[var(--color-brand-orange)] px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md">
                  Featured
                </div>
              )}
              {activeMedia ? (
                activeMedia.mediaType === 'VIDEO' ? (
                  <div className="flex h-full w-full items-center justify-center rounded-[2rem] bg-black/10">
                    <Play size={64} className="text-[var(--color-brand-orange)] opacity-80" />
                  </div>
                ) : activeMedia.mediaType === 'PDF' ? (
                  <div className="bg-foreground/5 flex h-full w-full flex-col items-center justify-center gap-4 rounded-[2rem]">
                    <FileText size={64} className="text-muted" />
                    <span className="text-muted text-sm font-bold">PDF Document</span>
                  </div>
                ) : (
                  <img
                    src={activeMediaUrl}
                    alt={activeMedia.altText || tractor.modelName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )
              ) : (
                <TractorIcon className="text-foreground/20 h-32 w-32" strokeWidth={1} />
              )}

              {activeMedia?.caption && (
                <div className="pointer-events-none absolute right-0 bottom-4 left-0 text-center">
                  <span className="bg-background/80 rounded-full border border-[var(--border-subtle)] px-4 py-1.5 text-xs font-bold backdrop-blur-md">
                    {activeMedia.caption}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {mediaList.length > 1 && (
              <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-2">
                {mediaList.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                      activeMediaIndex === idx
                        ? 'border-[var(--color-brand-green)] shadow-md ring-2 ring-[var(--color-brand-green)]/20'
                        : 'border-[var(--border-subtle)] hover:border-[var(--color-brand-green)]/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {media.mediaType === 'VIDEO' ? (
                      <div className="flex h-full w-full items-center justify-center bg-black/10">
                        <Play size={24} className="text-[var(--color-brand-orange)]" />
                      </div>
                    ) : media.mediaType === 'PDF' ? (
                      <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                        <FileText size={24} className="text-muted" />
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt={media.altText || `Thumbnail ${idx}`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* OVERVIEW & SPECS & FEATURES */}
          <div className="spatial-panel flex flex-col gap-12 rounded-[2.5rem] p-8 md:p-10">
            {/* 1. OVERVIEW */}
            {tractor.overview && (
              <div className="flex flex-col gap-4">
                <h3 className="text-foreground text-xl font-black">Overview</h3>
                <div
                  className="text-muted text-lg leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: tractor.overview }}
                />
              </div>
            )}

            {/* 2. SPECS */}
            <div className="flex flex-col gap-8">
              {/* Quick Engine Matrix */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="bg-background flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                    <Wrench size={18} />
                  </div>
                  <span className="text-foreground text-lg font-black">
                    {tractor.hp || '--'} HP
                  </span>
                  <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Engine Power
                  </span>
                </div>
                {tractor.spec?.engineCc && (
                  <div className="bg-background flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-foreground text-lg font-black">
                      {tractor.spec?.engineCc} CC
                    </span>
                    <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
                      Displacement
                    </span>
                  </div>
                )}
                <div className="bg-background flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-foreground text-lg font-black">
                    {tractor.spec?.cylinders || '--'}
                  </span>
                  <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Cylinders
                  </span>
                </div>
                <div className="bg-background flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-foreground text-lg font-black">
                    {tractor.spec?.liftingCapacityKg || '--'} Kg
                  </span>
                  <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Lifting Cap.
                  </span>
                </div>
              </div>

              {/* Categories */}
              {tractor.categories && tractor.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tractor.categories.map((catItem: any, i: number) => (
                    <span
                      key={i}
                      className="bg-foreground/5 text-foreground rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold"
                    >
                      {catItem.category?.name || 'Category'}
                    </span>
                  ))}
                </div>
              )}

              {/* Deep Spec Table */}
              <div className="flex flex-col gap-6">
                <h3 className="text-foreground text-xl font-black">Detailed Specifications</h3>

                <AccordionSection
                  title="Engine & Performance"
                  titleColorClass="text-[var(--color-brand-green)]"
                  defaultOpen={true}
                >
                  <SpecRow label="Fuel Type" value={formatEnum(tractor.fuelType)} />
                  <SpecRow label="Emission Norm" value={formatEnum(tractor.emissionNorm)} />
                  <SpecRow
                    label="Engine CC"
                    value={tractor.spec?.engineCc ? `${tractor.spec?.engineCc} CC` : undefined}
                  />
                  <SpecRow label="Cylinders" value={tractor.spec?.cylinders} />
                  <SpecRow label="Rated RPM" value={tractor.spec?.ratedRpm} />
                  <SpecRow label="Max Torque (Nm)" value={tractor.spec?.maxTorqueNm} />
                  <SpecRow label="Cooling Type" value={formatEnum(tractor.spec?.coolingType)} />
                  <SpecRow label="Aspiration" value={tractor.spec?.aspiration} />
                  <SpecRow label="Air Filter Type" value={tractor.spec?.airFilterType} />
                  <SpecRow
                    label="Fuel Injection Type"
                    value={tractor.spec?.fuelInjectionType?.replace(/_/g, ' ')}
                  />
                  <SpecRow label="Governor Type" value={tractor.spec?.governorType} />
                  <SpecRow
                    label="Engine Oil Capacity (L)"
                    value={tractor.spec?.engineOilCapacityL}
                  />
                </AccordionSection>

                <AccordionSection
                  title="Transmission"
                  titleColorClass="text-[var(--color-brand-orange)]"
                >
                  <SpecRow label="Drive Type" value={formatEnum(tractor.driveType)} />
                  <SpecRow label="Gearbox Type" value={formatEnum(tractor.spec?.gearboxType)} />
                  <SpecRow label="Clutch Type" value={formatEnum(tractor.spec?.clutchType)} />
                  <SpecRow
                    label="Gears"
                    value={
                      tractor.spec?.forwardGears || tractor.spec?.reverseGears
                        ? `${tractor.spec?.forwardGears || 0}F + ${tractor.spec?.reverseGears || 0}R`
                        : undefined
                    }
                  />
                  <SpecRow label="Max Speed Fwd (Kmph)" value={tractor.spec?.maxSpeedFwdKmph} />
                  <SpecRow label="Max Speed Rev (Kmph)" value={tractor.spec?.maxSpeedRevKmph} />
                  <SpecRow label="Has Creeper" value={tractor.spec?.hasCreeper} />
                  <SpecRow label="Has Shuttle" value={tractor.spec?.hasShuttle} />
                  <SpecRow label="Differential Lock" value={tractor.spec?.differentialLock} />
                </AccordionSection>

                <AccordionSection title="Power Take Off (PTO)" titleColorClass="text-blue-500">
                  <SpecRow label="PTO Type" value={formatEnum(tractor.spec?.ptoType)} />
                  <SpecRow
                    label="PTO HP"
                    value={tractor.spec?.ptoHp ? `${tractor.spec?.ptoHp} HP` : undefined}
                  />
                  <SpecRow label="PTO RPM" value={tractor.spec?.ptoRpm} />
                  <SpecRow label="PTO RPM Options" value={tractor.spec?.ptoRpmOptions} />
                  <SpecRow
                    label="PTO Shaft Type"
                    value={tractor.spec?.ptoShaftType?.replace(/_/g, ' ')}
                  />
                </AccordionSection>

                <AccordionSection title="Hydraulics" titleColorClass="text-purple-500">
                  <SpecRow
                    label="Hydraulics Type"
                    value={formatEnum(tractor.spec?.hydraulicsType)}
                  />
                  <SpecRow
                    label="Lifting Capacity (Kg)"
                    value={
                      tractor.spec?.liftingCapacityKg
                        ? `${tractor.spec?.liftingCapacityKg} Kg`
                        : undefined
                    }
                  />
                  <SpecRow label="Pump Flow Rate (LPM)" value={tractor.spec?.pumpFlowRateLpm} />
                  <SpecRow label="Linkage Category" value={tractor.spec?.linkageCategory} />
                  <SpecRow label="Aux Hydraulic Ports" value={tractor.spec?.auxHydraulicPorts} />
                </AccordionSection>

                <AccordionSection title="Steering & Brakes" titleColorClass="text-rose-500">
                  <SpecRow label="Steering Type" value={formatEnum(tractor.spec?.steeringType)} />
                  <SpecRow label="Brake Type" value={formatEnum(tractor.spec?.brakeType)} />
                  <SpecRow label="Parking Brake" value={formatEnum(tractor.spec?.parkingBrake)} />
                  <SpecRow label="Suspended Pedal" value={tractor.spec?.suspendedPedal} />
                  <SpecRow label="Steering Seat" value={tractor.spec?.steeringSeat} />
                </AccordionSection>

                <AccordionSection title="Dimensions & Weight" titleColorClass="text-amber-500">
                  <SpecRow label="Overall Length (mm)" value={tractor.spec?.overallLengthMm} />
                  <SpecRow label="Overall Width (mm)" value={tractor.spec?.overallWidthMm} />
                  <SpecRow label="Overall Height (mm)" value={tractor.spec?.overallHeightMm} />
                  <SpecRow label="Wheelbase (mm)" value={tractor.spec?.wheelbaseMm} />
                  <SpecRow label="Ground Clearance (mm)" value={tractor.spec?.groundClearanceMm} />
                  <SpecRow label="Turning Radius (m)" value={tractor.spec?.turningRadiusM} />
                  <SpecRow label="Total Weight (Kg)" value={tractor.spec?.totalWeightKg} />
                </AccordionSection>

                <AccordionSection title="Tyres" titleColorClass="text-teal-500">
                  <SpecRow label="Front Tyre Size" value={tractor.spec?.frontTyreSize} />
                  <SpecRow label="Rear Tyre Size" value={tractor.spec?.rearTyreSize} />
                  <SpecRow label="Tyre Type" value={tractor.spec?.tyreType} />
                </AccordionSection>

                <AccordionSection title="Fuel & Electrical" titleColorClass="text-indigo-500">
                  <SpecRow label="Fuel Tank Capacity (L)" value={tractor.spec?.fuelTankCapacityL} />
                  <SpecRow
                    label="Fuel Consumption (Lph)"
                    value={tractor.spec?.fuelConsumptionLph}
                  />
                  <SpecRow label="Battery Voltage" value={tractor.spec?.batteryVoltage} />
                  <SpecRow label="Battery Ah" value={tractor.spec?.batteryAh} />
                  <SpecRow label="Alternator Amps" value={tractor.spec?.alternatorAmps} />
                </AccordionSection>

                {(tractor.fuelType === 'ELECTRIC' ||
                  tractor.spec?.batteryCapacityKwh ||
                  tractor.spec?.motorKw ||
                  tractor.spec?.chargingTimeHours ||
                  tractor.spec?.rangePerChargeKm) && (
                    <AccordionSection title="Electric Tractor" titleColorClass="text-lime-500">
                      <SpecRow
                        label="Battery Capacity (kWh)"
                        value={tractor.spec?.batteryCapacityKwh}
                      />
                      <SpecRow label="Motor kW" value={tractor.spec?.motorKw} />
                      <SpecRow
                        label="Charging Time (Hours)"
                        value={tractor.spec?.chargingTimeHours}
                      />
                      <SpecRow label="Range per Charge (km)" value={tractor.spec?.rangePerChargeKm} />
                    </AccordionSection>
                  )}

                <AccordionSection title="Maintenance & Service" titleColorClass="text-slate-500">
                  <SpecRow label="Warranty Years" value={tractor.spec?.warrantyYears} />
                  <SpecRow label="Warranty Hours" value={tractor.spec?.warrantyHours} />
                  <SpecRow label="First Service Hours" value={tractor.spec?.firstServiceHours} />
                  <SpecRow
                    label="Regular Service Interval (H)"
                    value={tractor.spec?.regularServiceIntervalH}
                  />
                  <SpecRow
                    label="Oil Change Interval (H)"
                    value={tractor.spec?.oilChangeIntervalH}
                  />
                  <SpecRow label="Fuel Pump" value={tractor.spec?.fuelPump} />
                  <SpecRow label="Engine Oil Spec" value={tractor.spec?.engineOilSpec} />
                  <SpecRow label="Coolant Type" value={tractor.spec?.coolantType} />
                  <SpecRow
                    label="Annual Service Cost Estimate"
                    value={
                      tractor.spec?.annualServiceCostEstimate
                        ? `₹${Number(tractor.spec.annualServiceCostEstimate).toLocaleString('en-IN')}`
                        : undefined
                    }
                  />
                </AccordionSection>

                <AccordionSection title="Optional Features" titleColorClass="text-fuchsia-500">
                  <SpecRow label="AC Cabin" value={tractor.spec?.hasAcCabin} />
                  <SpecRow label="GPS" value={tractor.spec?.hasGps} />
                  <SpecRow label="TPMS" value={tractor.spec?.hasTpms} />
                  <SpecRow label="Connectivity" value={tractor.spec?.connectivity} />
                  <SpecRow label="Display" value={formatEnum(tractor.spec?.digitalDisplay)} />
                </AccordionSection>
              </div>
            </div>

            {/* 3. FEATURES (PROS/CONS/WHY BUY) */}
            {((tractor.pros && tractor.pros.length > 0) ||
              (tractor.cons && tractor.cons.length > 0) ||
              tractor.whyBuy) && (
                <div className="flex flex-col gap-8">
                  {tractor.pros && Array.isArray(tractor.pros) && tractor.pros.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-foreground text-xl font-black">Pros</h3>
                      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {tractor.pros.map((pro: string, i: number) => (
                          <li
                            key={i}
                            className="bg-background flex items-start gap-3 rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm transition-shadow hover:shadow-md"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                              <CheckCircle2 size={16} />
                            </div>
                            <span className="text-foreground leading-snug font-bold">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tractor.cons && Array.isArray(tractor.cons) && tractor.cons.length > 0 && (
                    <div className="mt-2 flex flex-col gap-4">
                      <h3 className="text-foreground text-xl font-black">Cons</h3>
                      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {tractor.cons.map((con: string, i: number) => (
                          <li
                            key={i}
                            className="bg-background flex items-start gap-3 rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm transition-shadow hover:shadow-md"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                              <XCircle size={16} />
                            </div>
                            <span className="text-foreground leading-snug font-bold">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tractor.whyBuy && (
                    <div className="mt-2 flex flex-col gap-4">
                      <h3 className="text-foreground text-xl font-black">Why Buy This Tractor?</h3>
                      <div
                        className="text-muted bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-6 font-medium"
                        dangerouslySetInnerHTML={{ __html: tractor.whyBuy }}
                      />
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Information & Leads */}
        <div className="relative flex w-full flex-col gap-8 lg:w-[40%]">
          {/* "At a Glance" & Pricing Banner */}
          <div className="spatial-panel group sticky top-24 flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-[var(--color-brand-green)]/20 p-8 shadow-2xl md:p-10">
            <div className="absolute top-0 right-0 -z-10 h-48 w-48 rounded-full bg-[var(--color-brand-orange)]/10 blur-[50px] transition-all duration-1000 group-hover:bg-[var(--color-brand-orange)]/20" />

            <div className="flex flex-col gap-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--color-brand-orange)]/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-orange)] uppercase">
                  {tractor.brand?.name}
                </span>
                {tractor.family?.name && (
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">
                    {tractor.family.name}
                  </span>
                )}
                {tractor.modelCode && (
                  <span className="text-muted border-muted rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                    {tractor.modelCode}
                  </span>
                )}
                <span className="text-muted bg-foreground/5 rounded-full px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                  {formatEnum(tractor.launchStatus)}
                </span>
              </div>
              <h1 className="text-foreground text-4xl leading-tight font-black tracking-tight lg:text-5xl">
                {tractor.modelName}
              </h1>
            </div>

            <div className="flex items-end justify-between border-y border-[var(--border-subtle)] py-6">
              <div>
                <p className="text-muted mb-2 text-xs font-black tracking-widest uppercase">
                  Ex-Showroom Price
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black tracking-tight text-[var(--color-brand-green)]">
                    {formatPrice(tractor.exShowroomPriceMin)}
                  </span>
                  {tractor.exShowroomPriceMax &&
                    tractor.exShowroomPriceMin &&
                    Number(tractor.exShowroomPriceMax) > Number(tractor.exShowroomPriceMin) && (
                      <span className="text-muted text-lg font-bold tracking-tight">
                        - {formatPrice(tractor.exShowroomPriceMax)}
                      </span>
                    )}
                </div>
              </div>
            </div>

            {tractor.financeAvailable && (
              <div className="mt-1 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-transparent px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Percent size={16} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-foreground text-sm font-black">100% Finance Available</p>
                  <p className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Easy EMI Options
                  </p>
                </div>
              </div>
            )}

            {/* State Pricing Engine Widget */}
            <div className="bg-background flex flex-col gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-foreground flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <MapPin size={16} className="text-[var(--color-brand-orange)]" /> On-Road Price
                  Check
                </h3>
              </div>

              {tractor.priceByState && tractor.priceByState.length > 0 ? (
                <>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-foreground/5 text-foreground w-full cursor-pointer appearance-none rounded-xl border-none px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                  >
                    {tractor.priceByState.map((p) => (
                      <option key={p.id || p.state} value={p.state}>
                        {p.state}
                      </option>
                    ))}
                  </select>

                  {currentPriceObj && (
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted font-bold">Ex-Showroom</span>
                        <span className="text-foreground font-black">
                          ₹ {Number(currentPriceObj.exShowroom).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted font-bold">RTO & Reg.</span>
                        <span className="text-foreground font-black">
                          {currentPriceObj.rtoCharges
                            ? `₹ ${Number(currentPriceObj.rtoCharges).toLocaleString('en-IN')}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted font-bold">Insurance</span>
                        <span className="text-foreground font-black">
                          {currentPriceObj.insuranceEst
                            ? `₹ ${Number(currentPriceObj.insuranceEst).toLocaleString('en-IN')}`
                            : 'N/A'}
                        </span>
                      </div>
                      {currentPriceObj.dealerCharges != null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted font-bold">Dealer Charges</span>
                          <span className="text-foreground font-black">
                            ₹ {Number(currentPriceObj.dealerCharges).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="bg-foreground/10 my-1 h-[1px] w-full" />
                      <div className="flex items-center justify-between text-lg">
                        <span className="text-foreground font-black">
                          On-Road ({selectedState})
                        </span>
                        <span className="font-black text-[var(--color-brand-orange)]">
                          {currentPriceObj.onRoadPrice
                            ? `₹ ${Number(currentPriceObj.onRoadPrice).toLocaleString('en-IN')}`
                            : 'N/A'}
                        </span>
                      </div>

                      {emiEstimate && (
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-3">
                          <div className="flex items-center gap-2">
                            <CircleDollarSign
                              size={18}
                              className="text-[var(--color-brand-green)]"
                            />
                            <span className="text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                              Est. EMI
                            </span>
                          </div>
                          <span className="text-foreground text-base font-black">
                            ₹ {emiEstimate.toLocaleString('en-IN')} / mo
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted text-sm font-bold">
                  Detailed state pricing currently not available for this model.
                </p>
              )}
            </div>

            {/* Lead Gen Button */}
            <button className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-5 text-lg font-black text-white shadow-[var(--color-brand-green)]/30 shadow-lg transition-all hover:-translate-y-1 hover:bg-[var(--color-brand-orange)] hover:shadow-[var(--color-brand-orange)]/40">
              Get Best Deal{' '}
              <ChevronRight
                size={20}
                strokeWidth={3}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <p className="text-muted flex items-center justify-center gap-2 text-center text-xs font-bold">
              <Shield size={14} className="text-[var(--color-brand-green)]" /> 100% Verified Dealers
              & Secure Financing
            </p>
          </div>

          {/* Auto-Suggested Rivals */}
          {rivals.length > 0 && (
            <div className="spatial-panel relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <Flame size={20} className="animate-pulse text-red-500" />
                </div>
                <h3 className="text-foreground text-xl font-black tracking-tight uppercase">
                  Top Competitors
                </h3>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                {rivals.map((rival, i) => {
                  const isLeftMe = rival.tractorLeft?.id === tractor.id;
                  const competitor = isLeftMe ? rival.tractorRight : rival.tractorLeft;

                  if (!competitor) return null;

                  const compImage =
                    competitor.media?.find((m: any) => m.isPrimary)?.url ||
                    competitor.media?.[0]?.url;

                  return (
                    <Link
                      key={i}
                      href={`/compare?ids=${tractor.id},${competitor.id}`}
                      className="bg-background group flex items-center gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-orange)]/30 hover:shadow-lg"
                    >
                      <div className="from-foreground/5 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-2">
                        {compImage ? (
                          <img
                            src={compImage}
                            alt={competitor.modelName}
                            className="h-full w-full object-contain mix-blend-multiply transition-transform group-hover:scale-110 dark:mix-blend-normal"
                          />
                        ) : (
                          <TractorIcon className="text-muted h-8 w-8" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                          {competitor.brand?.name}
                        </p>
                        <h4 className="text-foreground truncate text-sm font-black">
                          {competitor.modelName}
                        </h4>
                        <p className="text-muted mt-1 text-[11px] font-bold">
                          {competitor.hp || '--'} HP
                        </p>
                      </div>
                      <div className="bg-foreground/5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-[var(--color-brand-orange)] italic transition-colors group-hover:bg-[var(--color-brand-orange)] group-hover:text-white">
                        VS
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Tractors Section */}
      {similarTractors.length > 0 && (
        <div className="mt-16 flex w-full flex-col gap-8 border-t border-[var(--panel-border)] pt-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-foreground text-3xl font-black tracking-tight">
                Similar Tractors
              </h2>
              <p className="text-muted mt-2 font-bold">
                Compare other powerful options from {tractor.brand?.name}
              </p>
            </div>
            <Link
              href={`/tractors?brand=${tractor.brandId}`}
              className="flex items-center gap-1 text-sm font-black tracking-widest text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)]"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similarTractors.map((st) => {
              const stPrimaryImage =
                st.media && st.media.length > 0
                  ? st.media.find((m: any) => m.isPrimary)?.url || st.media[0].url
                  : null;

              return (
                <Link
                  key={st.id}
                  href={`/tractors/${st.slug || st.id}`}
                  className="spatial-card group bg-background relative flex cursor-pointer flex-col overflow-hidden rounded-[2.5rem] p-5 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-brand-green)]/30 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)]"
                >
                  <div className="group/img relative mb-4 flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-foreground/5">
                    {stPrimaryImage ? (
                      <img
                        src={stPrimaryImage}
                        alt={st.modelName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                      />
                    ) : (
                      <TractorIcon className="text-foreground/20 h-16 w-16" strokeWidth={1} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 px-2">
                    <p className="text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-green)] uppercase">
                      {st.brand?.name}
                    </p>
                    <h3 className="text-foreground truncate text-xl font-black tracking-tight">
                      {st.modelName}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="bg-foreground/5 rounded-md px-2 py-1">
                        {st.hp || '--'} HP
                      </span>
                      <span className="bg-foreground/5 rounded-md px-2 py-1">
                        {formatEnum(st.driveType)}
                      </span>
                    </div>
                    <div className="mt-3 border-t border-[var(--panel-border)] pt-3">
                      <p className="text-muted mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                        Starting Price
                      </p>
                      <p className="text-foreground text-lg font-black">
                        {formatPrice(st.exShowroomPriceMin)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="bg-background/90 fixed bottom-0 left-0 z-50 flex w-full items-center justify-between border-t border-[var(--border-subtle)] p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:hidden">
        <div className="flex flex-col">
          <span className="text-muted text-[10px] font-bold tracking-widest uppercase">
            Starting at
          </span>
          <span className="text-foreground text-lg leading-none font-black">
            {formatPrice(tractor.exShowroomPriceMin)}
          </span>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 font-black text-white shadow-lg transition-colors hover:bg-[var(--color-brand-orange)]">
          Get Best Deal <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function AccordionSection({
  title,
  children,
  titleColorClass,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  titleColorClass: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-foreground/5 hover:bg-foreground/10 flex w-full items-center justify-between px-6 py-4 transition-colors"
      >
        <h4 className={`text-xs font-black tracking-widest uppercase ${titleColorClass}`}>
          {title}
        </h4>
        <ChevronRight
          size={16}
          className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="divide-foreground/5 bg-background flex flex-col divide-y overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: any }) {
  if (value === undefined || value === null || value === '' || value === 'null') return null;
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className="hover:bg-foreground/5 flex items-center justify-between px-6 py-4 transition-colors">
      <span className="text-muted text-sm font-bold">{label}</span>
      <span className="text-foreground text-right text-sm font-black">{displayValue}</span>
    </div>
  );
}
