'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Eye, FileSpreadsheet, AlertCircle, X, Calculator, SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';
import { emiAPI } from '@/lib/api/emi';
import Pagination from '@/components/shared/Pagination';

interface EmiCalculationRecord {
  id: number;
  userId: number | null;
  tractorId: number | null;
  tractorPrice: number;
  downPayment: number;
  loanAmount: number;
  interestRatePct: number;
  tenureMonths: number;
  repaymentInterval: string;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  createdAt: string;
  tractor?: {
    id: number;
    modelName: string;
    slug: string;
    brand?: { id: number; name: string };
  };
  user?: {
    id: number;
    fullName: string;
    mobile: string;
    email: string;
  };
}

interface EmiDetailRecord extends EmiCalculationRecord {
  user?: {
    id: number;
    fullName: string;
    mobile: string;
    email: string;
    state: string;
    district: string;
  };
  amortizationTable?: Array<{
    period: number;
    emiAmount: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }>;
}

export default function EmiCalculationsAdminPage() {
  const [records, setRecords] = useState<EmiCalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Toggle state for filters panel
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filter parameters state
  const [tractorModel, setTractorModel] = useState('');
  const [userName, setUserName] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [tractorIdFilter, setTractorIdFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minDownPayment, setMinDownPayment] = useState('');
  const [maxDownPayment, setMaxDownPayment] = useState('');
  const [minLoanAmount, setMinLoanAmount] = useState('');
  const [maxLoanAmount, setMaxLoanAmount] = useState('');
  const [minInterestRate, setMinInterestRate] = useState('');
  const [maxInterestRate, setMaxInterestRate] = useState('');
  const [minTenure, setMinTenure] = useState('');
  const [maxTenure, setMaxTenure] = useState('');
  const [minEmi, setMinEmi] = useState('');
  const [maxEmi, setMaxEmi] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Debounced search trigger parameters state
  const [debouncedParams, setDebouncedParams] = useState<any>({});

  // Dialog/Modal states
  const [detailRecord, setDetailRecord] = useState<EmiDetailRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editRecord, setEditRecord] = useState<EmiCalculationRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Edit form state
  const [editPrice, setEditPrice] = useState(0);
  const [editDownPayment, setEditDownPayment] = useState(0);
  const [editInterest, setEditInterest] = useState(0);
  const [editTenure, setEditTenure] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Debouncing filters change to prevent rapid API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      const activeFilters: any = {};
      
      if (tractorModel.trim()) activeFilters.tractorModel = tractorModel.trim();
      if (userName.trim()) activeFilters.userName = userName.trim();
      
      const parsedUserId = parseInt(userIdFilter, 10);
      if (!isNaN(parsedUserId)) activeFilters.userId = parsedUserId;

      const parsedTractorId = parseInt(tractorIdFilter, 10);
      if (!isNaN(parsedTractorId)) activeFilters.tractorId = parsedTractorId;

      if (minPrice) activeFilters.minPrice = Number(minPrice);
      if (maxPrice) activeFilters.maxPrice = Number(maxPrice);
      if (minDownPayment) activeFilters.minDownPayment = Number(minDownPayment);
      if (maxDownPayment) activeFilters.maxDownPayment = Number(maxDownPayment);
      if (minLoanAmount) activeFilters.minLoanAmount = Number(minLoanAmount);
      if (maxLoanAmount) activeFilters.maxLoanAmount = Number(maxLoanAmount);
      if (minInterestRate) activeFilters.minInterestRate = Number(minInterestRate);
      if (maxInterestRate) activeFilters.maxInterestRate = Number(maxInterestRate);
      if (minTenure) activeFilters.minTenure = Number(minTenure);
      if (maxTenure) activeFilters.maxTenure = Number(maxTenure);
      if (minEmi) activeFilters.minEmi = Number(minEmi);
      if (maxEmi) activeFilters.maxEmi = Number(maxEmi);
      if (startDate) activeFilters.startDate = startDate;
      if (endDate) activeFilters.endDate = endDate;

      activeFilters.sortBy = sortBy;
      activeFilters.sortOrder = sortOrder;

      setDebouncedParams(activeFilters);
      setPage(1); // Reset page on filter changes
    }, 450);

    return () => clearTimeout(handler);
  }, [
    tractorModel,
    userName,
    userIdFilter,
    tractorIdFilter,
    minPrice,
    maxPrice,
    minDownPayment,
    maxDownPayment,
    minLoanAmount,
    maxLoanAmount,
    minInterestRate,
    maxInterestRate,
    minTenure,
    maxTenure,
    minEmi,
    maxEmi,
    startDate,
    endDate,
    sortBy,
    sortOrder
  ]);

  const fetchCalculations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await emiAPI.getCalculations({
        page,
        limit,
        ...debouncedParams
      });

      if (response.success && response.data) {
        setRecords(response.data.emiCalculations || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
      } else {
        setError(response.message || 'Failed to fetch calculations.');
      }
    } catch (err: any) {
      console.error('Error fetching calculations:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, [page, limit, debouncedParams]);

  const handleClearFilters = () => {
    setTractorModel('');
    setUserName('');
    setUserIdFilter('');
    setTractorIdFilter('');
    setMinPrice('');
    setMaxPrice('');
    setMinDownPayment('');
    setMaxDownPayment('');
    setMinLoanAmount('');
    setMaxLoanAmount('');
    setMinInterestRate('');
    setMaxInterestRate('');
    setMinTenure('');
    setMaxTenure('');
    setMinEmi('');
    setMaxEmi('');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const handleViewDetails = async (id: number) => {
    setLoadingDetail(true);
    setDetailRecord(null);
    try {
      const response = await emiAPI.getCalculationById(id);
      if (response.success && response.data) {
        setDetailRecord(response.data);
      } else {
        alert(response.message || 'Failed to fetch details.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to fetch details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenEdit = (rec: EmiCalculationRecord) => {
    setEditRecord(rec);
    setEditPrice(Number(rec.tractorPrice));
    setEditDownPayment(Number(rec.downPayment));
    setEditInterest(Number(rec.interestRatePct));
    setEditTenure(rec.tenureMonths);
    setEditError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;

    if (editDownPayment >= editPrice) {
      setEditError('Down payment cannot exceed or equal tractor price');
      return;
    }
    if (editDownPayment > editPrice * 0.8) {
      setEditError('Down payment cannot exceed 80% of tractor price');
      return;
    }
    if (editPrice < 50000 || editPrice > 5000000) {
      setEditError('Price must be between ₹50,000 and ₹50,00,000');
      return;
    }
    if (editInterest < 0 || editInterest > 30) {
      setEditError('Interest must be between 0% and 30%');
      return;
    }
    if (editTenure < 6 || editTenure > 84) {
      setEditError('Tenure must be between 6 and 84 months');
      return;
    }

    setSubmittingEdit(true);
    setEditError(null);

    try {
      const response = await emiAPI.updateCalculation(editRecord.id, {
        tractorPrice: editPrice,
        downPayment: editDownPayment,
        interestRatePct: editInterest,
        tenureMonths: editTenure,
      });

      if (response.success) {
        setEditRecord(null);
        fetchCalculations();
      } else {
        setEditError(response.message || 'Failed to update calculation');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteId) return;
    setSubmittingDelete(true);
    try {
      const response = await emiAPI.deleteCalculation(deleteId);
      if (response.success) {
        setDeleteId(null);
        fetchCalculations();
      } else {
        alert(response.message || 'Failed to delete record.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.keys(debouncedParams).some(k => k !== 'sortBy' && k !== 'sortOrder');

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Capitalization (EMI Logs)</h1>
          <p className="text-sm font-bold text-muted mt-1">Audit, filter, and analyze farmer loan simulations and tractor price queries.</p>
        </div>
      </div>

      {/* Main Filter & Sort controls panel */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Quick general search inputs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search by Tractor Model */}
            <div className="relative group w-full sm:w-60">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
                <Search size={15} />
              </div>
              <input 
                type="text" 
                placeholder="Search tractor model..." 
                value={tractorModel}
                onChange={(e) => setTractorModel(e.target.value)}
                className="w-full bg-foreground/5 border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/40 transition-all"
              />
            </div>

            {/* Search by User name */}
            <div className="relative group w-full sm:w-52">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
                <Search size={15} />
              </div>
              <input 
                type="text" 
                placeholder="Search farmer name..." 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-foreground/5 border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/40 transition-all"
              />
            </div>

            {/* Toggle Filters Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase rounded-xl transition-all ${
                showFilters || hasActiveFilters 
                  ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/35' 
                  : 'bg-foreground/5 hover:bg-foreground/10 text-muted border border-transparent'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-[var(--color-brand-green)] text-white text-[9px] rounded-full flex items-center justify-center font-bold">!</span>
              )}
            </button>

            {/* Clear filters trigger */}
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Clear all filters"
              >
                <RotateCcw size={13} />
                Clear
              </button>
            )}
          </div>

          {/* Sorting configurations */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-black text-muted uppercase tracking-wider whitespace-nowrap">Sort By:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="bg-foreground/5 border border-transparent rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none cursor-pointer hover:bg-foreground/10 transition-colors"
            >
              <option value="createdAt-desc">Newest calculations first</option>
              <option value="createdAt-asc">Oldest calculations first</option>
              <option value="tractorPrice-asc">Price: Low → High</option>
              <option value="tractorPrice-desc">Price: High → Low</option>
              <option value="monthlyEmi-asc">EMI: Low → High</option>
              <option value="monthlyEmi-desc">EMI: High → Low</option>
              <option value="interestRatePct-asc">Interest: Low → High</option>
              <option value="interestRatePct-desc">Interest: High → Low</option>
              <option value="tenureMonths-asc">Tenure: Low → High</option>
              <option value="tenureMonths-desc">Tenure: High → Low</option>
              <option value="downPayment-asc">Down Payment: Low → High</option>
              <option value="downPayment-desc">Down Payment: High → Low</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filters panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2 p-4 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] animate-slide-down">
            {/* User ID and Tractor ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">User ID</label>
              <input 
                type="number" 
                placeholder="Specific User ID..." 
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">Tractor ID</label>
              <input 
                type="number" 
                placeholder="Specific Tractor ID..." 
                value={tractorIdFilter}
                onChange={(e) => setTractorIdFilter(e.target.value)}
                className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/40"
              />
            </div>

            {/* Price Ranges */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">Tractor Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Down Payment Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">Down Payment Range (₹)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minDownPayment}
                  onChange={(e) => setMinDownPayment(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxDownPayment}
                  onChange={(e) => setMaxDownPayment(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Loan Amount Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">Loan Amount Range (₹)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minLoanAmount}
                  onChange={(e) => setMinLoanAmount(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxLoanAmount}
                  onChange={(e) => setMaxLoanAmount(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Interest Rate Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">Interest Rate (%)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min %" 
                  value={minInterestRate}
                  onChange={(e) => setMinInterestRate(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Max %" 
                  value={maxInterestRate}
                  onChange={(e) => setMaxInterestRate(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Tenure Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">Tenure Range (Months)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min Mo" 
                  value={minTenure}
                  onChange={(e) => setMinTenure(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Max Mo" 
                  value={maxTenure}
                  onChange={(e) => setMaxTenure(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* EMI Amount Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">EMI Range (₹)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minEmi}
                  onChange={(e) => setMinEmi(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxEmi}
                  onChange={(e) => setMaxEmi(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Date Pickers */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-muted tracking-wider">Calculated Date Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
                <span className="text-muted text-xs">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-background border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center text-xs font-medium text-muted">
          <span>Active Filters:</span>
          {tractorModel && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Model: {tractorModel}
              <button onClick={() => setTractorModel('')} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {userName && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              User Name: {userName}
              <button onClick={() => setUserName('')} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {userIdFilter && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              User ID: {userIdFilter}
              <button onClick={() => setUserIdFilter('')} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {tractorIdFilter && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Tractor ID: {tractorIdFilter}
              <button onClick={() => setTractorIdFilter('')} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Price: {minPrice ? formatCurrency(Number(minPrice)) : '0'} - {maxPrice ? formatCurrency(Number(maxPrice)) : 'Any'}
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(minDownPayment || maxDownPayment) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Down PMT: {minDownPayment ? formatCurrency(Number(minDownPayment)) : '0'} - {maxDownPayment ? formatCurrency(Number(maxDownPayment)) : 'Any'}
              <button onClick={() => { setMinDownPayment(''); setMaxDownPayment(''); }} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(minInterestRate || maxInterestRate) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Interest: {minInterestRate ? `${minInterestRate}%` : '0%'} - {maxInterestRate ? `${maxInterestRate}%` : 'Any'}
              <button onClick={() => { setMinInterestRate(''); setMaxInterestRate(''); }} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(minTenure || maxTenure) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Tenure: {minTenure ? `${minTenure} Mo` : '6'} - {maxTenure ? `${maxTenure} Mo` : '84'}
              <button onClick={() => { setMinTenure(''); setMaxTenure(''); }} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(minLoanAmount || maxLoanAmount) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Loan: {minLoanAmount ? formatCurrency(Number(minLoanAmount)) : '0'} - {maxLoanAmount ? formatCurrency(Number(maxLoanAmount)) : 'Any'}
              <button onClick={() => { setMinLoanAmount(''); setMaxLoanAmount(''); }} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(minEmi || maxEmi) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              EMI: {minEmi ? formatCurrency(Number(minEmi)) : '0'} - {maxEmi ? formatCurrency(Number(maxEmi)) : 'Any'}
              <button onClick={() => { setMinEmi(''); setMaxEmi(''); }} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
          {(startDate || endDate) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-[var(--border-subtle)] rounded-full text-foreground text-[11px] font-bold">
              Date: {startDate ? startDate : 'Any'} to {endDate ? endDate : 'Any'}
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:text-red-500"><X size={12} /></button>
            </span>
          )}
        </div>
      )}

      {/* Main Table view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 glass-panel rounded-2xl gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-brand-green)]/20 border-t-[var(--color-brand-green)] rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase text-muted tracking-widest">Loading capitalization data...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 glass-panel rounded-2xl gap-2 text-red-500">
          <AlertCircle size={32} />
          <span className="font-bold text-sm">{error}</span>
          <button onClick={fetchCalculations} className="text-xs underline font-bold mt-2 hover:text-red-600">Try Again</button>
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 glass-panel rounded-2xl text-muted font-bold text-sm uppercase text-center p-6 gap-2">
          <span>No EMI calculations found matching these criteria.</span>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="spatial-button px-4 py-2 mt-2 rounded-full text-xs">Reset All Filters</button>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-black text-muted uppercase tracking-wider bg-foreground/5">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Model</th>
                  <th className="py-4 px-6 text-right">Price</th>
                  <th className="py-4 px-6 text-right">Down PMT</th>
                  <th className="py-4 px-6 text-right">EMI</th>
                  <th className="py-4 px-6 text-center">Interest</th>
                  <th className="py-4 px-6 text-center">Tenure</th>
                  <th className="py-4 px-6">Calculated Date</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-foreground/80">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-foreground/5 transition-all">
                    <td className="py-4 px-6">
                      {rec.user ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">{rec.user.fullName}</span>
                          <span className="text-[10px] text-muted font-bold mt-0.5">
                            {rec.user.mobile ? (rec.user.mobile.startsWith('+') ? rec.user.mobile : `+91 ${rec.user.mobile}`) : 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted italic font-bold">Guest Visitor</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-black text-xs uppercase">
                      {rec.tractor?.modelName || (
                        <span className="text-muted italic">Manual Entry</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-bold">{formatCurrency(Number(rec.tractorPrice))}</td>
                    <td className="py-4 px-6 text-right font-bold">{formatCurrency(Number(rec.downPayment))}</td>
                    <td className="py-4 px-6 text-right font-black text-[var(--color-brand-green)]">{formatCurrency(Number(rec.monthlyEmi))}</td>
                    <td className="py-4 px-6 text-center font-bold">{rec.interestRatePct}%</td>
                    <td className="py-4 px-6 text-center font-bold">{rec.tenureMonths} Mths</td>
                    <td className="py-4 px-6 text-xs">{formatDate(rec.createdAt)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(rec.id)}
                          className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-[var(--color-brand-green)] transition-all"
                          title="View detailed schedule"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-[var(--color-brand-orange)] transition-all"
                          title="Edit calculation variables"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(rec.id)}
                          className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted hover:text-red-500 transition-all"
                          title="Delete calculation log"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination component */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border-subtle)] bg-foreground/5">
              <Pagination 
                page={page}
                limit={limit}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => { setLimit(l); setPage(1); }}
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in relative">
            <button 
              onClick={() => setDetailRecord(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-foreground/5 hover:bg-red-500/10 text-muted hover:text-red-500 transition-all z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8 border-b border-[var(--border-subtle)]">
              <h3 className="text-xl font-black uppercase text-foreground">EMI Calculation Details</h3>
              <p className="text-xs font-bold text-muted mt-1">Record ID: #{detailRecord.id} | Logged on: {formatDate(detailRecord.createdAt)}</p>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* User Profile Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] text-xs">
                <div>
                  <h4 className="font-black uppercase tracking-wider text-[var(--color-brand-orange)] mb-2">User Profile</h4>
                  {detailRecord.user ? (
                    <div className="flex flex-col gap-1 font-bold text-foreground">
                      <span>Name: <span className="font-medium text-muted">{detailRecord.user.fullName}</span></span>
                      <span>Email: <span className="font-medium text-muted">{detailRecord.user.email}</span></span>
                      <span>Mobile: <span className="font-medium text-muted">{detailRecord.user.mobile}</span></span>
                      <span>Location: <span className="font-medium text-muted">{detailRecord.user.district}, {detailRecord.user.state}</span></span>
                    </div>
                  ) : (
                    <span className="font-bold text-muted italic">Anonymous visitor (No account profile associated)</span>
                  )}
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-wider text-[var(--color-brand-green)] mb-2">Tractor Details</h4>
                  <div className="flex flex-col gap-1 font-bold text-foreground">
                    <span>Model Name: <span className="font-medium text-muted">{detailRecord.tractor?.modelName || 'Manual Custom Entry'}</span></span>
                    <span>Tractor Price: <span className="font-medium text-muted">{formatCurrency(Number(detailRecord.tractorPrice))}</span></span>
                    <span>Down Payment: <span className="font-medium text-muted">{formatCurrency(Number(detailRecord.downPayment))}</span></span>
                    <span>Loan Amount: <span className="font-medium text-muted">{formatCurrency(Number(detailRecord.loanAmount))}</span></span>
                  </div>
                </div>
              </div>

              {/* Finance details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-muted tracking-wider">Monthly EMI</span>
                  <p className="text-lg font-black text-[var(--color-brand-green)] mt-1">{formatCurrency(Number(detailRecord.monthlyEmi))}</p>
                </div>
                <div className="p-4 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-muted tracking-wider">Interest Rate</span>
                  <p className="text-lg font-black text-foreground mt-1">{detailRecord.interestRatePct}% P.A.</p>
                </div>
                <div className="p-4 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-muted tracking-wider">Total Interest</span>
                  <p className="text-lg font-black text-[var(--color-brand-orange)] mt-1">{formatCurrency(Number(detailRecord.totalInterest))}</p>
                </div>
                <div className="p-4 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-muted tracking-wider">Total Payable</span>
                  <p className="text-lg font-black text-foreground mt-1">{formatCurrency(Number(detailRecord.totalPayable))}</p>
                </div>
              </div>

              {/* Repayment Schedule */}
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider text-foreground mb-3">Amortization Table</h4>
                {detailRecord.amortizationTable && detailRecord.amortizationTable.length > 0 ? (
                  <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-background border-b border-[var(--border-subtle)]">
                        <tr className="text-[9px] font-black text-muted uppercase tracking-wider">
                          <th className="py-2.5 px-4 bg-background">Period</th>
                          <th className="py-2.5 px-4 text-right bg-background">Installment</th>
                          <th className="py-2.5 px-4 text-right bg-background">Principal Paid</th>
                          <th className="py-2.5 px-4 text-right bg-background">Interest Paid</th>
                          <th className="py-2.5 px-4 text-right bg-background">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-foreground/5 font-semibold text-foreground/80">
                        {detailRecord.amortizationTable.map((item) => (
                          <tr key={item.period} className="hover:bg-foreground/5 transition-colors">
                            <td className="py-2.5 px-4 font-black">Month {item.period}</td>
                            <td className="py-2.5 px-4 text-right font-bold">{formatCurrency(Number(item.emiAmount))}</td>
                            <td className="py-2.5 px-4 text-right text-emerald-600">+{formatCurrency(Number(item.principalPaid))}</td>
                            <td className="py-2.5 px-4 text-right text-[var(--color-brand-orange)]">-{formatCurrency(Number(item.interestPaid))}</td>
                            <td className="py-2.5 px-4 text-right font-black">{formatCurrency(Number(item.remainingBalance))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted italic border border-dashed border-[var(--border-subtle)] rounded-2xl">
                    No detailed amortization data generated for this query.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in relative p-6 md:p-8">
            <button 
              onClick={() => setEditRecord(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-foreground/5 hover:bg-red-500/10 text-muted hover:text-red-500 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black uppercase text-foreground mb-4">Edit Calculation Variables</h3>
            <p className="text-xs font-bold text-muted mb-6">Modify calculations parameters for Record #{editRecord.id}.</p>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4 text-sm font-semibold">
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} /> {editError}
                </div>
              )}

              {/* Price input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted">Tractor Price</label>
                <input 
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseInt(e.target.value, 10))}
                  className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/60 transition-colors"
                  required
                />
              </div>

              {/* Downpayment input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted">Down Payment</label>
                <input 
                  type="number"
                  value={editDownPayment}
                  onChange={(e) => setEditDownPayment(parseInt(e.target.value, 10))}
                  className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/60 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Interest Rate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted">Interest Rate (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={editInterest}
                    onChange={(e) => setEditInterest(parseFloat(e.target.value))}
                    className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/60 transition-colors"
                    required
                  />
                </div>

                {/* Tenure */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted">Tenure (Months)</label>
                  <input 
                    type="number"
                    value={editTenure}
                    onChange={(e) => setEditTenure(parseInt(e.target.value, 10))}
                    className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/60 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="w-full py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="w-full py-3 bg-[var(--color-brand-orange)] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-orange-light)] transition-all disabled:opacity-50"
                >
                  {submittingEdit ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-scale-up">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-full mb-4">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-lg font-black uppercase text-foreground mb-2">Delete calculation record?</h3>
            <p className="text-xs font-bold text-muted mb-6">Are you sure you want to permanently delete calculation log #{deleteId}? This action cannot be undone.</p>
            
            <div className="flex gap-3 w-full text-xs font-black uppercase tracking-wider">
              <button 
                type="button" 
                onClick={() => setDeleteId(null)}
                className="w-full py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl transition-all"
              >
                No, Keep
              </button>
              <button 
                type="button" 
                onClick={handleDeleteSubmit}
                disabled={submittingDelete}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {submittingDelete ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple helper icon placeholder for AlertTriangle inside modal since we didn't import it globally
function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
