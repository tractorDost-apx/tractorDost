'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, TractorSpec } from '@/lib/api/tractors';
import {
  FileSpreadsheet,
  Search,
  Edit2,
  Eye,
  Cog,
  Settings,
  Wrench,
  Thermometer,
  Battery,
  Ruler,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Check,
  X as XIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';

export default function TractorSpecsPage() {
  const [specs, setSpecs] = useState<TractorSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState<any | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const fetchSpecs = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractorSpecs({ page, limit, search });
      if (response.success) {
        const payload = response.data as any;
        setSpecs(payload.data);
        setTotalPages(payload.pagination?.totalPages || 1);
        setTotalCount(payload.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch specs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSpecs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          setSelectedSpec(null);
        }
      }
    };
    if (selectedSpec) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setIsFullScreen(false);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSpec, isFullScreen]);

  const formatSpecValue = (val: any) => {
    if (typeof val !== 'string') return val;
    const trimmed = val.trim();
    if (!trimmed) return trimmed;

    // Replace any underscores with spaces
    const spaced = trimmed.replace(/_/g, ' ');

    // If it's an UPPERCASE enum/string (e.g. "WATER_COOLED", "WATER COOLED", "SYNCHROMESH", "DIRECT_INJECTION", "DRY_DUAL_ELEMENT", "DUAL")
    // Format to Title Case, while preserving recognized acronyms and technical measurements
    const acronyms = new Set([
      '2WD',
      '4WD',
      'AWD',
      'PTO',
      'RPM',
      'TPMS',
      'GPS',
      'ROPS',
      'AC',
      'LED',
      'HP',
      'CC',
      'NM',
      'KMPH',
      'LPM',
      'KG',
      'MM',
    ]);

    if (/^[A-Z0-9_\s-]+$/.test(trimmed) && trimmed.length > 2) {
      const isAcronym = acronyms.has(trimmed.toUpperCase());
      const isUnitWithNumber =
        /\d+\s*(CC|NM|RPM|HP|L|KG|MM|M|KMPH|LPM|V|AH|KW|KWH|HRS|YRS)/i.test(
          trimmed
        );

      if (!isAcronym && !isUnitWithNumber) {
        return spaced
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    return spaced;
  };

  const InfoBlock = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | null | undefined | boolean;
  }) => {
    if (value === null || value === undefined || value === '') return null;
    const formatted = formatSpecValue(value);

    return (
      <div className="flex flex-col gap-1 min-w-0 w-full border-b border-[var(--border-subtle)] pb-2.5 last:border-0 last:pb-0">
        <span
          className="text-muted text-[10px] font-black tracking-wider uppercase block truncate"
          title={label}
        >
          {label}
        </span>
        <div className="text-foreground text-sm font-bold leading-snug break-words [overflow-wrap:anywhere] min-w-0">
          {typeof value === 'boolean' ? (
            <span className="inline-flex items-center gap-1.5">
              {value ? (
                <>
                  <Check size={15} className="text-[var(--color-brand-green)] shrink-0" /> Yes
                </>
              ) : (
                <>
                  <XIcon size={15} className="text-red-500 shrink-0" /> No
                </>
              )}
            </span>
          ) : (
            formatted
          )}
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    icon: Icon,
    children,
    columns = 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-3',
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    columns?: string;
  }) => {
    // Determine if section is empty (all children return null)
    let hasContent = false;
    React.Children.forEach(children, (child) => {
      if (child) hasContent = true;
    });

    if (!hasContent) return null;

    return (
      <div className="bg-foreground/5 flex flex-col gap-5 rounded-xl border border-[var(--border-subtle)] p-5 transition-colors hover:border-[var(--color-brand-green)]/30">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 text-[var(--color-brand-green)]">
          <Icon size={18} />
          <h3 className="text-sm font-black tracking-wide uppercase">{title}</h3>
        </div>
        <div className={`grid ${columns} gap-x-5 gap-y-5`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            Tractor Specifications
          </h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis & master view of all technical specifications.
          </p>
        </div>
      </div>

      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
            <FileSpreadsheet size={18} />
            Total Specs Records: {totalCount}
          </div>
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by tractor model or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase">
              <tr>
                <th className="w-10 px-6 py-4"></th>
                <th className="px-6 py-4">Tractor / Model</th>
                <th className="px-6 py-4">Engine (CC/RPM)</th>
                <th className="px-6 py-4">Transmission</th>
                <th className="px-6 py-4">PTO & Hyd.</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    Loading deep specifications...
                  </td>
                </tr>
              ) : specs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    No specs found.
                  </td>
                </tr>
              ) : (
                specs.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer transition-colors"
                    onClick={() => setSelectedSpec(item)}
                  >
                    <td className="text-muted px-6 py-4">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-muted transition-colors group-hover:bg-[var(--color-brand-green)]/15 group-hover:text-[var(--color-brand-green)]"
                        title="Click to view specifications popup"
                      >
                        <Eye size={16} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground text-base font-bold transition-colors group-hover:text-[var(--color-brand-green)]">
                          {item.tractor?.brand?.name} {item.tractor?.modelName}
                        </span>
                        <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                          ID: {item.tractorId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-foreground/80 font-bold">
                          {item.engineCc ? `${item.engineCc} CC` : '-'}
                        </span>
                        <span className="text-muted">
                          {item.cylinders ? `${item.cylinders} Cyl` : '-'} •{' '}
                          {item.ratedRpm ? `${item.ratedRpm} RPM` : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-foreground/80 font-bold">
                          {formatSpecValue(item.gearboxType) || '-'}
                        </span>
                        <span className="text-muted">
                          {item.forwardGears || 0}F + {item.reverseGears || 0}R
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-foreground/80 font-bold">
                          {item.ptoHp ? `${item.ptoHp} HP PTO` : '-'}
                        </span>
                        <span className="text-muted">
                          {item.liftingCapacityKg ? `${item.liftingCapacityKg} Kg Lift` : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpec(item);
                          }}
                          className="text-foreground/70 bg-foreground/5 inline-flex rounded-xl p-2 shadow-sm transition-colors hover:bg-[var(--color-brand-green)]/15 hover:text-[var(--color-brand-green)]"
                          title="View Specifications Popup"
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          href={`/admin/tractors/${item.tractorId}?tab=specs`}
                          className="text-foreground/70 bg-foreground/5 inline-flex rounded-xl p-2 shadow-sm transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
                          title="Edit Full Specs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit2 size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            page={page}
            limit={limit}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* FULL TECHNICAL SPECIFICATIONS MODAL POPUP */}
      {selectedSpec && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in ${
          isFullScreen ? 'p-0' : 'p-3 sm:p-6'
        }`}>
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={() => {
              if (isFullScreen) setIsFullScreen(false);
              else setSelectedSpec(null);
            }}
          />

          {/* Modal Container */}
          <div className={`relative z-10 flex flex-col overflow-hidden border border-[var(--border-subtle)] bg-background shadow-2xl transition-all duration-200 ${
            isFullScreen
              ? 'h-full w-full max-h-none max-w-none rounded-none'
              : 'max-h-[92vh] w-full max-w-6xl rounded-3xl animate-scale-up'
          }`}>
            {/* Header (Sticky) */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-background/95 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[var(--color-brand-green)]/15 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                      Technical Datasheet
                    </span>
                    <span className="text-muted text-[11px] font-black uppercase">
                      ID: #{selectedSpec.tractorId}
                    </span>
                  </div>
                  <h2 className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
                    {selectedSpec.tractor?.brand?.name} {selectedSpec.tractor?.modelName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href={`/admin/tractors/${selectedSpec.tractorId}?tab=specs`}
                  className="bg-foreground/10 text-foreground hover:bg-[var(--color-brand-green)] hover:text-white hidden items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wider uppercase shadow-sm transition-colors sm:inline-flex"
                >
                  <Edit2 size={14} /> Edit Specs
                </Link>
                <button
                  type="button"
                  onClick={() => setIsFullScreen((prev) => !prev)}
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer"
                  title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Expand to Full Screen'}
                >
                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSpec(null)}
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <XIcon size={20} />
                </button>
              </div>
            </div>

            {/* Quick summary ribbon */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-foreground/[0.02] px-6 py-3 text-xs font-bold text-muted">
              {selectedSpec.engineCc && (
                <span className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground">
                  {selectedSpec.engineCc} CC
                </span>
              )}
              {selectedSpec.cylinders && (
                <span className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground">
                  {selectedSpec.cylinders} Cylinders
                </span>
              )}
              {selectedSpec.ratedRpm && (
                <span className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground">
                  {selectedSpec.ratedRpm} RPM
                </span>
              )}
              {selectedSpec.maxTorqueNm && (
                <span className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground">
                  {selectedSpec.maxTorqueNm} Nm Torque
                </span>
              )}
              {selectedSpec.ptoHp && (
                <span className="rounded-lg bg-[var(--color-brand-green)]/10 px-3 py-1 text-[var(--color-brand-green)]">
                  {selectedSpec.ptoHp} PTO HP
                </span>
              )}
              {selectedSpec.liftingCapacityKg && (
                <span className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground">
                  {selectedSpec.liftingCapacityKg} Kg Lift
                </span>
              )}
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="flex w-full flex-col gap-6">
                {/* Row 1: Engine & Transmission */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Section
                    title="Engine & Power"
                    icon={Cog}
                    columns="grid-cols-2 sm:grid-cols-3"
                  >
                    <InfoBlock
                      label="Engine CC"
                      value={selectedSpec.engineCc ? `${selectedSpec.engineCc} CC` : null}
                    />
                    <InfoBlock label="Cylinders" value={selectedSpec.cylinders} />
                    <InfoBlock label="Rated RPM" value={selectedSpec.ratedRpm} />
                    <InfoBlock
                      label="Max Torque"
                      value={selectedSpec.maxTorqueNm ? `${selectedSpec.maxTorqueNm} Nm` : null}
                    />
                    <InfoBlock
                      label="Cooling"
                      value={selectedSpec.coolingType}
                    />
                    <InfoBlock label="Aspiration" value={selectedSpec.aspiration} />
                    <InfoBlock label="Fuel Inject." value={selectedSpec.fuelInjectionType} />
                    <InfoBlock label="Air Filter" value={selectedSpec.airFilterType} />
                    <InfoBlock label="Governor" value={selectedSpec.governorType} />
                    <InfoBlock
                      label="Oil Cap."
                      value={
                        selectedSpec.engineOilCapacityL
                          ? `${selectedSpec.engineOilCapacityL} L`
                          : null
                      }
                    />
                  </Section>

                  <Section
                    title="Transmission & Gears"
                    icon={Settings}
                    columns="grid-cols-2 sm:grid-cols-3"
                  >
                    <InfoBlock
                      label="Gearbox"
                      value={selectedSpec.gearboxType}
                    />
                    <InfoBlock
                      label="Clutch"
                      value={selectedSpec.clutchType}
                    />
                    <InfoBlock label="Fwd Gears" value={selectedSpec.forwardGears} />
                    <InfoBlock label="Rev Gears" value={selectedSpec.reverseGears} />
                    <InfoBlock
                      label="Max Spd Fwd"
                      value={
                        selectedSpec.maxSpeedFwdKmph
                          ? `${selectedSpec.maxSpeedFwdKmph} kmph`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Max Spd Rev"
                      value={
                        selectedSpec.maxSpeedRevKmph
                          ? `${selectedSpec.maxSpeedRevKmph} kmph`
                          : null
                      }
                    />
                    <InfoBlock label="Creeper Gear" value={selectedSpec.hasCreeper} />
                    <InfoBlock label="Shuttle Gear" value={selectedSpec.hasShuttle} />
                    <InfoBlock label="Diff. Lock" value={selectedSpec.differentialLock} />
                  </Section>
                </div>

                {/* Row 2: PTO, Hydraulics, Steering */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Section
                    title="PTO & Hydraulics"
                    icon={Wrench}
                    columns="grid-cols-2 sm:grid-cols-3"
                  >
                    <InfoBlock
                      label="PTO Type"
                      value={selectedSpec.ptoType}
                    />
                    <InfoBlock label="PTO HP" value={selectedSpec.ptoHp} />
                    <InfoBlock label="PTO RPM" value={selectedSpec.ptoRpm} />
                    <InfoBlock label="PTO Options" value={selectedSpec.ptoRpmOptions} />
                    <InfoBlock label="PTO Shaft" value={selectedSpec.ptoShaftType} />
                    <InfoBlock
                      label="Hydraulics"
                      value={selectedSpec.hydraulicsType}
                    />
                    <InfoBlock
                      label="Lift Cap"
                      value={
                        selectedSpec.liftingCapacityKg
                          ? `${selectedSpec.liftingCapacityKg} Kg`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Pump Flow"
                      value={
                        selectedSpec.pumpFlowRateLpm
                          ? `${selectedSpec.pumpFlowRateLpm} lpm`
                          : null
                      }
                    />
                    <InfoBlock label="Linkage" value={selectedSpec.linkageCategory} />
                    <InfoBlock label="Aux Ports" value={selectedSpec.auxHydraulicPorts} />
                  </Section>

                  <Section
                    title="Steering, Brakes & Tyres"
                    icon={Cog}
                    columns="grid-cols-2 sm:grid-cols-3"
                  >
                    <InfoBlock
                      label="Steering"
                      value={selectedSpec.steeringType}
                    />
                    <InfoBlock
                      label="Brakes"
                      value={selectedSpec.brakeType}
                    />
                    <InfoBlock label="Parking Brake" value={selectedSpec.parkingBrake} />
                    <InfoBlock label="Front Tyre" value={selectedSpec.frontTyreSize} />
                    <InfoBlock label="Rear Tyre" value={selectedSpec.rearTyreSize} />
                    <InfoBlock label="Tyre Type" value={selectedSpec.tyreType} />
                  </Section>
                </div>

                {/* Row 3: Dimensions, Maintenance, Extras */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <Section
                    title="Dimensions & Weights"
                    icon={Ruler}
                    columns="grid-cols-2"
                  >
                    <InfoBlock
                      label="Length"
                      value={
                        selectedSpec.overallLengthMm
                          ? `${selectedSpec.overallLengthMm} mm`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Width"
                      value={
                        selectedSpec.overallWidthMm
                          ? `${selectedSpec.overallWidthMm} mm`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Height"
                      value={
                        selectedSpec.overallHeightMm
                          ? `${selectedSpec.overallHeightMm} mm`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Wheelbase"
                      value={
                        selectedSpec.wheelbaseMm
                          ? `${selectedSpec.wheelbaseMm} mm`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Clearance"
                      value={
                        selectedSpec.groundClearanceMm
                          ? `${selectedSpec.groundClearanceMm} mm`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Turn Radius"
                      value={
                        selectedSpec.turningRadiusM
                          ? `${selectedSpec.turningRadiusM} m`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Weight"
                      value={
                        selectedSpec.totalWeightKg
                          ? `${selectedSpec.totalWeightKg} Kg`
                          : null
                      }
                    />
                  </Section>

                  <Section
                    title="Maintenance & Capacity"
                    icon={ShieldCheck}
                    columns="grid-cols-2"
                  >
                    <InfoBlock
                      label="Fuel Tank"
                      value={
                        selectedSpec.fuelTankCapacityL
                          ? `${selectedSpec.fuelTankCapacityL} L`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Consumption"
                      value={
                        selectedSpec.fuelConsumptionLph
                          ? `${selectedSpec.fuelConsumptionLph} L/hr`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Warranty"
                      value={
                        selectedSpec.warrantyYears
                          ? `${selectedSpec.warrantyYears} Yrs / ${selectedSpec.warrantyHours} Hrs`
                          : null
                      }
                    />
                    <InfoBlock
                      label="First Serv."
                      value={
                        selectedSpec.firstServiceHours
                          ? `${selectedSpec.firstServiceHours} Hrs`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Service Int."
                      value={
                        selectedSpec.regularServiceIntervalH
                          ? `${selectedSpec.regularServiceIntervalH} Hrs`
                          : null
                      }
                    />
                    <InfoBlock
                      label="Oil Int."
                      value={
                        selectedSpec.oilChangeIntervalH
                          ? `${selectedSpec.oilChangeIntervalH} Hrs`
                          : null
                      }
                    />
                    <InfoBlock label="Engine Oil" value={selectedSpec.engineOilSpec} />
                    <InfoBlock label="Coolant" value={selectedSpec.coolantType} />
                  </Section>

                  <div className="flex flex-col gap-6">
                    <Section
                      title="Electrical & Extras"
                      icon={Sparkles}
                      columns="grid-cols-2"
                    >
                      <InfoBlock
                        label="Battery"
                        value={
                          selectedSpec.batteryVoltage
                            ? `${selectedSpec.batteryVoltage}V, ${selectedSpec.batteryAh}Ah`
                            : null
                        }
                      />
                      <InfoBlock
                        label="Alternator"
                        value={
                          selectedSpec.alternatorAmps
                            ? `${selectedSpec.alternatorAmps}A`
                            : null
                        }
                      />
                      <InfoBlock label="AC Cabin" value={selectedSpec.hasAcCabin} />
                      <InfoBlock label="GPS" value={selectedSpec.hasGps} />
                      <InfoBlock label="TPMS" value={selectedSpec.hasTpms} />
                    </Section>

                    {/* Electric Tractor Section if applicable */}
                    {(selectedSpec.batteryCapacityKwh || selectedSpec.motorKw) && (
                      <Section
                        title="Electric Powertrain"
                        icon={Thermometer}
                        columns="grid-cols-2"
                      >
                        <InfoBlock
                          label="Battery Cap"
                          value={
                            selectedSpec.batteryCapacityKwh
                              ? `${selectedSpec.batteryCapacityKwh} kWh`
                              : null
                          }
                        />
                        <InfoBlock
                          label="Motor Power"
                          value={
                            selectedSpec.motorKw
                              ? `${selectedSpec.motorKw} kW`
                              : null
                          }
                        />
                        <InfoBlock
                          label="Charge Time"
                          value={
                            selectedSpec.chargingTimeHours
                              ? `${selectedSpec.chargingTimeHours} Hrs`
                              : null
                          }
                        />
                        <InfoBlock
                          label="Range"
                          value={
                            selectedSpec.rangePerChargeKm
                              ? `${selectedSpec.rangePerChargeKm} Km`
                              : null
                          }
                        />
                      </Section>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="flex shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-background/95 px-6 py-4 backdrop-blur-md">
              <span className="text-muted hidden text-xs font-bold sm:inline">
                Viewing technical specification profile for{' '}
                <strong className="text-foreground">
                  {selectedSpec.tractor?.brand?.name} {selectedSpec.tractor?.modelName}
                </strong>
              </span>
              <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedSpec(null)}
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl px-5 py-2.5 text-xs font-black tracking-wider uppercase transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/admin/tractors/${selectedSpec.tractorId}?tab=specs`}
                  className="bg-[var(--color-brand-green)] text-white hover:brightness-110 flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black tracking-wider uppercase shadow-sm transition-all"
                >
                  <Edit2 size={14} /> Edit Full Specs
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
