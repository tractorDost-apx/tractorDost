'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Tractor } from '@/lib/api/tractors';
import CompareHeaderCard from './compare-header-card';
import CompareRow from './compare-row';
import CompareStickyBar from './compare-sticky-bar';
import { ChevronRight } from 'lucide-react';

interface CompareTableProps {
  tractors: Tractor[];
  onAddMore?: () => void;
}

export default function CompareTable({ tractors, onAddMore }: CompareTableProps) {
  const [isSticky, setIsSticky] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current) {
        const rect = tableRef.current.getBoundingClientRect();
        // Show sticky bar when we scroll past the header cards, but hide when past the table
        setIsSticky(rect.top < -200 && rect.bottom > 200);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getSpec = (idx: number, key: keyof NonNullable<Tractor['spec']>) => {
    return tractors[idx]?.spec?.[key];
  };

  const getPrice = (idx: number) => {
    return tractors[idx]?.exShowroomPriceMin;
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[var(--color-brand-green)]/10 px-6 py-4 flex items-center gap-2 border-y border-[var(--color-brand-green)]/20 mt-8 mb-4 rounded-xl">
      <ChevronRight size={18} className="text-[var(--color-brand-green)]" />
      <h3 className="text-lg font-black uppercase tracking-wider text-foreground">{title}</h3>
    </div>
  );

  return (
    <div className="w-full relative pb-20">
      <CompareStickyBar tractors={tractors} isSticky={isSticky} />
      
      <div className="glass-panel rounded-3xl overflow-hidden" ref={tableRef}>
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row border-b border-[var(--border-subtle)] bg-foreground/5">
          <div className="hidden md:flex md:w-1/4 p-6 flex-col justify-center gap-2 border-r border-[var(--border-subtle)]">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Compare<br/>Tractors</h2>
            <p className="text-sm font-medium text-muted">Side-by-side technical specification analysis.</p>
            {tractors.length < 3 && onAddMore && (
              <button 
                onClick={onAddMore}
                className="mt-4 px-4 py-2 border-2 border-dashed border-[var(--color-brand-green)]/50 text-[var(--color-brand-green)] rounded-xl font-bold hover:bg-[var(--color-brand-green)]/10 transition-colors"
              >
                + Add Another
              </button>
            )}
          </div>
          <div className="flex-1 flex flex-row">
            {tractors.map((tractor, idx) => (
              <div key={tractor.id} className="flex-1 p-4 md:p-6 border-r last:border-r-0 border-[var(--border-subtle)]">
                <CompareHeaderCard tractor={tractor} />
              </div>
            ))}
          </div>
        </div>

        {/* Engine Specs */}
        <SectionHeader title="Engine & Performance" />
        <CompareRow label="Engine HP" values={tractors.map(t => t.hp)} highlightBest="highest" />
        <CompareRow label="Engine CC" values={tractors.map((_, i) => getSpec(i, 'engineCc'))} highlightBest="highest" />
        <CompareRow label="No. of Cylinders" values={tractors.map((_, i) => getSpec(i, 'cylinders'))} />
        <CompareRow label="Rated RPM" values={tractors.map((_, i) => getSpec(i, 'ratedRpm'))} />
        <CompareRow label="Max Torque (Nm)" values={tractors.map((_, i) => getSpec(i, 'maxTorqueNm'))} highlightBest="highest" />
        <CompareRow label="Cooling System" values={tractors.map((_, i) => getSpec(i, 'coolingType')?.replace('_', ' '))} />

        {/* Transmission Specs */}
        <SectionHeader title="Transmission" />
        <CompareRow label="Gearbox Type" values={tractors.map((_, i) => getSpec(i, 'gearboxType')?.replace(/_/g, ' '))} />
        <CompareRow label="Clutch Type" values={tractors.map((_, i) => getSpec(i, 'clutchType')?.replace(/_/g, ' '))} />
        <CompareRow label="Forward Gears" values={tractors.map((_, i) => getSpec(i, 'forwardGears'))} highlightBest="highest" />
        <CompareRow label="Reverse Gears" values={tractors.map((_, i) => getSpec(i, 'reverseGears'))} />
        
        {/* PTO & Hydraulics */}
        <SectionHeader title="PTO & Hydraulics" />
        <CompareRow label="PTO HP" values={tractors.map((_, i) => getSpec(i, 'ptoHp'))} highlightBest="highest" />
        <CompareRow label="PTO Type" values={tractors.map((_, i) => getSpec(i, 'ptoType')?.replace(/_/g, ' '))} />
        <CompareRow label="Lifting Capacity (kg)" values={tractors.map((_, i) => getSpec(i, 'liftingCapacityKg'))} highlightBest="highest" />
        
        {/* Steering & Brakes */}
        <SectionHeader title="Steering & Brakes" />
        <CompareRow label="Steering Type" values={tractors.map((_, i) => getSpec(i, 'steeringType'))} />
        <CompareRow label="Brake Type" values={tractors.map((_, i) => getSpec(i, 'brakeType')?.replace(/_/g, ' '))} />

        {/* Dimensions */}
        <SectionHeader title="Dimensions & Weight" />
        <CompareRow label="Total Weight (kg)" values={tractors.map((_, i) => getSpec(i, 'totalWeightKg'))} />
        <CompareRow label="Wheelbase (mm)" values={tractors.map((_, i) => getSpec(i, 'wheelbaseMm'))} />
        <CompareRow label="Ground Clearance (mm)" values={tractors.map((_, i) => getSpec(i, 'groundClearanceMm'))} highlightBest="highest" />

        {/* Features */}
        <SectionHeader title="Advanced Features" />
        <CompareRow label="4WD Available" values={tractors.map(t => t.driveType === 'FOUR_WD')} highlightBest="boolean" />
        <CompareRow label="AC Cabin" values={tractors.map((_, i) => getSpec(i, 'hasAcCabin'))} highlightBest="boolean" />
        <CompareRow label="Warranty (Years)" values={tractors.map((_, i) => getSpec(i, 'warrantyYears'))} highlightBest="highest" />
        <CompareRow label="Finance Available" values={tractors.map(t => t.financeAvailable)} highlightBest="boolean" />
      </div>
    </div>
  );
}
