'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, TractorSpec } from '@/lib/api/tractors';
import { FileSpreadsheet, Search, Edit2, ChevronDown, ChevronUp, Cog, Settings, Wrench, Thermometer, Battery, Ruler, CheckCircle2, ShieldCheck, Sparkles, Check, X as XIcon } from 'lucide-react';
import Link from 'next/link';

export default function TractorSpecsPage() {
  const [specs, setSpecs] = useState<TractorSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchSpecs = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractorSpecs({ page, limit: 10, search });
      if (response.success) {
        setSpecs(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
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
  }, [search, page]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const InfoBlock = ({ label, value }: { label: string, value: string | number | null | undefined | boolean }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="flex flex-col gap-1 border-b border-[var(--border-subtle)] pb-2 last:border-0 last:pb-0">
        <span className="text-[10px] uppercase font-black tracking-wider text-muted">{label}</span>
        <span className="text-sm font-bold text-foreground flex items-center gap-2">
          {typeof value === 'boolean' ? (
            value ? <><Check size={16} className="text-[var(--color-brand-green)]" /> Yes</> : <><XIcon size={16} className="text-red-500" /> No</>
          ) : (
            value
          )}
        </span>
      </div>
    );
  };

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => {
    // Determine if section is empty (all children return null)
    let hasContent = false;
    React.Children.forEach(children, child => {
      if (child) hasContent = true;
    });

    if (!hasContent) return null;

    return (
      <div className="bg-foreground/5 rounded-xl p-5 flex flex-col gap-5 border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)]/30 transition-colors">
        <div className="flex items-center gap-2 text-[var(--color-brand-green)] border-b border-[var(--border-subtle)] pb-3">
          <Icon size={18} />
          <h3 className="font-black text-sm uppercase tracking-wide">{title}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Tractor Specifications</h1>
          <p className="text-sm font-bold text-muted mt-1">Deep analysis & master view of all technical specifications.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <FileSpreadsheet size={18} />
            Total Specs Records: {totalCount}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search by tractor model or brand..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4 w-10"></th>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">Loading deep specifications...</td>
                </tr>
              ) : specs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">No specs found.</td>
                </tr>
              ) : (
                specs.map((item: any) => (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`hover:bg-foreground/5 transition-colors cursor-pointer ${expandedId === item.id ? 'bg-foreground/5' : ''}`}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <td className="px-6 py-4 text-muted">
                        {expandedId === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-base">
                            {item.tractor?.brand?.name} {item.tractor?.modelName}
                          </span>
                          <span className="text-[10px] font-black text-muted uppercase tracking-wider">
                            ID: {item.tractorId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-bold text-foreground/80">{item.engineCc ? `${item.engineCc} CC` : '-'}</span>
                          <span className="text-muted">{item.cylinders ? `${item.cylinders} Cyl` : '-'} • {item.ratedRpm ? `${item.ratedRpm} RPM` : '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-bold text-foreground/80">{item.gearboxType?.replace(/_/g, ' ') || '-'}</span>
                          <span className="text-muted">{item.forwardGears || 0}F + {item.reverseGears || 0}R</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-bold text-foreground/80">{item.ptoHp ? `${item.ptoHp} HP PTO` : '-'}</span>
                          <span className="text-muted">{item.liftingCapacityKg ? `${item.liftingCapacityKg} Kg Lift` : '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/tractors/${item.tractorId}?tab=specs`}
                          className="inline-flex p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors shadow-sm bg-foreground/5"
                          title="Edit Full Specs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit2 size={16} />
                        </Link>
                      </td>
                    </tr>
                    
                    {/* EXPANDED DEEP ANALYSIS VIEW */}
                    {expandedId === item.id && (
                      <tr>
                        <td colSpan={6} className="px-0 py-0 bg-foreground/[0.02]">
                          <div className="p-6 md:p-8 flex flex-col gap-8 animate-fade-in border-b-2 border-[var(--color-brand-green)]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 size={24} className="text-[var(--color-brand-green)]" />
                                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Full Technical Profile</h2>
                              </div>
                              <Link 
                                href={`/admin/tractors/${item.tractorId}?tab=specs`}
                                className="px-6 py-2.5 bg-foreground/10 text-foreground font-black text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-green)] hover:text-white transition-colors shadow-sm flex items-center gap-2"
                              >
                                <Edit2 size={16} /> Edit Profile
                              </Link>
                            </div>
                            
                            <div className="flex flex-col gap-6 w-full whitespace-normal">
                              {/* Row 1: Engine & Transmission */}
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Section title="Engine & Power" icon={Cog}>
                                  <InfoBlock label="Engine CC" value={item.engineCc ? `${item.engineCc} CC` : null} />
                                  <InfoBlock label="Cylinders" value={item.cylinders} />
                                  <InfoBlock label="Rated RPM" value={item.ratedRpm} />
                                  <InfoBlock label="Max Torque" value={item.maxTorqueNm ? `${item.maxTorqueNm} Nm` : null} />
                                  <InfoBlock label="Cooling" value={item.coolingType?.replace(/_/g, ' ')} />
                                  <InfoBlock label="Aspiration" value={item.aspiration} />
                                  <InfoBlock label="Fuel Inject." value={item.fuelInjectionType} />
                                  <InfoBlock label="Air Filter" value={item.airFilterType} />
                                  <InfoBlock label="Governor" value={item.governorType} />
                                  <InfoBlock label="Oil Cap." value={item.engineOilCapacityL ? `${item.engineOilCapacityL} L` : null} />
                                </Section>

                                <Section title="Transmission & Gears" icon={Settings}>
                                  <InfoBlock label="Gearbox" value={item.gearboxType?.replace(/_/g, ' ')} />
                                  <InfoBlock label="Clutch" value={item.clutchType?.replace(/_/g, ' ')} />
                                  <InfoBlock label="Fwd Gears" value={item.forwardGears} />
                                  <InfoBlock label="Rev Gears" value={item.reverseGears} />
                                  <InfoBlock label="Max Spd Fwd" value={item.maxSpeedFwdKmph ? `${item.maxSpeedFwdKmph} kmph` : null} />
                                  <InfoBlock label="Max Spd Rev" value={item.maxSpeedRevKmph ? `${item.maxSpeedRevKmph} kmph` : null} />
                                  <InfoBlock label="Creeper Gear" value={item.hasCreeper} />
                                  <InfoBlock label="Shuttle Gear" value={item.hasShuttle} />
                                  <InfoBlock label="Diff. Lock" value={item.differentialLock} />
                                </Section>
                              </div>

                              {/* Row 2: PTO, Hydraulics, Steering */}
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <Section title="PTO & Hydraulics" icon={Wrench}>
                                  <InfoBlock label="PTO Type" value={item.ptoType?.replace(/_/g, ' ')} />
                                  <InfoBlock label="PTO HP" value={item.ptoHp} />
                                  <InfoBlock label="PTO RPM" value={item.ptoRpm} />
                                  <InfoBlock label="PTO Options" value={item.ptoRpmOptions} />
                                  <InfoBlock label="PTO Shaft" value={item.ptoShaftType} />
                                  <InfoBlock label="Hydraulics" value={item.hydraulicsType?.replace(/_/g, ' ')} />
                                  <InfoBlock label="Lift Cap" value={item.liftingCapacityKg ? `${item.liftingCapacityKg} Kg` : null} />
                                  <InfoBlock label="Pump Flow" value={item.pumpFlowRateLpm ? `${item.pumpFlowRateLpm} lpm` : null} />
                                  <InfoBlock label="Linkage" value={item.linkageCategory} />
                                  <InfoBlock label="Aux Ports" value={item.auxHydraulicPorts} />
                                </Section>

                                <Section title="Steering, Brakes & Tyres" icon={Cog}>
                                  <InfoBlock label="Steering" value={item.steeringType?.replace(/_/g, ' ')} />
                                  <InfoBlock label="Brakes" value={item.brakeType?.replace(/_/g, ' ')} />
                                  <InfoBlock label="Parking Brake" value={item.parkingBrake} />
                                  <InfoBlock label="Front Tyre" value={item.frontTyreSize} />
                                  <InfoBlock label="Rear Tyre" value={item.rearTyreSize} />
                                  <InfoBlock label="Tyre Type" value={item.tyreType} />
                                </Section>
                              </div>

                              {/* Row 3: Dimensions, Maintenance, Extras */}
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <Section title="Dimensions & Weights" icon={Ruler}>
                                  <InfoBlock label="Length" value={item.overallLengthMm ? `${item.overallLengthMm} mm` : null} />
                                  <InfoBlock label="Width" value={item.overallWidthMm ? `${item.overallWidthMm} mm` : null} />
                                  <InfoBlock label="Height" value={item.overallHeightMm ? `${item.overallHeightMm} mm` : null} />
                                  <InfoBlock label="Wheelbase" value={item.wheelbaseMm ? `${item.wheelbaseMm} mm` : null} />
                                  <InfoBlock label="Clearance" value={item.groundClearanceMm ? `${item.groundClearanceMm} mm` : null} />
                                  <InfoBlock label="Turn Radius" value={item.turningRadiusM ? `${item.turningRadiusM} m` : null} />
                                  <InfoBlock label="Weight" value={item.totalWeightKg ? `${item.totalWeightKg} Kg` : null} />
                                </Section>

                                <Section title="Maintenance & Capacity" icon={ShieldCheck}>
                                  <InfoBlock label="Fuel Tank" value={item.fuelTankCapacityL ? `${item.fuelTankCapacityL} L` : null} />
                                  <InfoBlock label="Consumption" value={item.fuelConsumptionLph ? `${item.fuelConsumptionLph} L/hr` : null} />
                                  <InfoBlock label="Warranty" value={item.warrantyYears ? `${item.warrantyYears} Yrs / ${item.warrantyHours} Hrs` : null} />
                                  <InfoBlock label="First Serv." value={item.firstServiceHours ? `${item.firstServiceHours} Hrs` : null} />
                                  <InfoBlock label="Service Int." value={item.regularServiceIntervalH ? `${item.regularServiceIntervalH} Hrs` : null} />
                                  <InfoBlock label="Oil Int." value={item.oilChangeIntervalH ? `${item.oilChangeIntervalH} Hrs` : null} />
                                  <InfoBlock label="Engine Oil" value={item.engineOilSpec} />
                                  <InfoBlock label="Coolant" value={item.coolantType} />
                                </Section>

                                <div className="flex flex-col gap-6">
                                  <Section title="Electrical & Extras" icon={Sparkles}>
                                    <InfoBlock label="Battery" value={item.batteryVoltage ? `${item.batteryVoltage}V, ${item.batteryAh}Ah` : null} />
                                    <InfoBlock label="Alternator" value={item.alternatorAmps ? `${item.alternatorAmps}A` : null} />
                                    <InfoBlock label="AC Cabin" value={item.hasAcCabin} />
                                    <InfoBlock label="GPS" value={item.hasGps} />
                                    <InfoBlock label="TPMS" value={item.hasTpms} />
                                  </Section>

                                  {/* Electric Tractor Section if applicable */}
                                  {(item.batteryCapacityKwh || item.motorKw) && (
                                    <Section title="Electric Powertrain" icon={Thermometer}>
                                      <InfoBlock label="Battery Cap" value={item.batteryCapacityKwh ? `${item.batteryCapacityKwh} kWh` : null} />
                                      <InfoBlock label="Motor Power" value={item.motorKw ? `${item.motorKw} kW` : null} />
                                      <InfoBlock label="Charge Time" value={item.chargingTimeHours ? `${item.chargingTimeHours} Hrs` : null} />
                                      <InfoBlock label="Range" value={item.rangePerChargeKm ? `${item.rangePerChargeKm} Km` : null} />
                                    </Section>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="mt-auto p-4 border-t border-[var(--border-subtle)] flex items-center justify-between z-10 bg-background relative">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-muted">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
