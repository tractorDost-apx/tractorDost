'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Shield,
  Calendar,
  Wrench,
  IndianRupee,
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
  Layers,
  Sparkles,
  Sliders,
  HelpCircle,
  Award,
  ThumbsUp,
  Check,
  MessageCircle,
} from 'lucide-react';
import { Tractor as TractorModel, TractorTeaser, tractorAPI } from '@/lib/api/tractors';
import { CompareFrequencyRecord } from '@/lib/api/compare';
import { useDetailAccess } from '@/hooks/leads/use-detail-access';
import { generateTractorBrochurePdf } from '@/lib/utils/tractorBrochurePdf';
import { GetPriceModal } from '@/components/leads/get-price-modal';

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

/**
 * Intelligent helper to prevent duplicate brand names like "Mahindra Mahindra Novo"
 */
const getCleanModelTitle = (brandName?: string | null, modelName?: string | null) => {
  if (!modelName) return brandName || '';
  if (!brandName) return modelName;
  const b = brandName.trim();
  const m = modelName.trim();
  if (m.toLowerCase().startsWith(b.toLowerCase())) {
    return m;
  }
  return `${b} ${m}`;
};

/**
 * Tractor details page client component.
 * High-performance mobile-first responsive layout matching automotive standards.
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
  const { state } = useDetailAccess(teaser.id, tractorAPI.getTractorById, 'TRACTOR');

  if (state.status === 'unavailable') {
    return (
      <div className="animate-fade-in relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-3.5 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-24">
        <Link
          href="/tractors"
          className="text-muted hover:text-foreground bg-background/50 mb-6 inline-flex w-max items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold shadow-sm backdrop-blur-md transition-colors"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <p className="text-muted py-24 text-center font-bold">This tractor is no longer available.</p>
      </div>
    );
  }

  const activeTractor = (state.status === 'granted' ? state.data : teaser) as TractorModel;

  return (
    <TractorDetailsView
      tractor={activeTractor}
      rivals={rivals}
      similarTractors={similarTractors}
    />
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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [brochureSuccess, setBrochureSuccess] = useState(false);
  const [brochureError, setBrochureError] = useState<string | null>(null);
  const [isGetPriceOpen, setIsGetPriceOpen] = useState(false);
  const [allSpecsExpanded, setAllSpecsExpanded] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [activeJumpSection, setActiveJumpSection] = useState('section-gallery');
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  // Clean full model name without duplicates
  const fullModelTitle = useMemo(
    () => getCleanModelTitle(tractor.brand?.name, tractor.modelName),
    [tractor.brand?.name, tractor.modelName]
  );

  useEffect(() => {
    if (!selectedState && tractor.priceByState && tractor.priceByState.length > 0) {
      setSelectedState(tractor.priceByState[0].state);
    }
  }, [tractor.priceByState, selectedState]);

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

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
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
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
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const priceText = formatPrice(tractor.exShowroomPriceMin);
    const hpText = tractor.hp ? `${tractor.hp} HP` : '';
    const cylinders = tractor.spec?.cylinders ? `${tractor.spec.cylinders} Cylinders` : '';
    const lift = tractor.spec?.liftingCapacityKg ? `${tractor.spec.liftingCapacityKg} Kg Lift` : '';
    const specs = [hpText, cylinders, lift].filter(Boolean).join(' • ');

    const text = [
      `*${fullModelTitle}*`,
      specs ? `*Specs:* ${specs}` : '',
      `*Price:* Starting at ${priceText}`,
      tractor.isFeatured ? '[Featured Model on TractorDost]' : '',
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

  // EMI Calculator Interactive States
  const basePriceForLoan = currentPriceObj?.onRoadPrice
    ? Number(currentPriceObj.onRoadPrice)
    : tractor.exShowroomPriceMin
    ? Number(tractor.exShowroomPriceMin)
    : 1000000;

  const [downPayment, setDownPayment] = useState<number>(Math.round(basePriceForLoan * 0.2));
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [interestRate, setInterestRate] = useState<number>(9.5);

  useEffect(() => {
    if (basePriceForLoan > 0) {
      setDownPayment(Math.round(basePriceForLoan * 0.2));
    }
  }, [basePriceForLoan]);

  const loanAmount = Math.max(0, basePriceForLoan - downPayment);
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const calculatedEmi =
    monthlyRate > 0 && totalMonths > 0
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : Math.round(loanAmount / totalMonths);
  const totalPayment = calculatedEmi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  // Key Quick Specs Matrix for clean mobile & desktop display
  const quickSpecs = [
    {
      icon: <Wrench size={16} />,
      label: 'Engine Power',
      value: tractor.hp ? `${tractor.hp} HP` : null,
      color: 'text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10',
    },
    {
      icon: <CheckCircle2 size={16} />,
      label: 'Cylinders',
      value: tractor.spec?.cylinders ? `${tractor.spec.cylinders} Cyl` : null,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: <TractorIcon size={16} />,
      label: 'Drive Type',
      value: tractor.driveType ? formatEnum(tractor.driveType) : null,
      color: 'text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/10',
    },
    {
      icon: <Layers size={16} />,
      label: 'Lifting Cap.',
      value: tractor.spec?.liftingCapacityKg ? `${tractor.spec.liftingCapacityKg} Kg` : null,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      icon: <Flame size={16} />,
      label: 'Engine CC',
      value: tractor.spec?.engineCc ? `${tractor.spec.engineCc} CC` : null,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      icon: <Percent size={16} />,
      label: 'PTO Power',
      value: tractor.spec?.ptoHp ? `${tractor.spec.ptoHp} HP` : tractor.spec?.gearboxType ? formatEnum(tractor.spec.gearboxType) : null,
      color: 'text-teal-500 bg-teal-500/10',
    },
  ].filter((s) => Boolean(s.value));

  // Implement Recommendations based on HP
  const implementRecommendations = useMemo(() => {
    const power = tractor.hp || 50;
    if (power >= 60) {
      return [
        {
          name: 'Rotavator',
          spec: '7 to 8 Feet (48 - 54 Blades)',
          desc: 'Superior deep pulverization in both dry and wet black soils in a single pass.',
          tag: 'High Output',
        },
        {
          name: 'Hydraulic Reversible MB Plough',
          spec: '3 to 4 Bottom Reversible',
          desc: 'Effortless deep plowing up to 14 inches with high fuel efficiency.',
          tag: 'Recommended',
        },
        {
          name: 'Heavy Duty Cultivator',
          spec: '11 to 13 Tynes Spring Loaded',
          desc: 'High speed soil aeration and hardpan breaking without engine strain.',
          tag: 'Best Match',
        },
        {
          name: 'Super Seeder & Straw Reaper',
          spec: '8 Feet Heavy Attachment',
          desc: 'Direct sowing and crop residue management without stubble burning.',
          tag: 'In Demand',
        },
        {
          name: 'Commercial Trolley / Trailer',
          spec: '10 to 14 Ton Tandem Axle',
          desc: 'Heavy sugarcane, grain, and gravel transport with dual-line braking.',
          tag: 'Haulage',
        },
        {
          name: 'Laser Land Leveller',
          spec: '8 to 10 Feet Bucket Bucket',
          desc: 'High precision laser grading for 30% water and fertilizer savings.',
          tag: 'Precision',
        },
      ];
    } else if (power >= 45) {
      return [
        {
          name: 'Rotavator',
          spec: '6 to 7 Feet (42 - 48 Blades)',
          desc: 'Fast and uniform soil preparation for cotton, sugarcane, and wheat crops.',
          tag: 'Recommended',
        },
        {
          name: 'MB Plough',
          spec: '2 to 3 Bottom Reversible Plough',
          desc: 'Easy inversion of soil with minimal wheel slip.',
          tag: 'Popular',
        },
        {
          name: 'Spring Loaded Cultivator',
          spec: '9 to 11 Tynes',
          desc: 'All-around secondary tillage and weed uprooting.',
          tag: 'Best Match',
        },
        {
          name: 'Multi-Crop Thresher',
          spec: 'High Output Haramba Thresher',
          desc: 'Direct PTO drive for wheat, soybean, and gram threshing.',
          tag: 'Seasonal',
        },
        {
          name: 'Tractor Trolley',
          spec: '6 to 8 Ton Hydraulic Tipping',
          desc: 'Standard farm haulage and Mandi transport.',
          tag: 'Haulage',
        },
      ];
    } else {
      return [
        {
          name: 'Rotavator',
          spec: '4 to 5.5 Feet (30 - 36 Blades)',
          desc: 'Compact tilling perfect for orchards, sugarcane inter-row, and vegetables.',
          tag: 'Recommended',
        },
        {
          name: 'Cultivator',
          spec: '7 to 9 Tynes Rigid / Spring',
          desc: 'Lightweight primary soil working with lowest diesel consumption.',
          tag: 'Best Match',
        },
        {
          name: 'Seed Drill',
          spec: '9 Row Automatic Seed Cum Fertilizer',
          desc: 'Accurate depth seed placement and uniform fertilizer dosing.',
          tag: 'Precision',
        },
        {
          name: 'Tipping Trailer',
          spec: '3 to 5 Ton Single Axle',
          desc: 'Easy manoeuvring in orchard tracks and narrow village roads.',
          tag: 'Haulage',
        },
      ];
    }
  }, [tractor.hp]);

  // Frequently Asked Questions
  const tractorFaqs = useMemo(() => {
    const stateName = selectedState || 'Maharashtra';
    const exPrice = formatPrice(tractor.exShowroomPriceMin);
    const onRoadPrice = currentPriceObj?.onRoadPrice
      ? `₹ ${Number(currentPriceObj.onRoadPrice).toLocaleString('en-IN')}`
      : exPrice;

    return [
      {
        q: `What is the on-road price of ${fullModelTitle} in ${stateName}?`,
        a: `The ex-showroom price of ${fullModelTitle} starts at ${exPrice}. The estimated on-road price in ${stateName} is approximately ${onRoadPrice}, which includes RTO registration, state taxes, 1-year comprehensive insurance, and dealer logistics charges. Contact our verified dealer for exact local subsidies and cash discounts.`,
      },
      {
        q: `What is the engine power (HP) and cylinder count of this tractor?`,
        a: `${fullModelTitle} delivers a high-torque ${tractor.hp ? `${tractor.hp} HP` : 'heavy duty'} engine power ${tractor.spec?.engineCc ? `with ${tractor.spec.engineCc} CC displacement` : ''} and ${tractor.spec?.cylinders ? `${tractor.spec.cylinders} cylinders` : ''}. It provides excellent fuel efficiency and long working hours without overheating.`,
      },
      {
        q: `What is the hydraulic lifting capacity of ${fullModelTitle}?`,
        a: `This model features a strong hydraulic lift capacity of ${tractor.spec?.liftingCapacityKg ? `${tractor.spec.liftingCapacityKg} Kg` : 'over 2000 Kg'}, engineered to handle heavy reversible MB ploughs, large rotavators, and laser levellers with automatic depth and draft control (ADDC).`,
      },
      {
        q: `Is finance and low-interest loan available for this model?`,
        a: `Yes! Up to 85% to 90% tractor loan financing is available with leading nationalized banks and recognized agricultural financial institutions at attractive interest rates. You can customize your down payment and tenure in our live EMI calculator above.`,
      },
      {
        q: `What warranty coverage is offered on ${fullModelTitle}?`,
        a: `${tractor.brand?.name || 'The manufacturer'} offers ${tractor.spec?.warrantyYears ? `${tractor.spec.warrantyYears} Years` : 'up to 5-6 Years'} or ${tractor.spec?.warrantyHours ? `${tractor.spec.warrantyHours} Hours` : 'comprehensive manufacturer'} warranty, backed by authorized service centers across India.`,
      },
    ];
  }, [fullModelTitle, selectedState, tractor, currentPriceObj]);

  // Synchronize active section tab on scroll
  useEffect(() => {
    const sectionIds = [
      'section-gallery',
      'section-quick-specs',
      'section-price-check',
      'section-emi-calc',
      'section-all-specs',
      'section-implements',
      'section-pros-cons',
      'section-competitors',
      'section-faqs',
    ];

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 130;
          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const el = document.getElementById(sectionIds[i]);
            if (el) {
              const top = el.offsetTop;
              if (scrollPos >= top) {
                setActiveJumpSection(sectionIds[i]);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveJumpSection(id);
    const el = document.getElementById(id);
    if (el) {
      const isMobile = window.innerWidth < 640;
      const yOffset = isMobile ? -110 : -130;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-3.5 sm:px-6 lg:px-8 pt-0 sm:pt-1 lg:pt-2 pb-28 sm:pb-32">
      {/* Breadcrumb Navigation Bar - Non-wrapping, spacious & elegant */}
      <div className="mb-2 sm:mb-3 flex items-center justify-between gap-2 border-b border-[var(--border-subtle)]/40 pb-1.5 sm:pb-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto text-[11px] sm:text-xs font-semibold text-muted no-scrollbar py-0.5 min-w-0 flex-1">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
          <ChevronRight size={11} className="shrink-0 text-muted/50" />
          <Link href="/tractors" className="hover:text-foreground transition-colors shrink-0">Tractors</Link>
          {tractor.brand?.name && (
            <>
              <ChevronRight size={11} className="shrink-0 text-muted/50" />
              <Link href={`/tractors?brand=${tractor.brandId}`} className="text-foreground font-bold shrink-0 hover:underline truncate max-w-[140px] sm:max-w-none">
                {tractor.brand.name}
              </Link>
            </>
          )}
        </nav>

        <Link
          href="/tractors"
          className="text-muted hover:text-foreground bg-background/80 hover:bg-background inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-bold shadow-2xs backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft size={11} />
          <span>Catalog</span>
        </Link>
      </div>

      {/* MOBILE TITLE & SPEC PILLS (Clean hierarchy, title first, single non-wrapping badges row) */}
      <div className="flex flex-col gap-1.5 lg:hidden mb-3">
        <h1 className="text-foreground text-xl sm:text-2xl font-black tracking-tight leading-tight">
          {fullModelTitle}
        </h1>

        {/* Clean single-line scrollable pills - full bleed breakout so zero clipping */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-[calc(100%+1.75rem)] -mx-3.5 px-3.5 scroll-smooth overscroll-x-contain">
          {tractor.brand?.name && (
            <Link
              href={`/tractors?brand=${tractor.brandId}`}
              className="rounded-full bg-[var(--color-brand-orange)]/10 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-orange)] uppercase hover:bg-[var(--color-brand-orange)]/20 transition-colors shrink-0"
            >
              {tractor.brand.name}
            </Link>
          )}
          {tractor.hp && (
            <span className="rounded-full bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase shrink-0">
              {tractor.hp} HP
            </span>
          )}
          {tractor.driveType && (
            <span className="rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-foreground/80 uppercase shrink-0">
              {formatEnum(tractor.driveType)}
            </span>
          )}
          {tractor.family?.name && (
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-blue-500 uppercase shrink-0">
              {tractor.family.name}
            </span>
          )}
          {tractor.launchStatus && (
            <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-[10px] font-bold text-muted uppercase shrink-0">
              {formatEnum(tractor.launchStatus)}
            </span>
          )}
        </div>
      </div>

      {/* QUICK SECTION JUMP TABS - Truly Edge-to-Edge Full Bleed Bar with Zero Right-Side Cutoff */}
      <div className="sticky top-[4.5rem] sm:top-[4.85rem] md:top-[5.25rem] z-30 w-[calc(100%+1.75rem)] -mx-3.5 sm:w-[calc(100%+3rem)] sm:-mx-6 lg:w-[calc(100%+4rem)] lg:-mx-8 py-2 mb-4 bg-background/95 dark:bg-[#0c100e]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-xs">
        <div className="mx-auto max-w-[1440px] px-3.5 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain">
          {[
            { id: 'section-gallery', label: 'Photos' },
            { id: 'section-quick-specs', label: 'Key Specs' },
            { id: 'section-price-check', label: 'On-Road Price' },
            { id: 'section-emi-calc', label: 'EMI Calc' },
            { id: 'section-all-specs', label: 'Detailed Specs' },
            { id: 'section-implements', label: 'Implements' },
            { id: 'section-pros-cons', label: 'Pros & Cons' },
            { id: 'section-competitors', label: 'Competitors' },
            { id: 'section-faqs', label: 'FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeJumpSection === tab.id
                  ? 'bg-[var(--color-brand-green)] text-white shadow-2xs font-black'
                  : 'bg-foreground/[0.04] text-muted hover:text-foreground hover:bg-foreground/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="w-2 shrink-0 sm:hidden" aria-hidden="true" />
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="flex flex-col gap-5 lg:gap-8 lg:flex-row items-start">
        {/* LEFT COLUMN: Gallery, Highlights, On-Road Check (mobile), Specs & Features */}
        <div className="flex w-full flex-col gap-5 sm:gap-7 lg:w-[60%]">
          {/* MEDIA GALLERY */}
          <div id="section-gallery" className="spatial-panel flex flex-col gap-2.5 sm:gap-4 rounded-2xl sm:rounded-[2.5rem] p-2.5 sm:p-4 scroll-mt-32">
            {/* Main Image Viewport */}
            <div className="from-foreground/5 group relative flex h-[230px] sm:h-[340px] md:h-[440px] w-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br to-transparent">
              {/* Top-Right Gallery Actions (Share & Video) */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5" ref={shareDropdownRef}>
                {tractor.videoUrl && (
                  <a
                    href={tractor.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-background/80 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--color-brand-orange)] shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-[var(--color-brand-orange)] hover:text-white"
                    title="Watch Video"
                  >
                    <Play size={14} className="ml-0.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  aria-expanded={isShareOpen}
                  aria-label="Share and Download"
                  className={`bg-background/80 text-foreground relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-[var(--color-brand-green)] hover:text-white ${
                    isShareOpen
                      ? 'bg-[var(--color-brand-green)] text-white shadow-md ring-2 ring-[var(--color-brand-green)]/30'
                      : ''
                  }`}
                  title="Share & Download Brochure"
                >
                  <Share2 size={14} />
                </button>

                {/* Share Dropdown Menu */}
                {isShareOpen && (
                  <div className="bg-background/95 border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-150 absolute top-10 right-0 z-50 w-64 origin-top-right rounded-2xl border p-2 shadow-2xl backdrop-blur-xl sm:w-72">
                    <div className="text-muted border-b border-[var(--border-subtle)]/60 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase">
                      Share & Download
                    </div>

                    <div className="mt-1 flex flex-col gap-1">
                      {/* WhatsApp Share */}
                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 cursor-pointer"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 transition-transform group-hover:scale-105 dark:text-emerald-400">
                          <WhatsAppIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-xs font-bold leading-snug">
                            Share via WhatsApp
                          </p>
                          <p className="text-muted text-[10px] leading-tight">
                            Send specs & price to friends
                          </p>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-muted transition-transform group-hover:translate-x-0.5"
                        />
                      </button>

                      <div className="bg-[var(--border-subtle)]/60 my-0.5 h-[1px] w-full" />

                      {/* Download Brochure */}
                      <button
                        type="button"
                        disabled={isGeneratingPdf}
                        onClick={handleDownloadBrochure}
                        className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[var(--color-brand-green)]/10 disabled:opacity-75 cursor-pointer"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] transition-transform group-hover:scale-105">
                          {isGeneratingPdf ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-[var(--color-brand-green)]"
                            />
                          ) : brochureSuccess ? (
                            <CheckCircle2
                              size={16}
                              className="text-[var(--color-brand-green)]"
                            />
                          ) : (
                            <Download size={16} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-xs font-bold leading-snug">
                            {brochureSuccess ? 'Brochure Downloaded!' : 'Download PDF Brochure'}
                          </p>
                          <p className="text-muted text-[10px] leading-tight">
                            {isGeneratingPdf
                              ? 'Generating PDF...'
                              : brochureSuccess
                              ? 'Saved to your device'
                              : 'Official spec sheet'}
                          </p>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-muted transition-transform group-hover:translate-x-0.5"
                        />
                      </button>

                      {brochureError && (
                        <p className="px-3 py-1.5 text-[11px] font-semibold text-red-500">
                          {brochureError}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Top-Left Featured Badge */}
              {tractor.isFeatured && (
                <div className="absolute top-2.5 left-2.5 z-10 rounded-full bg-[var(--color-brand-orange)] px-2.5 py-0.5 text-[9px] font-black tracking-widest text-white uppercase shadow-md">
                  Featured
                </div>
              )}

              {/* Main Media Rendering */}
              {activeMedia ? (
                activeMedia.mediaType === 'VIDEO' ? (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-black/10">
                    <Play size={44} className="text-[var(--color-brand-orange)] opacity-80" />
                  </div>
                ) : activeMedia.mediaType === 'PDF' ? (
                  <div className="bg-foreground/5 flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl">
                    <FileText size={44} className="text-muted" />
                    <span className="text-muted text-xs font-bold">PDF Document</span>
                  </div>
                ) : (
                  <img
                    src={activeMediaUrl}
                    alt={activeMedia.altText || fullModelTitle}
                    className="h-full w-full object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                )
              ) : (
                <TractorIcon className="text-foreground/20 h-24 w-24 sm:h-32 sm:w-32" strokeWidth={1} />
              )}

              {/* Photo Counter Badge */}
              {mediaList.length > 1 && (
                <div className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                  {activeMediaIndex + 1} / {mediaList.length}
                </div>
              )}

              {activeMedia?.caption && (
                <div className="pointer-events-none absolute right-0 bottom-2.5 left-0 text-center">
                  <span className="bg-background/80 rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-md">
                    {activeMedia.caption}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails Row - Edge-to-edge scrollable */}
            {mediaList.length > 1 && (
              <div className="flex w-[calc(100%+1.25rem)] -mx-2.5 px-2.5 sm:w-full sm:mx-0 sm:px-0 gap-2 overflow-x-auto pb-0.5 no-scrollbar scroll-smooth overscroll-x-contain">
                {mediaList.map((media, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative h-14 w-14 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      activeMediaIndex === idx
                        ? 'border-[var(--color-brand-green)] shadow-md ring-2 ring-[var(--color-brand-green)]/20 scale-95'
                        : 'border-[var(--border-subtle)] hover:border-[var(--color-brand-green)]/50 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {media.mediaType === 'VIDEO' ? (
                      <div className="flex h-full w-full items-center justify-center bg-black/10">
                        <Play size={18} className="text-[var(--color-brand-orange)]" />
                      </div>
                    ) : media.mediaType === 'PDF' ? (
                      <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                        <FileText size={18} className="text-muted" />
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
                <div className="w-1 shrink-0 sm:hidden" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* QUICK KEY SPECS STRIP */}
          {quickSpecs.length > 0 && (
            <div id="section-quick-specs" className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5 scroll-mt-32">
              {quickSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className="bg-background flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-[var(--border-subtle)] p-2 sm:p-2.5 text-center shadow-2xs hover:border-[var(--color-brand-green)]/40 transition-colors"
                >
                  <div className={`mb-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full ${spec.color}`}>
                    {spec.icon}
                  </div>
                  <span className="text-foreground text-xs sm:text-sm font-black leading-tight">
                    {spec.value}
                  </span>
                  <span className="text-muted text-[9px] sm:text-[10px] font-bold tracking-wider uppercase mt-0.5">
                    {spec.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* MOBILE ON-ROAD PRICING CARD (Visible on Mobile only) */}
          <div id="section-price-check" className="lg:hidden spatial-panel rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 border border-[var(--color-brand-green)]/20 shadow-md scroll-mt-32">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Ex-Showroom Price
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-[var(--color-brand-green)]">
                    {formatPrice(tractor.exShowroomPriceMin)}
                  </span>
                  {tractor.exShowroomPriceMax && Number(tractor.exShowroomPriceMax) > Number(tractor.exShowroomPriceMin) && (
                    <span className="text-xs font-bold text-muted">
                      - {formatPrice(tractor.exShowroomPriceMax)}
                    </span>
                  )}
                </div>
              </div>

              {tractor.financeAvailable && (
                <div className="flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-right">
                  <Percent size={11} className="text-blue-500 shrink-0" />
                  <span className="text-[10px] font-bold text-blue-500">
                    Easy EMI
                  </span>
                </div>
              )}
            </div>

            {/* State Pricing Selector */}
            {tractor.priceByState && tractor.priceByState.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-foreground">
                    <MapPin size={13} className="text-[var(--color-brand-orange)]" />
                    On-Road Price in:
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.04] px-3 py-2 pr-8 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none cursor-pointer"
                  >
                    {tractor.priceByState.map((p) => (
                      <option key={p.id || p.state} value={p.state}>
                        {p.state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>

                {currentPriceObj && (
                  <div className="rounded-xl bg-foreground/[0.03] p-2.5 flex flex-col gap-1.5 text-xs border border-black/5 dark:border-white/5">
                    <div className="flex justify-between text-muted text-[11px]">
                      <span>Ex-Showroom</span>
                      <span className="font-bold text-foreground">
                        ₹ {Number(currentPriceObj.exShowroom).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted text-[11px]">
                      <span>RTO & Registration</span>
                      <span className="font-bold text-foreground">
                        {currentPriceObj.rtoCharges ? `₹ ${Number(currentPriceObj.rtoCharges).toLocaleString('en-IN')}` : 'Included'}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted text-[11px]">
                      <span>Insurance (1 Year)</span>
                      <span className="font-bold text-foreground">
                        {currentPriceObj.insuranceEst ? `₹ ${Number(currentPriceObj.insuranceEst).toLocaleString('en-IN')}` : 'Included'}
                      </span>
                    </div>
                    {currentPriceObj.dealerCharges != null && (
                      <div className="flex justify-between text-muted text-[11px]">
                        <span>Dealer Charges</span>
                        <span className="font-bold text-foreground">
                          ₹ {Number(currentPriceObj.dealerCharges).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="h-[1px] bg-[var(--border-subtle)] my-0.5" />
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-foreground">Est. On-Road ({selectedState}):</span>
                      <span className="text-sm font-black text-[var(--color-brand-orange)]">
                        {currentPriceObj.onRoadPrice ? `₹ ${Number(currentPriceObj.onRoadPrice).toLocaleString('en-IN')}` : 'Contact Dealer'}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsGetPriceOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-2.5 text-xs font-black text-white shadow-md transition-all active:scale-98 hover:bg-[var(--color-brand-orange)] cursor-pointer mt-1"
                >
                  <span>Get Best On-Road Quote & Offers</span>
                  <ChevronRight size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted font-medium">
                  State pricing is updating. Connect with our verified dealer network for instant on-road quote.
                </p>
                <button
                  type="button"
                  onClick={() => setIsGetPriceOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-green)] py-2.5 text-xs font-black text-white shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>Request Price Quote</span>
                  <ChevronRight size={14} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* INTERACTIVE REAL-TIME EMI CALCULATOR WIDGET */}
          <div id="section-emi-calc" className="spatial-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-4 border border-blue-500/20 shadow-md scroll-mt-32">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <h3 className="text-foreground text-sm sm:text-base font-black">
                    Live Tractor Loan EMI Calculator
                  </h3>
                  <p className="text-muted text-[10px] sm:text-[11px] font-bold">
                    Adjust down payment & tenure to customize your monthly installment
                  </p>
                </div>
              </div>
            </div>

            {/* Result Highlight Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl bg-blue-500/5 border border-blue-500/15 p-3">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Monthly EMI
                </span>
                <span className="text-base sm:text-xl font-black text-[var(--color-brand-green)]">
                  ₹ {calculatedEmi.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-muted">/mo</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Loan Amount
                </span>
                <span className="text-xs sm:text-sm font-black text-foreground">
                  ₹ {loanAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Total Interest
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--color-brand-orange)]">
                  ₹ {totalInterest.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Down Payment Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Down Payment:</span>
                <span className="font-black text-blue-600 dark:text-blue-400">
                  ₹ {downPayment.toLocaleString('en-IN')} ({Math.round((downPayment / basePriceForLoan) * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min={Math.round(basePriceForLoan * 0.1)}
                max={Math.round(basePriceForLoan * 0.6)}
                step={10000}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full accent-[var(--color-brand-green)] cursor-pointer h-2 bg-foreground/10 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-muted font-bold">
                <span>Min: ₹ {Math.round(basePriceForLoan * 0.1 / 100000)}L</span>
                <span>Max: ₹ {Math.round(basePriceForLoan * 0.6 / 100000)}L</span>
              </div>
            </div>

            {/* Loan Tenure Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-foreground">Loan Tenure:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 4, 5, 7].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                      tenureYears === yr
                        ? 'bg-[var(--color-brand-green)] text-white shadow-2xs font-black'
                        : 'bg-foreground/[0.04] text-foreground/80 hover:bg-foreground/[0.08]'
                    }`}
                  >
                    {yr} Years
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Interest Rate (% p.a.):</span>
                <span className="font-black text-foreground">{interestRate}%</span>
              </div>
              <input
                type="range"
                min={8.0}
                max={14.0}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[var(--color-brand-orange)] cursor-pointer h-2 bg-foreground/10 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsGetPriceOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all active:scale-98 hover:shadow-lg cursor-pointer"
            >
              <IndianRupee size={16} className="shrink-0" />
              <span>Apply for Low Interest Tractor Loan</span>
              <ChevronRight size={14} className="shrink-0 opacity-80" strokeWidth={3} />
            </button>
          </div>

          {/* OVERVIEW & DETAILED SPECS */}
          <div className="spatial-panel flex flex-col gap-6 sm:gap-8 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-7 md:p-8">
            {/* 1. OVERVIEW */}
            {tractor.overview && (
              <div className="flex flex-col gap-2.5">
                <h3 className="text-foreground text-base sm:text-lg font-black">Overview</h3>
                <div
                  className={`text-muted text-xs sm:text-sm leading-relaxed font-medium transition-all ${
                    !showFullOverview && tractor.overview.length > 280 ? 'line-clamp-4' : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: tractor.overview }}
                />
                {tractor.overview.length > 280 && (
                  <button
                    type="button"
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    className="w-max text-xs font-bold text-[var(--color-brand-green)] hover:underline cursor-pointer"
                  >
                    {showFullOverview ? 'Show Less ↑' : 'Read Full Overview ↓'}
                  </button>
                )}
              </div>
            )}

            {/* 2. DETAILED SPECS */}
            <div id="section-all-specs" className="flex flex-col gap-4 sm:gap-5 scroll-mt-32">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-base sm:text-lg font-black">Detailed Specifications</h3>
                  <p className="text-muted text-[11px] font-bold">Official factory technical parameters</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllSpecsExpanded((prev) => !prev)}
                  className="rounded-lg bg-foreground/[0.04] px-2.5 py-1 text-xs font-bold text-[var(--color-brand-green)] hover:underline cursor-pointer"
                >
                  {allSpecsExpanded ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              {/* Accordions */}
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <AccordionSection
                  title="Engine & Performance"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  defaultOpen={true}
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
                  <SpecRow label="Engine Power" value={tractor.hp ? `${tractor.hp} HP` : undefined} />
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
                  title="Transmission & Gearbox"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
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

                <AccordionSection
                  title="Power Take Off (PTO)"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
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

                <AccordionSection
                  title="Hydraulics & Lifting"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
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

                <AccordionSection
                  title="Steering & Brakes"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
                  <SpecRow label="Steering Type" value={formatEnum(tractor.spec?.steeringType)} />
                  <SpecRow label="Brake Type" value={formatEnum(tractor.spec?.brakeType)} />
                  <SpecRow label="Parking Brake" value={formatEnum(tractor.spec?.parkingBrake)} />
                  <SpecRow label="Suspended Pedal" value={tractor.spec?.suspendedPedal} />
                  <SpecRow label="Steering Seat" value={tractor.spec?.steeringSeat} />
                </AccordionSection>

                <AccordionSection
                  title="Dimensions & Weight"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
                  <SpecRow label="Overall Length (mm)" value={tractor.spec?.overallLengthMm} />
                  <SpecRow label="Overall Width (mm)" value={tractor.spec?.overallWidthMm} />
                  <SpecRow label="Overall Height (mm)" value={tractor.spec?.overallHeightMm} />
                  <SpecRow label="Wheelbase (mm)" value={tractor.spec?.wheelbaseMm} />
                  <SpecRow label="Ground Clearance (mm)" value={tractor.spec?.groundClearanceMm} />
                  <SpecRow label="Turning Radius (m)" value={tractor.spec?.turningRadiusM} />
                  <SpecRow label="Total Weight (Kg)" value={tractor.spec?.totalWeightKg} />
                </AccordionSection>

                <AccordionSection
                  title="Tyres & Wheels"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
                  <SpecRow label="Front Tyre Size" value={tractor.spec?.frontTyreSize} />
                  <SpecRow label="Rear Tyre Size" value={tractor.spec?.rearTyreSize} />
                  <SpecRow label="Tyre Type" value={tractor.spec?.tyreType} />
                </AccordionSection>

                <AccordionSection
                  title="Fuel & Electrical"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
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
                    <AccordionSection
                      title="Electric Features"
                      titleColorClass="text-foreground dark:text-zinc-100 font-black"
                      forceOpen={allSpecsExpanded ? true : undefined}
                    >
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

                <AccordionSection
                  title="Maintenance & Service"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
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

                <AccordionSection
                  title="Comfort & Tech Features"
                  titleColorClass="text-foreground dark:text-zinc-100 font-black"
                  forceOpen={allSpecsExpanded ? true : undefined}
                >
                  <SpecRow label="AC Cabin" value={tractor.spec?.hasAcCabin} />
                  <SpecRow label="GPS" value={tractor.spec?.hasGps} />
                  <SpecRow label="TPMS" value={tractor.spec?.hasTpms} />
                  <SpecRow label="Connectivity" value={tractor.spec?.connectivity} />
                  <SpecRow label="Digital Display" value={formatEnum(tractor.spec?.digitalDisplay)} />
                </AccordionSection>
              </div>
            </div>

            {/* 3. IMPLEMENT COMPATIBILITY GUIDE */}
            <div id="section-implements" className="flex flex-col gap-3.5 border-t border-[var(--border-subtle)] pt-5 scroll-mt-32">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-base sm:text-lg font-black">
                    Suitable Farm Implements
                  </h3>
                  <p className="text-muted text-[11px] font-bold">
                    Tested machinery recommendations for {tractor.hp || 50} HP tractor
                  </p>
                </div>
                <Link
                  href="/implements"
                  className="text-xs font-bold text-[var(--color-brand-green)] hover:underline shrink-0"
                >
                  All Implements →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {implementRecommendations.map((imp, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3 flex flex-col justify-between hover:border-[var(--color-brand-green)]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-foreground">{imp.name}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                          {imp.tag}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {imp.spec}
                      </p>
                      <p className="text-[10px] text-muted leading-relaxed">
                        {imp.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. PROS & CONS */}
            {((tractor.pros && tractor.pros.length > 0) ||
              (tractor.cons && tractor.cons.length > 0) ||
              tractor.whyBuy) && (
              <div id="section-pros-cons" className="flex flex-col gap-5 border-t border-[var(--border-subtle)] pt-5 scroll-mt-32">
                {tractor.pros && Array.isArray(tractor.pros) && tractor.pros.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-foreground text-base sm:text-lg font-black">Pros & Highlights</h3>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {tractor.pros.map((pro: string, i: number) => (
                        <li
                          key={i}
                          className="bg-background flex items-start gap-2.5 rounded-xl border border-[var(--border-subtle)] p-3 shadow-2xs"
                        >
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                            <CheckCircle2 size={13} />
                          </div>
                          <span className="text-foreground text-xs leading-snug font-bold">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tractor.cons && Array.isArray(tractor.cons) && tractor.cons.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-foreground text-base sm:text-lg font-black">Points to Consider</h3>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {tractor.cons.map((con: string, i: number) => (
                        <li
                          key={i}
                          className="bg-background flex items-start gap-2.5 rounded-xl border border-[var(--border-subtle)] p-3 shadow-2xs"
                        >
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                            <XCircle size={13} />
                          </div>
                          <span className="text-foreground text-xs leading-snug font-bold">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tractor.whyBuy && (
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-foreground text-base sm:text-lg font-black">Why Buy This Tractor?</h3>
                    <div
                      className="text-muted bg-foreground/[0.03] rounded-xl border border-[var(--border-subtle)] p-3.5 sm:p-4 text-xs font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: tractor.whyBuy }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 5. TOP COMPETITORS */}
            {rivals.length > 0 && (
              <div id="section-competitors" className="flex flex-col gap-3.5 border-t border-[var(--border-subtle)] pt-5 scroll-mt-32">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-500/10">
                    <Flame size={16} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-base sm:text-lg font-black tracking-tight uppercase">
                      Top Competitors
                    </h3>
                    <p className="text-muted text-[10px] sm:text-[11px] font-bold">
                      Compare {fullModelTitle} with popular market rivals
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        className="bg-background group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] p-2.5 transition-all hover:border-[var(--color-brand-orange)]/40 hover:shadow-md"
                      >
                        <div className="from-foreground/5 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-1">
                          {compImage ? (
                            <img
                              src={compImage}
                              alt={competitor.modelName}
                              className="h-full w-full object-contain mix-blend-multiply transition-transform group-hover:scale-105 dark:mix-blend-normal"
                            />
                          ) : (
                            <TractorIcon className="text-muted h-7 w-7" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[9px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                            {competitor.brand?.name}
                          </p>
                          <h4 className="text-foreground truncate text-xs font-black">
                            {competitor.modelName}
                          </h4>
                          <p className="text-muted mt-0.5 text-[10px] font-bold">
                            {competitor.hp || '--'} HP {competitor.exShowroomPriceMin ? `• ₹${formatLakh(competitor.exShowroomPriceMin)}` : ''}
                          </p>
                        </div>
                        <div className="bg-foreground/5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-[var(--color-brand-orange)] italic transition-colors group-hover:bg-[var(--color-brand-orange)] group-hover:text-white">
                          VS
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. FAQS SECTION */}
            <div id="section-faqs" className="flex flex-col gap-3.5 border-t border-[var(--border-subtle)] pt-5 scroll-mt-32">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h3 className="text-foreground text-base sm:text-lg font-black">
                    Frequently Asked Questions (FAQ)
                  </h3>
                  <p className="text-muted text-[10px] sm:text-[11px] font-bold">
                    Common farmer inquiries on price, loan & performance
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {tractorFaqs.map((faq, idx) => (
                  <AccordionSection
                    key={idx}
                    title={faq.q}
                    titleColorClass="text-foreground font-black text-xs"
                    defaultOpen={idx === 0}
                  >
                    <div className="p-3.5 text-xs text-muted leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </AccordionSection>
                ))}
              </div>
            </div>

            {/* 7. EXPERT CONSULTATION & WHATSAPP ADVISORY */}
            <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground">
                    Have Questions on {tractor.brand?.name || ''} Tractors?
                  </h4>
                  <p className="text-[11px] text-muted">
                    Get free guidance on subsidy, dealership offers, and best suited models.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Sticky Information & Leads */}
        <div className="hidden lg:flex w-full lg:w-[40%] flex-col">
          <div className="spatial-panel group sticky top-24 flex flex-col gap-4 overflow-hidden rounded-[2.5rem] border border-[var(--color-brand-green)]/20 p-6 shadow-2xl">
            <div className="absolute top-0 right-0 -z-10 h-48 w-48 rounded-full bg-[var(--color-brand-orange)]/10 blur-[50px] transition-all duration-1000 group-hover:bg-[var(--color-brand-orange)]/20" />

            <div className="flex flex-col gap-1">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-[var(--color-brand-orange)]/10 px-2.5 py-0.5 text-[10px] font-black tracking-[0.2em] text-[var(--color-brand-orange)] uppercase">
                  {tractor.brand?.name}
                </span>
                {tractor.family?.name && (
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">
                    {tractor.family.name}
                  </span>
                )}
                {tractor.modelCode && (
                  <span className="text-muted border-muted rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-[0.2em] uppercase">
                    {tractor.modelCode}
                  </span>
                )}
                <span className="text-muted bg-foreground/5 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-[0.2em] uppercase">
                  {formatEnum(tractor.launchStatus)}
                </span>
              </div>
              <h1 className="text-foreground text-2xl xl:text-3xl leading-tight font-black tracking-tight">
                {fullModelTitle}
              </h1>
            </div>

            <div className="flex items-end justify-between border-y border-[var(--border-subtle)] py-3">
              <div>
                <p className="text-muted mb-0.5 text-[11px] font-black tracking-widest uppercase">
                  Ex-Showroom Price
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl xl:text-3xl font-black tracking-tight text-[var(--color-brand-green)]">
                    {formatPrice(tractor.exShowroomPriceMin)}
                  </span>
                  {tractor.exShowroomPriceMax &&
                    tractor.exShowroomPriceMin &&
                    Number(tractor.exShowroomPriceMax) > Number(tractor.exShowroomPriceMin) && (
                      <span className="text-muted text-base font-bold tracking-tight">
                        - {formatPrice(tractor.exShowroomPriceMax)}
                      </span>
                    )}
                </div>
              </div>
            </div>

            {tractor.financeAvailable && (
              <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-transparent px-3 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Percent size={13} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-foreground text-xs font-black">100% Finance Available</p>
                  <p className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Low Down Payment & Easy EMI
                  </p>
                </div>
              </div>
            )}

            {/* State Pricing Engine Widget */}
            <div className="bg-background flex flex-col gap-2.5 rounded-[1.5rem] border border-[var(--border-subtle)] p-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground flex items-center gap-1.5 text-xs font-black tracking-widest uppercase">
                  <MapPin size={14} className="text-[var(--color-brand-orange)]" /> On-Road Price Check
                </h3>
              </div>

              {tractor.priceByState && tractor.priceByState.length > 0 ? (
                <>
                  <div className="relative">
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="bg-foreground/5 text-foreground w-full cursor-pointer appearance-none rounded-xl border-none px-3 py-2 pr-8 text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                    >
                      {tractor.priceByState.map((p) => (
                        <option key={p.id || p.state} value={p.state}>
                          {p.state}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  </div>

                  {currentPriceObj && (
                    <div className="flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted font-bold">Ex-Showroom</span>
                        <span className="text-foreground font-black">
                          ₹ {Number(currentPriceObj.exShowroom).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted font-bold">RTO & Reg.</span>
                        <span className="text-foreground font-black">
                          {currentPriceObj.rtoCharges
                            ? `₹ ${Number(currentPriceObj.rtoCharges).toLocaleString('en-IN')}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted font-bold">Insurance</span>
                        <span className="text-foreground font-black">
                          {currentPriceObj.insuranceEst
                            ? `₹ ${Number(currentPriceObj.insuranceEst).toLocaleString('en-IN')}`
                            : 'N/A'}
                        </span>
                      </div>
                      {currentPriceObj.dealerCharges != null && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted font-bold">Dealer Charges</span>
                          <span className="text-foreground font-black">
                            ₹ {Number(currentPriceObj.dealerCharges).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="bg-foreground/10 my-0.5 h-[1px] w-full" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-black">
                          On-Road ({selectedState})
                        </span>
                        <span className="font-black text-[var(--color-brand-orange)] text-base">
                          {currentPriceObj.onRoadPrice
                            ? `₹ ${Number(currentPriceObj.onRoadPrice).toLocaleString('en-IN')}`
                            : 'N/A'}
                        </span>
                      </div>

                      {calculatedEmi && (
                        <div className="mt-1 flex items-center justify-between rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2">
                          <div className="flex items-center gap-1.5">
                            <IndianRupee
                              size={14}
                              className="text-[var(--color-brand-green)]"
                            />
                            <span className="text-[10px] font-black tracking-widest text-[var(--color-brand-green)] uppercase">
                              Est. EMI
                            </span>
                          </div>
                          <span className="text-foreground text-xs font-black">
                            ₹ {calculatedEmi.toLocaleString('en-IN')} / mo
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted text-xs font-bold">
                  Detailed state pricing currently not available for this model.
                </p>
              )}
            </div>

            {/* Lead Gen Button */}
            <button
              type="button"
              onClick={() => setIsGetPriceOpen(true)}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-3.5 text-sm font-black text-white shadow-[var(--color-brand-green)]/30 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[var(--color-brand-orange)] hover:shadow-[var(--color-brand-orange)]/40 cursor-pointer active:scale-98"
            >
              <span>Get Best Deal & Offers</span>
              <ChevronRight
                size={16}
                strokeWidth={3}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <p className="text-muted flex items-center justify-center gap-1.5 text-center text-[10px] font-bold">
              <Shield size={12} className="text-[var(--color-brand-green)]" /> 100% Verified Dealers & Secure Financing
            </p>
          </div>
        </div>
      </div>

      {/* SIMILAR TRACTORS SECTION */}
      {similarTractors.length > 0 && (
        <div className="mt-10 sm:mt-14 flex w-full flex-col gap-5 sm:gap-6 border-t border-[var(--panel-border)] pt-7 sm:pt-10">
          <div className="flex flex-col justify-between gap-2 sm:gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-foreground text-xl sm:text-2xl font-black tracking-tight">
                Similar Tractors from {tractor.brand?.name || 'Brand'}
              </h2>
              <p className="text-muted text-xs font-bold mt-0.5">
                Explore comparable tractors in this power class
              </p>
            </div>
            <Link
              href={`/tractors?brand=${tractor.brandId}`}
              className="flex items-center gap-1 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase transition-colors hover:text-[var(--color-brand-orange)]"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 pt-0.5 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible w-[calc(100%+1.75rem)] -mx-3.5 px-3.5 sm:w-full sm:mx-0 sm:px-0">
            {similarTractors.map((st) => {
              const stPrimaryImage =
                st.media && st.media.length > 0
                  ? st.media.find((m: any) => m.isPrimary)?.url || st.media[0].url
                  : null;

              return (
                <Link
                  key={st.id}
                  href={`/tractors/${st.slug || st.id}`}
                  className="spatial-card group bg-background relative flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/30 hover:shadow-lg w-[240px] shrink-0 snap-start md:w-auto"
                >
                  <div className="group/img relative mb-2.5 flex h-32 sm:h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-2">
                    {stPrimaryImage ? (
                      <img
                        src={stPrimaryImage}
                        alt={st.modelName}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover/img:scale-110"
                      />
                    ) : (
                      <TractorIcon className="text-foreground/20 h-12 w-12" strokeWidth={1} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <p className="text-[9px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                      {st.brand?.name}
                    </p>
                    <h3 className="text-foreground truncate text-sm sm:text-base font-black tracking-tight">
                      {st.modelName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      <span className="bg-foreground/5 rounded-md px-2 py-0.5">
                        {st.hp || '--'} HP
                      </span>
                      <span className="bg-foreground/5 rounded-md px-2 py-0.5">
                        {formatEnum(st.driveType)}
                      </span>
                    </div>
                    <div className="mt-2 border-t border-[var(--panel-border)] pt-2">
                      <p className="text-muted text-[9px] font-bold tracking-wider uppercase">
                        Starting Price
                      </p>
                      <p className="text-foreground text-sm font-black text-[var(--color-brand-green)]">
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

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="bg-background/95 fixed bottom-0 left-0 right-0 z-40 flex w-full items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-muted text-[9px] font-bold tracking-widest uppercase">
            Ex-Showroom
          </span>
          <span className="text-foreground text-base sm:text-lg leading-tight font-black text-[var(--color-brand-green)] truncate">
            {formatPrice(tractor.exShowroomPriceMin)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            aria-label="WhatsApp Enquiry"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-transform active:scale-95 cursor-pointer"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsGetPriceOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-md transition-all active:scale-95 hover:bg-[var(--color-brand-orange)] cursor-pointer"
          >
            <span>Get Best Deal</span>
            <ChevronRight size={13} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* GET PRICE & OFFERS LEAD MODAL */}
      <GetPriceModal
        isOpen={isGetPriceOpen}
        onClose={() => setIsGetPriceOpen(false)}
        targetType="TRACTOR"
        targetId={tractor.id}
        summary={{
          eyebrow: tractor.brand?.name || 'New Tractor',
          title: fullModelTitle,
          priceLabel: `Starting at ${formatPrice(tractor.exShowroomPriceMin)}`,
          imageUrl: primaryMedia?.url,
          chips: [
            tractor.hp ? `${tractor.hp} HP` : '',
            tractor.spec?.cylinders ? `${tractor.spec.cylinders} Cylinders` : '',
            tractor.driveType ? formatEnum(tractor.driveType) : '',
          ].filter(Boolean),
        }}
      />
    </div>
  );
}

function AccordionSection({
  title,
  children,
  titleColorClass,
  defaultOpen = false,
  forceOpen,
}: {
  title: string;
  children: React.ReactNode;
  titleColorClass: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  return (
    <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-[var(--border-subtle)] shadow-2xs transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-foreground/[0.03] hover:bg-foreground/[0.06] flex w-full items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3 transition-colors cursor-pointer text-left"
      >
        <h4 className={`text-xs font-black tracking-wider uppercase ${titleColorClass}`}>
          {title}
        </h4>
        <ChevronRight
          size={14}
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
    <div className="hover:bg-foreground/[0.02] flex items-center justify-between px-3.5 py-2 sm:px-5 sm:py-2.5 transition-colors">
      <span className="text-muted text-xs font-bold">{label}</span>
      <span className="text-foreground text-right text-xs font-black">{displayValue}</span>
    </div>
  );
}
