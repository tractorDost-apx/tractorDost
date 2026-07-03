'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usedTractorAPI, ConditionGrade, UrgencyLevel, UsedTractorListing } from '@/lib/api/usedTractors';
import { brandAPI } from '@/lib/api/brands';
import { 
  Tractor, 
  MapPin, 
  Wrench, 
  IndianRupee, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { id: 1, title: 'Basics & Location', icon: <Tractor size={20} /> },
  { id: 2, title: 'Condition Details', icon: <Wrench size={20} /> },
  { id: 3, title: 'Pricing & Docs', icon: <IndianRupee size={20} /> },
  { id: 4, title: 'Description', icon: <FileText size={20} /> }
];

export default function SellUsedTractorPage() {
  const router = useRouter();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [formData, setFormData] = useState<Partial<UsedTractorListing>>({
    tractorBrand: '',
    tractorModel: '',
    yearOfManufacture: new Date().getFullYear(),
    hoursUsed: 0,
    ownership: 1,
    state: '',
    district: '',
    villageCity: '',
    
    conditionGrade: ConditionGrade.GOOD,
    tyreCondition: ConditionGrade.GOOD,
    engineConditionPct: 90,
    hydraulicsCondition: ConditionGrade.GOOD,
    bodyCondition: ConditionGrade.GOOD,
    
    askingPrice: 0,
    negotiable: true,
    financeAvailable: false,
    rcAvailable: true,
    loanClearanceStatus: 'CLEAR',
    urgency: UrgencyLevel.NO_RUSH,
    
    description: '',
    majorRepairs: ''
  });

  const [brands, setBrands] = useState<any[]>([]);

  React.useEffect(() => {
    brandAPI.getAllBrands().then(res => {
      if (res.success && res.data && Array.isArray(res.data.data)) {
        setBrands(res.data.data);
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    
    if (type === 'number' || type === 'range') {
      parsedValue = Number(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await usedTractorAPI.createListing(formData);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError('Failed to submit listing. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-background flex items-center justify-center">
        <div className="max-w-md w-full bg-foreground/5 rounded-3xl p-10 text-center shadow-xl border border-foreground/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-brand-green)]"></div>
          
          <div className="w-24 h-24 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          
          <h1 className="text-3xl font-black mb-4">Listing Submitted!</h1>
          <p className="text-muted font-medium mb-8">
            Your tractor has been successfully submitted for review. Our team will verify the details and activate your listing within 24 hours.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link 
              href="/used-tractors" 
              className="px-6 py-4 bg-[var(--color-brand-green)] text-white font-black rounded-xl hover:-translate-y-1 transition-transform shadow-lg shadow-[var(--color-brand-green)]/20"
            >
              View All Used Tractors
            </Link>
            <button 
              onClick={() => {
                setIsSuccess(false);
                setCurrentStep(1);
                setFormData({
                  ...formData,
                  tractorModel: '',
                  hoursUsed: 0,
                  askingPrice: 0,
                  description: ''
                });
              }}
              className="px-6 py-4 bg-foreground/10 text-foreground font-black rounded-xl hover:bg-foreground/20 transition-colors"
            >
              List Another Tractor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight">
            Sell Your <span className="text-[var(--color-brand-green)]">Tractor</span>
          </h1>
          <p className="text-muted font-medium max-w-2xl mx-auto">
            Get the best price for your used tractor. Fill in the details below to list it on Tractor Dost, India's largest tractor marketplace.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-foreground/10 -translate-y-1/2 z-0 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[var(--color-brand-green)] -translate-y-1/2 z-0 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
          
          <div className="relative z-10 flex justify-between">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black shadow-lg transition-colors duration-300 ${
                    currentStep >= step.id 
                      ? 'bg-[var(--color-brand-green)] text-white shadow-[var(--color-brand-green)]/20' 
                      : 'bg-background text-muted border-2 border-foreground/10'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 size={24} /> : step.icon}
                </div>
                <div className="mt-3 text-xs font-bold uppercase tracking-wider hidden sm:block">
                  <span className={currentStep >= step.id ? 'text-[var(--color-brand-green)]' : 'text-muted'}>
                    {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-foreground/5 p-6 md:p-10 rounded-[2rem] border border-foreground/10 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="relative z-10">
            
            {/* STEP 1: BASICS */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/10">
                  <Tractor className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Tractor Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Brand *</label>
                    <select 
                      name="tractorBrand"
                      required
                      value={formData.tractorBrand}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Model *</label>
                    <input 
                      type="text" 
                      name="tractorModel"
                      required
                      placeholder="e.g. 575 DI XP Plus"
                      value={formData.tractorModel}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Year of Mfg *</label>
                    <input 
                      type="number" 
                      name="yearOfManufacture"
                      required
                      min={1980}
                      max={new Date().getFullYear()}
                      value={formData.yearOfManufacture}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Hours Used *</label>
                    <input 
                      type="number" 
                      name="hoursUsed"
                      required
                      min={0}
                      placeholder="e.g. 1500"
                      value={formData.hoursUsed || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Ownership *</label>
                    <select 
                      name="ownership"
                      required
                      value={formData.ownership}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value={1}>1st Owner</option>
                      <option value={2}>2nd Owner</option>
                      <option value={3}>3rd Owner</option>
                      <option value={4}>4th Owner or more</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/10">
                    <MapPin className="text-[var(--color-brand-green)]" size={28} />
                    <h2 className="text-2xl font-black uppercase">Location</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">State *</label>
                      <input 
                        type="text" 
                        name="state"
                        required
                        placeholder="e.g. Maharashtra"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">District *</label>
                      <input 
                        type="text" 
                        name="district"
                        required
                        placeholder="e.g. Pune"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Village/City *</label>
                      <input 
                        type="text" 
                        name="villageCity"
                        required
                        placeholder="e.g. Baramati"
                        value={formData.villageCity || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONDITION */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/10">
                  <Wrench className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Detailed Condition</h2>
                </div>

                <div className="bg-background rounded-2xl p-6 border border-foreground/10 mb-8">
                  <label className="text-sm font-black uppercase tracking-widest mb-4 block flex justify-between items-center">
                    <span>Engine Condition</span>
                    <span className="text-2xl text-[var(--color-brand-green)]">{formData.engineConditionPct}%</span>
                  </label>
                  <input 
                    type="range" 
                    name="engineConditionPct"
                    min="10" 
                    max="100"
                    step="5"
                    value={formData.engineConditionPct}
                    onChange={handleChange}
                    className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-green)]"
                  />
                  <div className="flex justify-between text-xs font-bold text-muted mt-2 uppercase tracking-wider">
                    <span>Needs Work</span>
                    <span>Like New</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Overall Condition *</label>
                    <select 
                      name="conditionGrade"
                      value={formData.conditionGrade}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
                    >
                      {Object.values(ConditionGrade).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Tyres Condition</label>
                    <select 
                      name="tyreCondition"
                      value={formData.tyreCondition}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
                    >
                      {Object.values(ConditionGrade).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Hydraulics</label>
                    <select 
                      name="hydraulicsCondition"
                      value={formData.hydraulicsCondition}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
                    >
                      {Object.values(ConditionGrade).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Body / Paint</label>
                    <select 
                      name="bodyCondition"
                      value={formData.bodyCondition}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
                    >
                      {Object.values(ConditionGrade).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PRICING */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/10">
                  <IndianRupee className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Pricing & Docs</h2>
                </div>

                <div className="bg-background rounded-2xl p-6 border border-[var(--color-brand-green)]/20 shadow-lg shadow-[var(--color-brand-green)]/5 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Asking Price (₹) *</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
                        <input 
                          type="number" 
                          name="askingPrice"
                          required
                          min={10000}
                          placeholder="e.g. 450000"
                          value={formData.askingPrice || ''}
                          onChange={handleChange}
                          className="w-full pl-12 pr-5 py-5 bg-foreground/5 border border-transparent rounded-2xl text-2xl font-black text-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            name="negotiable"
                            checked={formData.negotiable}
                            onChange={handleChange}
                            className="w-6 h-6 rounded-md border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background peer"
                          />
                        </div>
                        <span className="font-black text-lg group-hover:text-[var(--color-brand-green)] transition-colors">Price is Negotiable</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4 border-b border-foreground/10 pb-2">Documents</h3>
                    
                    <label className="flex items-center gap-4 cursor-pointer p-4 bg-background border border-foreground/10 rounded-2xl hover:border-[var(--color-brand-green)] transition-colors">
                      <input 
                        type="checkbox" 
                        name="rcAvailable"
                        checked={formData.rcAvailable}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                      />
                      <span className="font-bold">RC Book Available</span>
                    </label>

                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Loan Clearance</label>
                      <select 
                        name="loanClearanceStatus"
                        value={formData.loanClearanceStatus}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
                      >
                        <option value="CLEAR">Loan Cleared (NOC Available)</option>
                        <option value="UNDER_HYPOTHECATION">Active Loan (Under Hypothecation)</option>
                        <option value="NO_LOAN">Never Taken Loan</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4 border-b border-foreground/10 pb-2">Sales Info</h3>
                    
                    <label className="flex items-center gap-4 cursor-pointer p-4 bg-background border border-foreground/10 rounded-2xl hover:border-[var(--color-brand-green)] transition-colors">
                      <input 
                        type="checkbox" 
                        name="financeAvailable"
                        checked={formData.financeAvailable}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
                      />
                      <span className="font-bold flex items-center gap-2">
                         <ShieldCheck className="text-blue-500" size={18} />
                         Can Arrange Finance for Buyer
                      </span>
                    </label>

                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">How Urgently do you want to sell?</label>
                      <select 
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none appearance-none"
                      >
                        <option value={UrgencyLevel.NO_RUSH}>No Rush (Whenever I get a good price)</option>
                        <option value={UrgencyLevel.THIRTY_DAYS}>Within 30 Days</option>
                        <option value={UrgencyLevel.FIFTEEN_DAYS}>Urgent (Within 15 Days)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: DESCRIPTION & PHOTOS */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/10">
                  <FileText className="text-[var(--color-brand-green)]" size={28} />
                  <h2 className="text-2xl font-black uppercase">Final Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Description</label>
                      <textarea 
                        name="description"
                        rows={4}
                        placeholder="Tell buyers why they should buy your tractor... e.g., 'Single hand driven, mostly used for light trolley work. Company serviced.'"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Major Repairs (If Any)</label>
                      <textarea 
                        name="majorRepairs"
                        rows={2}
                        placeholder="e.g., Engine overhauled at 4000 hours, Clutch plate changed recently."
                        value={formData.majorRepairs || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-background border border-foreground/10 rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-muted mb-2 block">Upload Photos</label>
                    <div className="h-full min-h-[200px] border-2 border-dashed border-foreground/20 rounded-3xl bg-background flex flex-col items-center justify-center p-8 text-center hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5 transition-all cursor-pointer group">
                      <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-[var(--color-brand-green)]/20 transition-colors">
                         <UploadCloud className="text-muted group-hover:text-[var(--color-brand-green)]" size={32} />
                      </div>
                      <h4 className="font-black text-lg mb-2">Drag & Drop photos here</h4>
                      <p className="text-sm text-muted font-medium mb-4">Or click to browse from your device</p>
                      <div className="px-6 py-2 bg-foreground/10 rounded-full text-xs font-bold uppercase tracking-wider text-muted">
                        Simulated Upload
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 font-bold">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 pt-6 border-t border-foreground/10 flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrev}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
                  currentStep === 1 
                    ? 'opacity-0 pointer-events-none' 
                    : 'bg-background hover:bg-foreground/5 border border-foreground/10'
                }`}
              >
                <ChevronLeft size={18} /> Back
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-4 bg-[var(--color-brand-green)] text-white font-black uppercase tracking-wider rounded-xl hover:-translate-y-1 transition-transform shadow-lg shadow-[var(--color-brand-green)]/20"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-10 py-4 bg-[var(--color-brand-green)] text-white font-black uppercase tracking-wider rounded-xl hover:-translate-y-1 transition-transform shadow-lg shadow-[var(--color-brand-green)]/20 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
