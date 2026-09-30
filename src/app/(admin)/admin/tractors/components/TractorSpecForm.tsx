'use client';

import React from 'react';
import {
  TractorSpec,
  CoolingType,
  SteeringType,
  BrakeType,
  ClutchType,
  HydraulicsType,
  PtoType,
  GearboxType,
  ParkingBrakeType,
  DisplayType,
} from '@/lib/api/tractors';

interface TractorSpecFormProps {
  spec: Partial<TractorSpec>;
  onChange: (field: keyof TractorSpec, value: any) => void;
  touched?: Record<string, boolean>;
}

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-foreground mt-8 mb-4 border-b border-[var(--border-subtle)] pb-2 text-lg font-black">
    {title}
  </h3>
);

const InputField = ({
  label,
  name,
  type = 'text',
  spec,
  handleChange,
  required = false,
  touched,
}: any) => {
  const isMissing =
    required &&
    (spec[name as keyof TractorSpec] === undefined ||
      spec[name as keyof TractorSpec] === null ||
      spec[name as keyof TractorSpec] === '');
  const isError = isMissing && touched?.[`spec_${name}`];

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-foreground/60 flex items-center text-[11px] font-extrabold tracking-wider uppercase">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={spec[name as keyof TractorSpec] ?? ''}
        onChange={handleChange}
        className={`bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all focus:ring-2 ${
          isError
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-transparent focus:border-[var(--color-brand-green)]/50 focus:ring-[var(--color-brand-green)]/20'
        }`}
        placeholder={type === 'number' ? '0' : 'Not Specified'}
      />
      {isError && (
        <p className="animate-fade-in text-[11px] font-semibold text-red-500">
          {label} is required
        </p>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  name,
  options,
  spec,
  handleChange,
  required = false,
  touched,
}: any) => {
  const value = spec[name as keyof TractorSpec];
  const isMissing = required && (!value || value === '');
  const isError = isMissing && touched?.[`spec_${name}`];

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-foreground/60 flex items-center text-[11px] font-extrabold tracking-wider uppercase">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value || ''}
        onChange={handleChange}
        className={`bg-foreground/5 text-foreground focus:bg-background w-full appearance-none rounded-xl border px-4 py-3 text-sm font-bold transition-all focus:ring-2 ${
          isError
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-transparent focus:border-[var(--color-brand-green)]/50 focus:ring-[var(--color-brand-green)]/20'
        }`}
      >
        <option value="">Not Specified</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
      {isError && (
        <p className="animate-fade-in text-[11px] font-semibold text-red-500">
          {label} is required
        </p>
      )}
    </div>
  );
};

const CheckboxField = ({ label, name, spec, handleChange }: any) => (
  <label className="bg-foreground/5 flex cursor-pointer items-center gap-3 rounded-xl p-4">
    <input
      type="checkbox"
      name={name}
      checked={!!spec[name as keyof TractorSpec]}
      onChange={handleChange}
      className="bg-background h-5 w-5 rounded border-[var(--border-brand)] text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
    />
    <span className="text-sm font-bold">{label}</span>
  </label>
);

