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
    <div className="mt-8 mb-4 flex items-center gap-2 rounded-xl border-y border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-6 py-4">
      <ChevronRight size={18} className="text-[var(--color-brand-green)]" />
      <h3 className="text-foreground text-lg font-black tracking-wider uppercase">{title}</h3>
    </div>
  );

  return (
    <div className="relative w-full pb-20">
      <CompareStickyBar tractors={tractors} isSticky={isSticky} />

      <div className="glass-panel overflow-hidden rounded-3xl" ref={tableRef}>
        {/* Header Row */}
        <div className="bg-foreground/5 flex flex-col border-b border-[var(--border-subtle)] md:flex-row">
          <div className="hidden flex-col justify-center gap-2 border-r border-[var(--border-subtle)] p-6 md:flex md:w-1/4">
            <h2 className="text-foreground text-2xl font-black tracking-tight uppercase">
              Compare
              <br />
              Tractors
            </h2>
            <p className="text-muted text-sm font-medium">
              Side-by-side technical specification analysis.
            </p>
            {tractors.length < 4 && onAddMore && (
              <button
                onClick={onAddMore}
                className="mt-4 rounded-xl border-2 border-dashed border-[var(--color-brand-green)]/50 px-4 py-2 font-bold text-[var(--color-brand-green)] transition-colors hover:bg-[var(--color-brand-green)]/10"
              >
                + Add Another
              </button>
            )}
          </div>
          <div className="flex flex-1 flex-row">
            {tractors.map((tractor, idx) => (
              <div
                key={tractor.id}
                className="flex-1 border-r border-[var(--border-subtle)] p-4 last:border-r-0 md:p-6"
              >
                <CompareHeaderCard tractor={tractor} />
              </div>
            ))}
          </div>
        </div>

        {/* Engine Specs */}
        <SectionHeader title="Engine & Performance" />
        <CompareRow label="Engine HP" values={tractors.map((t) => t.hp)} highlightBest="highest" />
        <CompareRow
          label="Engine CC"
          values={tractors.map((_, i) => getSpec(i, 'engineCc'))}
          highlightBest="highest"
        />
        <CompareRow
          label="No. of Cylinders"
          values={tractors.map((_, i) => getSpec(i, 'cylinders'))}
        />
        <CompareRow label="Rated RPM" values={tractors.map((_, i) => getSpec(i, 'ratedRpm'))} />
        <CompareRow
          label="Max Torque (Nm)"
          values={tractors.map((_, i) => getSpec(i, 'maxTorqueNm'))}
          highlightBest="highest"
        />
        <CompareRow
          label="Cooling System"
          values={tractors.map((_, i) => getSpec(i, 'coolingType')?.replace('_', ' '))}
        />

        {/* Transmission Specs */}
        <SectionHeader title="Transmission" />
        <CompareRow
          label="Gearbox Type"
          values={tractors.map((_, i) => getSpec(i, 'gearboxType')?.replace(/_/g, ' '))}
        />
        <CompareRow
          label="Clutch Type"
          values={tractors.map((_, i) => getSpec(i, 'clutchType')?.replace(/_/g, ' '))}
        />
        <CompareRow
          label="Forward Gears"
          values={tractors.map((_, i) => getSpec(i, 'forwardGears'))}
          highlightBest="highest"
        />
        <CompareRow
          label="Reverse Gears"
          values={tractors.map((_, i) => getSpec(i, 'reverseGears'))}
        />

        {/* PTO & Hydraulics */}
        <SectionHeader title="PTO & Hydraulics" />
        <CompareRow
          label="PTO HP"
          values={tractors.map((_, i) => getSpec(i, 'ptoHp'))}
          highlightBest="highest"
        />
        <CompareRow
          label="PTO Type"
          values={tractors.map((_, i) => getSpec(i, 'ptoType')?.replace(/_/g, ' '))}
        />
        <CompareRow
          label="Lifting Capacity (kg)"
          values={tractors.map((_, i) => getSpec(i, 'liftingCapacityKg'))}
          highlightBest="highest"
        />

        {/* Steering & Brakes */}
        <SectionHeader title="Steering & Brakes" />
        <CompareRow
          label="Steering Type"
          values={tractors.map((_, i) => getSpec(i, 'steeringType'))}
        />
        <CompareRow
          label="Brake Type"
          values={tractors.map((_, i) => getSpec(i, 'brakeType')?.replace(/_/g, ' '))}
        />

        {/* Dimensions */}
        <SectionHeader title="Dimensions & Weight" />
        <CompareRow
          label="Total Weight (kg)"
          values={tractors.map((_, i) => getSpec(i, 'totalWeightKg'))}
        />
        <CompareRow
          label="Wheelbase (mm)"
          values={tractors.map((_, i) => getSpec(i, 'wheelbaseMm'))}
        />
        <CompareRow
          label="Ground Clearance (mm)"
          values={tractors.map((_, i) => getSpec(i, 'groundClearanceMm'))}
          highlightBest="highest"
        />

        {/* Features */}
        <SectionHeader title="Advanced Features" />
        <CompareRow
          label="4WD Available"
          values={tractors.map((t) => t.driveType === 'FOUR_WD')}
          highlightBest="boolean"
        />
        <CompareRow
          label="AC Cabin"
          values={tractors.map((_, i) => getSpec(i, 'hasAcCabin'))}
          highlightBest="boolean"
        />
        <CompareRow
          label="Warranty (Years)"
          values={tractors.map((_, i) => getSpec(i, 'warrantyYears'))}
          highlightBest="highest"
        />
        <CompareRow
          label="Finance Available"
          values={tractors.map((t) => t.financeAvailable)}
          highlightBest="boolean"
        />
      </div>
    </div>
  );
}
