'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, MapPin, CheckCircle2, Shield, Calendar, Wrench, CircleDollarSign, Share2, Flame, Star, Tractor as TractorIcon, ArrowLeft, Download, Play, Percent, XCircle, FileText } from 'lucide-react';
import { Tractor as TractorModel } from '@/lib/api/tractors';
import { CompareFrequencyRecord } from '@/lib/api/compare';

const formatEnum = (val: string | undefined | null) => {
  if (!val) return '';
  return val.replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
};

export default function TractorDetailsClient({ 
  tractor, 
  rivals, 
  similarTractors 
}: { 
  tractor: TractorModel;
  rivals: CompareFrequencyRecord[];
  similarTractors: TractorModel[];
}) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedState, setSelectedState] = useState<string>(tractor.priceByState?.[0]?.state || '');

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on Request';
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const handleShare = () => {
    if (!tractor) return;
    const text = `Check out the ${tractor.brand?.name} ${tractor.modelName} on TractorDost! Starting at ${formatPrice(tractor.exShowroomPriceMin)}.`;
    const url = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const mediaList = tractor.media || [];
  const primaryMedia = mediaList.find(m => m.isPrimary) || mediaList[0];
  const activeMedia = mediaList[activeMediaIndex] || primaryMedia;
  const activeMediaUrl = activeMedia?.url;
  
  const currentPriceObj = tractor.priceByState?.find(p => p.state === selectedState);
  const emiEstimate = currentPriceObj?.onRoadPrice ? Math.round((Number(currentPriceObj.onRoadPrice) * 1.15) / 60) : null;

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-screen flex flex-col pt-6 pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      
      {/* Back button */}
      <Link href="/tractors" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors font-bold text-sm mb-6 w-max bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-subtle)] shadow-sm">
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: Gallery & Main Specs */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8">
          
          {/* MEDIA GALLERY */}
          <div className="spatial-panel rounded-[2.5rem] p-4 flex flex-col gap-4">
             {/* Main Image */}
              <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-foreground/5 to-transparent rounded-[2rem] border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button onClick={handleShare} className="w-10 h-10 bg-background/80 backdrop-blur-md border border-[var(--border-subtle)] text-foreground rounded-full flex items-center justify-center hover:bg-[var(--color-brand-green)] hover:text-white transition-colors shadow-sm" title="Share via WhatsApp">
                    <Share2 size={18} />
                  </button>
                  {(tractor.brochurePdf || tractor.media?.find((m: any) => m.mediaType === 'PDF')?.url) && (
                    <a href={tractor.brochurePdf || tractor.media?.find((m: any) => m.mediaType === 'PDF')?.url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-background/80 backdrop-blur-md border border-[var(--border-subtle)] text-foreground rounded-full flex items-center justify-center hover:bg-[var(--color-brand-green)] hover:text-white transition-colors shadow-sm" title="Download Brochure">
                      <Download size={18} />
                    </a>
                  )}
                  {tractor.videoUrl && (
                    <a href={tractor.videoUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-background/80 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--color-brand-orange)] rounded-full flex items-center justify-center hover:bg-[var(--color-brand-orange)] hover:text-white transition-colors shadow-sm" title="Watch Video">
                      <Play size={18} className="ml-1" />
                    </a>
                  )}
                </div>
                {tractor.isFeatured && (
                  <div className="absolute top-4 left-4 z-10 bg-[var(--color-brand-orange)] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                    Featured
                  </div>
                )}
                {activeMedia ? (
                  activeMedia.mediaType === 'VIDEO' ? (
                     <div className="w-full h-full flex items-center justify-center bg-black/10 rounded-[2rem]">
                       <Play size={64} className="text-[var(--color-brand-orange)] opacity-80" />
                     </div>
                  ) : activeMedia.mediaType === 'PDF' ? (
                     <div className="w-full h-full flex flex-col gap-4 items-center justify-center bg-foreground/5 rounded-[2rem]">
                       <FileText size={64} className="text-muted" />
                       <span className="text-sm font-bold text-muted">PDF Document</span>
                     </div>
                  ) : (
                    <img 
                      src={activeMediaUrl} 
                      alt={activeMedia.altText || tractor.modelName} 
                      className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500 relative z-0 mix-blend-multiply dark:mix-blend-normal" 
                    />
                  )
                ) : (
                  <TractorIcon className="w-32 h-32 text-foreground/20" strokeWidth={1} />
                )}
                
                {activeMedia?.caption && (
                  <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <span className="bg-background/80 backdrop-blur-md text-xs font-bold px-4 py-1.5 rounded-full border border-[var(--border-subtle)]">{activeMedia.caption}</span>
                  </div>
                )}
             </div>

             {/* Thumbnails */}
             {mediaList.length > 1 && (
               <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                 {mediaList.map((media, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveMediaIndex(idx)}
                     className={`w-24 h-24 flex-shrink-0 rounded-[1rem] border-2 transition-all p-2 bg-gradient-to-br from-foreground/5 to-transparent ${activeMediaIndex === idx ? 'border-[var(--color-brand-green)] shadow-md shadow-[var(--color-brand-green)]/20' : 'border-transparent hover:border-foreground/20'}`}
                   >
                     {media.mediaType === 'VIDEO' ? (
                        <div className="w-full h-full flex items-center justify-center"><Play size={24} className="text-[var(--color-brand-orange)]" /></div>
                     ) : media.mediaType === 'PDF' ? (
                        <div className="w-full h-full flex items-center justify-center"><FileText size={24} className="text-muted" /></div>
                     ) : (
                       <img src={media.url} alt={media.altText || `Thumbnail ${idx}`} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                     )}
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* OVERVIEW & SPECS & FEATURES */}
          <div className="spatial-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-12">

             {/* 1. OVERVIEW */}
             {tractor.overview && (
               <div className="flex flex-col gap-4">
                 <h3 className="text-xl font-black text-foreground">Overview</h3>
                 <div className="text-muted font-medium leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: tractor.overview }} />
               </div>
             )}

             {/* 2. SPECS */}
             <div className="flex flex-col gap-8">
                 {/* Quick Engine Matrix */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] flex items-center justify-center mb-2"><Wrench size={18}/></div>
                       <span className="text-lg font-black text-foreground">{tractor.hp || '--'} HP</span>
                       <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Engine Power</span>
                    </div>
                    {tractor.spec?.engineCc && (
                      <div className="bg-background border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                         <div className="w-10 h-10 rounded-full bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)] flex items-center justify-center mb-2"><CheckCircle2 size={18}/></div>
                         <span className="text-lg font-black text-foreground">{tractor.spec?.engineCc} CC</span>
                         <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Displacement</span>
                      </div>
                    )}
                    <div className="bg-background border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2"><CheckCircle2 size={18}/></div>
                       <span className="text-lg font-black text-foreground">{tractor.spec?.cylinders || '--'}</span>
                       <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Cylinders</span>
                    </div>
                    <div className="bg-background border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2"><CheckCircle2 size={18}/></div>
                       <span className="text-lg font-black text-foreground">{tractor.spec?.liftingCapacityKg || '--'} Kg</span>
                       <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Lifting Cap.</span>
                    </div>
                 </div>
                 
                 {/* Categories */}
                 {tractor.categories && tractor.categories.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                     {tractor.categories.map((catItem: any, i: number) => (
                       <span key={i} className="px-3 py-1 bg-foreground/5 text-foreground text-xs font-bold rounded-lg border border-[var(--border-subtle)]">
                         {catItem.category?.name || 'Category'}
                       </span>
                     ))}
                   </div>
                 )}

                 {/* Deep Spec Table */}
                 <div className="flex flex-col gap-6">
                    <h3 className="text-xl font-black text-foreground">Detailed Specifications</h3>
                    
                    <AccordionSection title="Engine & Performance" titleColorClass="text-[var(--color-brand-green)]" defaultOpen={true}>
                        <SpecRow label="Fuel Type" value={formatEnum(tractor.fuelType)} />
                        <SpecRow label="Emission Norm" value={formatEnum(tractor.emissionNorm)} />
                        <SpecRow label="Engine CC" value={tractor.spec?.engineCc ? `${tractor.spec?.engineCc} CC` : undefined} />
                        <SpecRow label="Cylinders" value={tractor.spec?.cylinders} />
                        <SpecRow label="Rated RPM" value={tractor.spec?.ratedRpm} />
                        <SpecRow label="Max Torque (Nm)" value={tractor.spec?.maxTorqueNm} />
                        <SpecRow label="Cooling Type" value={formatEnum(tractor.spec?.coolingType)} />
                        <SpecRow label="Aspiration" value={tractor.spec?.aspiration} />
                        <SpecRow label="Air Filter Type" value={tractor.spec?.airFilterType} />
                        <SpecRow label="Fuel Injection Type" value={tractor.spec?.fuelInjectionType?.replace(/_/g, ' ')} />
                        <SpecRow label="Governor Type" value={tractor.spec?.governorType} />
                        <SpecRow label="Engine Oil Capacity (L)" value={tractor.spec?.engineOilCapacityL} />
                    </AccordionSection>

                    <AccordionSection title="Transmission" titleColorClass="text-[var(--color-brand-orange)]">
                        <SpecRow label="Drive Type" value={formatEnum(tractor.driveType)} />
                        <SpecRow label="Gearbox Type" value={formatEnum(tractor.spec?.gearboxType)} />
                        <SpecRow label="Clutch Type" value={formatEnum(tractor.spec?.clutchType)} />
                        <SpecRow label="Gears" value={(tractor.spec?.forwardGears || tractor.spec?.reverseGears) ? `${tractor.spec?.forwardGears || 0}F + ${tractor.spec?.reverseGears || 0}R` : undefined} />
                        <SpecRow label="Max Speed Fwd (Kmph)" value={tractor.spec?.maxSpeedFwdKmph} />
                        <SpecRow label="Max Speed Rev (Kmph)" value={tractor.spec?.maxSpeedRevKmph} />
                        <SpecRow label="Has Creeper" value={tractor.spec?.hasCreeper} />
                        <SpecRow label="Has Shuttle" value={tractor.spec?.hasShuttle} />
                        <SpecRow label="Differential Lock" value={tractor.spec?.differentialLock} />
                    </AccordionSection>

                    <AccordionSection title="Power Take Off (PTO)" titleColorClass="text-blue-500">
                        <SpecRow label="PTO Type" value={formatEnum(tractor.spec?.ptoType)} />
                        <SpecRow label="PTO HP" value={tractor.spec?.ptoHp ? `${tractor.spec?.ptoHp} HP` : undefined} />
                        <SpecRow label="PTO RPM" value={tractor.spec?.ptoRpm} />
                        <SpecRow label="PTO RPM Options" value={tractor.spec?.ptoRpmOptions} />
                        <SpecRow label="PTO Shaft Type" value={tractor.spec?.ptoShaftType?.replace(/_/g, ' ')} />
                    </AccordionSection>

                    <AccordionSection title="Hydraulics" titleColorClass="text-purple-500">
                        <SpecRow label="Hydraulics Type" value={formatEnum(tractor.spec?.hydraulicsType)} />
                        <SpecRow label="Lifting Capacity (Kg)" value={tractor.spec?.liftingCapacityKg ? `${tractor.spec?.liftingCapacityKg} Kg` : undefined} />
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
                        <SpecRow label="Fuel Consumption (Lph)" value={tractor.spec?.fuelConsumptionLph} />
                        <SpecRow label="Battery Voltage" value={tractor.spec?.batteryVoltage} />
                        <SpecRow label="Battery Ah" value={tractor.spec?.batteryAh} />
                        <SpecRow label="Alternator Amps" value={tractor.spec?.alternatorAmps} />
                    </AccordionSection>

                    {(tractor.fuelType === 'ELECTRIC' || tractor.spec?.batteryCapacityKwh || tractor.spec?.motorKw || tractor.spec?.chargingTimeHours || tractor.spec?.rangePerChargeKm) && (
                    <AccordionSection title="Electric Tractor" titleColorClass="text-lime-500">
                        <SpecRow label="Battery Capacity (kWh)" value={tractor.spec?.batteryCapacityKwh} />
                        <SpecRow label="Motor kW" value={tractor.spec?.motorKw} />
                        <SpecRow label="Charging Time (Hours)" value={tractor.spec?.chargingTimeHours} />
                        <SpecRow label="Range per Charge (km)" value={tractor.spec?.rangePerChargeKm} />
                    </AccordionSection>
                    )}

                    <AccordionSection title="Maintenance & Service" titleColorClass="text-slate-500">
                        <SpecRow label="Warranty Years" value={tractor.spec?.warrantyYears} />
                        <SpecRow label="Warranty Hours" value={tractor.spec?.warrantyHours} />
                        <SpecRow label="First Service Hours" value={tractor.spec?.firstServiceHours} />
                        <SpecRow label="Regular Service Interval (H)" value={tractor.spec?.regularServiceIntervalH} />
                        <SpecRow label="Oil Change Interval (H)" value={tractor.spec?.oilChangeIntervalH} />
                        <SpecRow label="Fuel Pump" value={tractor.spec?.fuelPump} />
                        <SpecRow label="Engine Oil Spec" value={tractor.spec?.engineOilSpec} />
                        <SpecRow label="Coolant Type" value={tractor.spec?.coolantType} />
                        <SpecRow label="Annual Service Cost Estimate" value={tractor.spec?.annualServiceCostEstimate ? `₹${Number(tractor.spec.annualServiceCostEstimate).toLocaleString('en-IN')}` : undefined} />
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
             {((tractor.pros && tractor.pros.length > 0) || (tractor.cons && tractor.cons.length > 0) || tractor.whyBuy) && (
               <div className="flex flex-col gap-8">
                 {tractor.pros && Array.isArray(tractor.pros) && tractor.pros.length > 0 && (
                   <div className="flex flex-col gap-4">
                     <h3 className="text-xl font-black text-foreground">Pros</h3>
                     <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {tractor.pros.map((pro: string, i: number) => (
                         <li key={i} className="flex items-start gap-3 bg-background border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                           <div className="w-8 h-8 rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={16}/></div>
                           <span className="font-bold text-foreground leading-snug">{pro}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {tractor.cons && Array.isArray(tractor.cons) && tractor.cons.length > 0 && (
                   <div className="flex flex-col gap-4 mt-2">
                     <h3 className="text-xl font-black text-foreground">Cons</h3>
                     <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {tractor.cons.map((con: string, i: number) => (
                         <li key={i} className="flex items-start gap-3 bg-background border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                           <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5"><XCircle size={16}/></div>
                           <span className="font-bold text-foreground leading-snug">{con}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {tractor.whyBuy && (
                   <div className="flex flex-col gap-4 mt-2">
                     <h3 className="text-xl font-black text-foreground">Why Buy This Tractor?</h3>
                     <div className="text-muted font-medium bg-foreground/5 p-6 rounded-2xl border border-[var(--border-subtle)]" dangerouslySetInnerHTML={{ __html: tractor.whyBuy }} />
                   </div>
                 )}
                 
               </div>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Information & Leads */}
        <div className="w-full lg:w-[40%] flex flex-col gap-8 relative">
           
           {/* "At a Glance" & Pricing Banner */}
           <div className="spatial-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-6 sticky top-24 shadow-2xl border border-[var(--color-brand-green)]/20 overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-brand-orange)]/10 blur-[50px] rounded-full group-hover:bg-[var(--color-brand-orange)]/20 transition-all duration-1000 -z-10" />
              
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/10 px-3 py-1 rounded-full">{tractor.brand?.name}</span>
                  {tractor.family?.name && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">{tractor.family.name}</span>
                  )}
                  {tractor.modelCode && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted border border-muted px-3 py-1 rounded-full">{tractor.modelCode}</span>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted bg-foreground/5 px-3 py-1 rounded-full">{formatEnum(tractor.launchStatus)}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">{tractor.modelName}</h1>
              </div>

              <div className="flex items-end justify-between border-y border-[var(--border-subtle)] py-6">
                 <div>
                   <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Ex-Showroom Price</p>
                   <div className="flex items-center gap-2">
                     <span className="text-3xl font-black text-[var(--color-brand-green)] tracking-tight">{formatPrice(tractor.exShowroomPriceMin)}</span>
                     {tractor.exShowroomPriceMax && tractor.exShowroomPriceMin && Number(tractor.exShowroomPriceMax) > Number(tractor.exShowroomPriceMin) && (
                       <span className="text-lg font-bold text-muted tracking-tight">- {formatPrice(tractor.exShowroomPriceMax)}</span>
                     )}
                   </div>
                 </div>
              </div>
               
               {tractor.financeAvailable && (
                 <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 px-4 py-3 rounded-xl flex items-center gap-3 mt-1">
                   <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                     <Percent size={16} strokeWidth={3} />
                   </div>
                   <div>
                     <p className="text-sm font-black text-foreground">100% Finance Available</p>
                     <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Easy EMI Options</p>
                   </div>
                 </div>
               )}

              {/* State Pricing Engine Widget */}
              <div className="flex flex-col gap-4 bg-background border border-[var(--border-subtle)] p-5 rounded-[1.5rem]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                     <MapPin size={16} className="text-[var(--color-brand-orange)]" /> On-Road Price Check
                   </h3>
                 </div>
                 
                 {tractor.priceByState && tractor.priceByState.length > 0 ? (
                   <>
                     <select 
                       value={selectedState} 
                       onChange={(e) => setSelectedState(e.target.value)}
                       className="w-full bg-foreground/5 border-none rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none cursor-pointer appearance-none"
                     >
                       {tractor.priceByState.map(p => (
                         <option key={p.id || p.state} value={p.state}>{p.state}</option>
                       ))}
                     </select>

                     {currentPriceObj && (
                       <div className="mt-2 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted font-bold">Ex-Showroom</span>
                            <span className="text-foreground font-black">₹ {Number(currentPriceObj.exShowroom).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted font-bold">RTO & Reg.</span>
                            <span className="text-foreground font-black">{currentPriceObj.rtoCharges ? `₹ ${Number(currentPriceObj.rtoCharges).toLocaleString('en-IN')}` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted font-bold">Insurance</span>
                            <span className="text-foreground font-black">{currentPriceObj.insuranceEst ? `₹ ${Number(currentPriceObj.insuranceEst).toLocaleString('en-IN')}` : 'N/A'}</span>
                          </div>
                          {currentPriceObj.dealerCharges != null && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted font-bold">Dealer Charges</span>
                              <span className="text-foreground font-black">₹ {Number(currentPriceObj.dealerCharges).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="h-[1px] w-full bg-foreground/10 my-1" />
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-foreground font-black">On-Road ({selectedState})</span>
                            <span className="text-[var(--color-brand-orange)] font-black">{currentPriceObj.onRoadPrice ? `₹ ${Number(currentPriceObj.onRoadPrice).toLocaleString('en-IN')}` : 'N/A'}</span>
                          </div>
                          
                          {emiEstimate && (
                             <div className="mt-3 bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 p-3 rounded-xl flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <CircleDollarSign size={18} className="text-[var(--color-brand-green)]" />
                                 <span className="text-xs font-black text-[var(--color-brand-green)] uppercase tracking-widest">Est. EMI</span>
                               </div>
                               <span className="text-base font-black text-foreground">₹ {emiEstimate.toLocaleString('en-IN')} / mo</span>
                             </div>
                          )}
                       </div>
                     )}
                   </>
                 ) : (
                   <p className="text-sm font-bold text-muted">Detailed state pricing currently not available for this model.</p>
                 )}
              </div>

              {/* Lead Gen Button */}
              <button className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-orange)] text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-[var(--color-brand-green)]/30 transition-all hover:shadow-[var(--color-brand-orange)]/40 hover:-translate-y-1 flex items-center justify-center gap-2 group mt-2">
                Get Best Deal <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-xs font-bold text-muted flex items-center justify-center gap-2">
                 <Shield size={14} className="text-[var(--color-brand-green)]" /> 100% Verified Dealers & Secure Financing
              </p>
           </div>

           {/* Auto-Suggested Rivals */}
           {rivals.length > 0 && (
             <div className="spatial-panel rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Flame size={20} className="text-red-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Top Competitors</h3>
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  {rivals.map((rival, i) => {
                    const isLeftMe = rival.tractorLeft?.id === tractor.id;
                    const competitor = isLeftMe ? rival.tractorRight : rival.tractorLeft;
                    
                    if (!competitor) return null;
                    
                    const compImage = competitor.media?.find((m: any) => m.isPrimary)?.url || competitor.media?.[0]?.url;

                    return (
                      <Link key={i} href={`/compare?ids=${tractor.id},${competitor.id}`} className="flex items-center gap-4 bg-background border border-[var(--border-subtle)] p-4 rounded-[1.5rem] hover:border-[var(--color-brand-orange)]/30 hover:shadow-lg transition-all group">
                         <div className="w-16 h-16 bg-gradient-to-br from-foreground/5 to-transparent rounded-xl flex items-center justify-center p-2 border border-[var(--border-subtle)] shrink-0 overflow-hidden">
                           {compImage ? (
                             <img src={compImage} alt={competitor.modelName} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform" />
                           ) : (
                             <TractorIcon className="w-8 h-8 text-muted" />
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-[9px] font-black uppercase text-[var(--color-brand-green)] tracking-widest truncate">{competitor.brand?.name}</p>
                           <h4 className="text-sm font-black text-foreground truncate">{competitor.modelName}</h4>
                           <p className="text-[11px] font-bold text-muted mt-1">{competitor.hp || '--'} HP</p>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-[var(--color-brand-orange)] font-black text-[10px] italic shrink-0 group-hover:bg-[var(--color-brand-orange)] group-hover:text-white transition-colors">
                           VS
                         </div>
                      </Link>
                    )
                  })}
                </div>
             </div>
           )}

        </div>
      </div>
      
      {/* Similar Tractors Section */}
      {similarTractors.length > 0 && (
        <div className="w-full mt-16 pt-12 border-t border-[var(--panel-border)] flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Similar Tractors</h2>
              <p className="text-muted font-bold mt-2">Compare other powerful options from {tractor.brand?.name}</p>
            </div>
            <Link href={`/tractors?brand=${tractor.brandId}`} className="text-sm font-black text-[var(--color-brand-green)] hover:text-[var(--color-brand-orange)] transition-colors uppercase tracking-widest flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarTractors.map((st) => {
               const stPrimaryImage = st.media && st.media.length > 0 
                 ? (st.media.find((m: any) => m.isPrimary)?.url || st.media[0].url) 
                 : null;
                 
               return (
                 <Link key={st.id} href={`/tractors/${st.slug || st.id}`} className="spatial-card flex flex-col overflow-hidden relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] p-5 hover:border-[var(--color-brand-green)]/30 hover:shadow-[0_20px_40px_-10px_rgba(74,118,53,0.15)] hover:-translate-y-2 bg-background">
                   <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-foreground/5 to-transparent border border-[var(--border-subtle)] flex items-center justify-center relative mb-4 overflow-hidden group/img p-4">
                     {stPrimaryImage ? (
                       <img 
                         src={stPrimaryImage} 
                         alt={st.modelName} 
                         className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
                       />
                     ) : (
                       <TractorIcon className="w-16 h-16 text-foreground/20" strokeWidth={1} />
                     )}
                   </div>
                   <div className="px-2 flex flex-col gap-2">
                     <p className="text-[10px] font-black text-[var(--color-brand-green)] uppercase tracking-[0.2em]">{st.brand?.name}</p>
                     <h3 className="text-xl font-black text-foreground tracking-tight truncate">{st.modelName}</h3>
                     <div className="flex items-center gap-2 text-[11px] font-bold">
                       <span className="bg-foreground/5 px-2 py-1 rounded-md">{st.hp || '--'} HP</span>
                       <span className="bg-foreground/5 px-2 py-1 rounded-md">{formatEnum(st.driveType)}</span>
                     </div>
                     <div className="mt-3 pt-3 border-t border-[var(--panel-border)]">
                       <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Starting Price</p>
                       <p className="text-lg font-black text-foreground">{formatPrice(st.exShowroomPriceMin)}</p>
                     </div>
                   </div>
                 </Link>
               )
            })}
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-xl border-t border-[var(--border-subtle)] p-4 z-50 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Starting at</span>
          <span className="text-lg font-black text-foreground leading-none">{formatPrice(tractor.exShowroomPriceMin)}</span>
        </div>
        <button className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-orange)] text-white font-black px-6 py-3 rounded-xl shadow-lg transition-colors flex items-center gap-2">
          Get Best Deal <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function AccordionSection({ title, children, titleColorClass, defaultOpen = false }: { title: string; children: React.ReactNode; titleColorClass: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full bg-foreground/5 px-6 py-4 flex items-center justify-between hover:bg-foreground/10 transition-colors"
      >
        <h4 className={`text-xs font-black uppercase tracking-widest ${titleColorClass}`}>{title}</h4>
        <ChevronRight size={16} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden flex flex-col divide-y divide-foreground/5 bg-background">
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
    <div className="flex items-center justify-between px-6 py-4 hover:bg-foreground/5 transition-colors">
      <span className="text-sm font-bold text-muted">{label}</span>
      <span className="text-sm font-black text-foreground text-right">{displayValue}</span>
    </div>
  );
}