export default function TractorSpecForm({ spec, onChange, touched }: TractorSpecFormProps) {
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

  return (
    <div className="animate-fade-in flex flex-col gap-2">
      <h2 className="text-foreground mb-2 text-2xl font-black">Technical Specifications</h2>
      <p className="text-muted mb-4 text-xs">
        Fields marked with <span className="font-bold text-red-500">*</span> are mandatory.
      </p>

      <SectionTitle title="Engine Details" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Engine CC"
          name="engineCc"
          type="number"
          spec={spec}
          handleChange={handleChange}
          required
          touched={touched}
        />
        <InputField
          label="Cylinders"
          name="cylinders"
          type="number"
          spec={spec}
          handleChange={handleChange}
          required
          touched={touched}
        />
        <InputField
          label="Rated RPM"
          name="ratedRpm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Max Torque (Nm)"
          name="maxTorqueNm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <SelectField
          label="Cooling Type"
          name="coolingType"
          options={Object.values(CoolingType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Aspiration"
          name="aspiration"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Air Filter Type"
          name="airFilterType"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Fuel Injection Type"
          name="fuelInjectionType"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Engine Oil Capacity (L)"
          name="engineOilCapacityL"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Transmission" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SelectField
          label="Gearbox Type"
          name="gearboxType"
          options={Object.values(GearboxType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <SelectField
          label="Clutch Type"
          name="clutchType"
          options={Object.values(ClutchType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Forward Gears"
          name="forwardGears"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Reverse Gears"
          name="reverseGears"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Max Speed Fwd (Kmph)"
          name="maxSpeedFwdKmph"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Max Speed Rev (Kmph)"
          name="maxSpeedRevKmph"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <CheckboxField
          label="Has Creeper"
          name="hasCreeper"
          spec={spec}
          handleChange={handleChange}
        />
        <CheckboxField
          label="Has Shuttle"
          name="hasShuttle"
          spec={spec}
          handleChange={handleChange}
        />
        <CheckboxField
          label="Differential Lock"
          name="differentialLock"
          spec={spec}
          handleChange={handleChange}
        />
      </div>

      <SectionTitle title="PTO (Power Take-Off)" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SelectField
          label="PTO Type"
          name="ptoType"
          options={Object.values(PtoType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="PTO HP"
          name="ptoHp"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="PTO RPM"
          name="ptoRpm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="PTO RPM Options"
          name="ptoRpmOptions"
          placeholder="e.g. 540 / 1000"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="PTO Shaft Type"
          name="ptoShaftType"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Hydraulics" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Hydraulics Type"
          name="hydraulicsType"
          options={Object.values(HydraulicsType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Lifting Capacity (Kg)"
          name="liftingCapacityKg"
          type="number"
          spec={spec}
          handleChange={handleChange}
          required
          touched={touched}
        />
        <InputField
          label="Pump Flow Rate (Lpm)"
          name="pumpFlowRateLpm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Linkage Category"
          name="linkageCategory"
          placeholder="e.g. CAT II"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Aux Hydraulic Ports"
          name="auxHydraulicPorts"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Steering & Brakes" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SelectField
          label="Steering Type"
          name="steeringType"
          options={Object.values(SteeringType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <SelectField
          label="Brake Type"
          name="brakeType"
          options={Object.values(BrakeType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <SelectField
          label="Parking Brake"
          name="parkingBrake"
          options={Object.values(ParkingBrakeType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <InputField
          label="Suspended Pedal"
          name="suspendedPedal"
          placeholder="e.g. Yes"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Steering Seat"
          name="steeringSeat"
          placeholder="e.g. Adjustable"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Dimensions" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Overall Length (Mm)"
          name="overallLengthMm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Overall Width (Mm)"
          name="overallWidthMm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Overall Height (Mm)"
          name="overallHeightMm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Wheelbase (Mm)"
          name="wheelbaseMm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Ground Clearance (Mm)"
          name="groundClearanceMm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Turning Radius (M)"
          name="turningRadiusM"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Total Weight (Kg)"
          name="totalWeightKg"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Tyres" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Front Tyre Size"
          name="frontTyreSize"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Rear Tyre Size"
          name="rearTyreSize"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Tyre Type"
          name="tyreType"
          placeholder="e.g. Bias / Radial"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Fuel & Electrical" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Fuel Tank Capacity (L)"
          name="fuelTankCapacityL"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Fuel Consumption (Lph)"
          name="fuelConsumptionLph"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Battery Voltage"
          name="batteryVoltage"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Battery Ah"
          name="batteryAh"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Alternator Amps"
          name="alternatorAmps"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Maintenance & Service" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Warranty Years"
          name="warrantyYears"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Warranty Hours"
          name="warrantyHours"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="First Service Hours"
          name="firstServiceHours"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Regular Service Interval (H)"
          name="regularServiceIntervalH"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Oil Change Interval (H)"
          name="oilChangeIntervalH"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Fuel Pump"
          name="fuelPump"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Engine Oil Spec"
          name="engineOilSpec"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Coolant Type"
          name="coolantType"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Annual Service Cost Estimate"
          name="annualServiceCostEstimate"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Electric Tractor (If Applicable)" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Battery Capacity (Kwh)"
          name="batteryCapacityKwh"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Motor Kw"
          name="motorKw"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Charging Time (Hours)"
          name="chargingTimeHours"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <InputField
          label="Range Per Charge (Km)"
          name="rangePerChargeKm"
          type="number"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>

      <SectionTitle title="Optional Features" />
      <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        <CheckboxField label="AC Cabin" name="hasAcCabin" spec={spec} handleChange={handleChange} />
        <CheckboxField label="GPS Enabled" name="hasGps" spec={spec} handleChange={handleChange} />
        <CheckboxField label="TPMS" name="hasTpms" spec={spec} handleChange={handleChange} />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <InputField
          label="Connectivity"
          name="connectivity"
          placeholder="e.g. Bluetooth, App-connected"
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
        <SelectField
          label="Digital Display"
          name="digitalDisplay"
          options={Object.values(DisplayType)}
          spec={spec}
          handleChange={handleChange}
          touched={touched}
        />
      </div>
    </div>
  );
}
