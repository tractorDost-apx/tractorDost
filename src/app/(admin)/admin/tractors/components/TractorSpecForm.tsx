'use client';

import React from 'react';
import { TractorSpec, CoolingType, SteeringType, BrakeType, ClutchType, HydraulicsType, PtoType, GearboxType } from '@/lib/api/tractors';

interface TractorSpecFormProps {
  spec: Partial<TractorSpec>;
  onChange: (field: keyof TractorSpec, value: any) => void;
}

export default function TractorSpecForm({ spec, onChange }: TractorSpecFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      onChange(name as keyof TractorSpec, (e.target as HTMLInputElement).checked);
    } else if (type === 'number') {
      onChange(name as keyof TractorSpec, value ? parseFloat(value) : null);
    } else {
      onChange(name as keyof TractorSpec, value || null);
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-lg font-black text-foreground mt-8 mb-4 pb-2 border-b border-foreground/10">{title}</h3>
  );

  const InputField = ({ label, name, type = 'text', placeholder = '' }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>
      <input 
        type={type} 
        name={name}
        value={spec[name as keyof TractorSpec] as any || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
      />
    </div>
  );

  const SelectField = ({ label, name, options }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>
      <select 
        name={name}
        value={spec[name as keyof TractorSpec] as any || ''}
        onChange={handleChange}
        className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
      >
        <option value="">Not Specified</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
        ))}
      </select>
    </div>
  );

  const CheckboxField = ({ label, name }: any) => (
    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-foreground/5">
      <input 
        type="checkbox" 
        name={name} 
        checked={!!spec[name as keyof TractorSpec]} 
        onChange={handleChange} 
        className="w-5 h-5 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background border-foreground/20" 
      />
      <span className="text-sm font-bold">{label}</span>
    </label>
  );

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <h2 className="text-2xl font-black text-foreground mb-2">Technical Specifications</h2>
      
      <SectionTitle title="Engine Details" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Engine CC" name="engineCc" type="number" />
        <InputField label="Cylinders" name="cylinders" type="number" />
        <InputField label="Rated RPM" name="ratedRpm" type="number" />
        <InputField label="Max Torque (Nm)" name="maxTorqueNm" type="number" />
        <SelectField label="Cooling Type" name="coolingType" options={Object.values(CoolingType)} />
        <InputField label="Aspiration" name="aspiration" />
        <InputField label="Air Filter Type" name="airFilterType" />
        <InputField label="Fuel Injection Type" name="fuelInjectionType" />
        <InputField label="Engine Oil Capacity (L)" name="engineOilCapacityL" type="number" />
      </div>

      <SectionTitle title="Transmission" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SelectField label="Gearbox Type" name="gearboxType" options={Object.values(GearboxType)} />
        <SelectField label="Clutch Type" name="clutchType" options={Object.values(ClutchType)} />
        <InputField label="Forward Gears" name="forwardGears" type="number" />
        <InputField label="Reverse Gears" name="reverseGears" type="number" />
        <InputField label="Max Speed Fwd (Kmph)" name="maxSpeedFwdKmph" type="number" />
        <InputField label="Max Speed Rev (Kmph)" name="maxSpeedRevKmph" type="number" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <CheckboxField label="Has Creeper" name="hasCreeper" />
        <CheckboxField label="Has Shuttle" name="hasShuttle" />
        <CheckboxField label="Differential Lock" name="differentialLock" />
      </div>

      <SectionTitle title="PTO (Power Take-Off)" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SelectField label="PTO Type" name="ptoType" options={Object.values(PtoType)} />
        <InputField label="PTO HP" name="ptoHp" type="number" />
        <InputField label="PTO RPM" name="ptoRpm" type="number" />
        <InputField label="PTO RPM Options" name="ptoRpmOptions" placeholder="e.g. 540 / 1000" />
        <InputField label="PTO Shaft Type" name="ptoShaftType" />
      </div>

      <SectionTitle title="Hydraulics" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SelectField label="Hydraulics Type" name="hydraulicsType" options={Object.values(HydraulicsType)} />
        <InputField label="Lifting Capacity (Kg)" name="liftingCapacityKg" type="number" />
        <InputField label="Pump Flow Rate (Lpm)" name="pumpFlowRateLpm" type="number" />
        <InputField label="Linkage Category" name="linkageCategory" placeholder="e.g. CAT II" />
        <InputField label="Aux Hydraulic Ports" name="auxHydraulicPorts" type="number" />
      </div>

      <SectionTitle title="Steering & Brakes" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SelectField label="Steering Type" name="steeringType" options={Object.values(SteeringType)} />
        <SelectField label="Brake Type" name="brakeType" options={Object.values(BrakeType)} />
        <CheckboxField label="Parking Brake" name="parkingBrake" />
      </div>

      <SectionTitle title="Dimensions & Weight" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Overall Length (mm)" name="overallLengthMm" type="number" />
        <InputField label="Overall Width (mm)" name="overallWidthMm" type="number" />
        <InputField label="Overall Height (mm)" name="overallHeightMm" type="number" />
        <InputField label="Wheelbase (mm)" name="wheelbaseMm" type="number" />
        <InputField label="Ground Clearance (mm)" name="groundClearanceMm" type="number" />
        <InputField label="Turning Radius (m)" name="turningRadiusM" type="number" />
        <InputField label="Total Weight (Kg)" name="totalWeightKg" type="number" />
      </div>

      <SectionTitle title="Tyres" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Front Tyre Size" name="frontTyreSize" />
        <InputField label="Rear Tyre Size" name="rearTyreSize" />
        <InputField label="Tyre Type" name="tyreType" placeholder="Bias / Radial" />
      </div>

      <SectionTitle title="Fuel & Electrical" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Fuel Tank Capacity (L)" name="fuelTankCapacityL" type="number" />
        <InputField label="Fuel Consumption (Lph)" name="fuelConsumptionLph" type="number" />
        <InputField label="Battery Voltage" name="batteryVoltage" type="number" />
        <InputField label="Battery Ah" name="batteryAh" type="number" />
        <InputField label="Alternator Amps" name="alternatorAmps" type="number" />
      </div>

      <SectionTitle title="Maintenance & Service" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Warranty (Years)" name="warrantyYears" type="number" />
        <InputField label="Warranty (Hours)" name="warrantyHours" type="number" />
        <InputField label="First Service (Hours)" name="firstServiceHours" type="number" />
        <InputField label="Regular Service Interval (Hours)" name="regularServiceIntervalH" type="number" />
        <InputField label="Oil Change Interval (Hours)" name="oilChangeIntervalH" type="number" />
        <InputField label="Engine Oil Spec" name="engineOilSpec" placeholder="e.g. SAE 15W-40" />
        <InputField label="Coolant Type" name="coolantType" />
        <InputField label="Annual Service Cost Est (₹)" name="annualServiceCostEstimate" type="number" />
      </div>

      <SectionTitle title="Electric Tractor (If Applicable)" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Battery Capacity (kWh)" name="batteryCapacityKwh" type="number" />
        <InputField label="Motor (kW)" name="motorKw" type="number" />
        <InputField label="Charging Time (Hours)" name="chargingTimeHours" type="number" />
        <InputField label="Range Per Charge (km)" name="rangePerChargeKm" type="number" />
      </div>

      <SectionTitle title="Optional Features" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CheckboxField label="AC Cabin" name="hasAcCabin" />
        <CheckboxField label="GPS" name="hasGps" />
        <CheckboxField label="TPMS" name="hasTpms" />
      </div>
    </div>
  );
}
