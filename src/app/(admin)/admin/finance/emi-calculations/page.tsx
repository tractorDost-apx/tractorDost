'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  X,
  Calculator,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';
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
    sortOrder,
  ]);

  const fetchCalculations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await emiAPI.getCalculations({
        page,
        limit,
        ...debouncedParams,
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
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.keys(debouncedParams).some(
    (k) => k !== 'sortBy' && k !== 'sortOrder'
  );

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight uppercase">
            Capitalization (EMI Logs)
          </h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Audit, filter, and analyze farmer loan simulations and tractor price queries.
          </p>
        </div>
      </div>

      {/* Main Filter & Sort controls panel */}
      <div className="glass-panel flex flex-col gap-4 rounded-2xl p-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Quick general search inputs */}
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            {/* Search by Tractor Model */}
            <div className="group relative w-full sm:w-60">
              <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
                <Search size={15} />
              </div>
              <input
                type="text"
                placeholder="Search tractor model..."
                value={tractorModel}
                onChange={(e) => setTractorModel(e.target.value)}
                className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-xl border border-transparent py-2 pr-4 pl-9 text-xs font-semibold transition-all focus:border-[var(--color-brand-green)]/40 focus:outline-none"
              />
            </div>

            {/* Search by User name */}
            <div className="group relative w-full sm:w-52">
              <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
                <Search size={15} />
              </div>
              <input
                type="text"
                placeholder="Search farmer name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-xl border border-transparent py-2 pr-4 pl-9 text-xs font-semibold transition-all focus:border-[var(--color-brand-green)]/40 focus:outline-none"
              />
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase transition-all ${
                showFilters || hasActiveFilters
                  ? 'border border-[var(--color-brand-green)]/35 bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]'
                  : 'bg-foreground/5 hover:bg-foreground/10 text-muted border border-transparent'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-[9px] font-bold text-white">
                  !
                </span>
              )}
            </button>

            {/* Clear filters trigger */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10"
                title="Clear all filters"
              >
                <RotateCcw size={13} />
                Clear
              </button>
            )}
          </div>

          {/* Sorting configurations */}
          <div className="flex w-full items-center justify-end gap-2 md:w-auto">
            <span className="text-muted text-xs font-black tracking-wider whitespace-nowrap uppercase">
              Sort By:
            </span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="bg-foreground/5 text-foreground hover:bg-foreground/10 cursor-pointer rounded-xl border border-transparent px-3 py-2 text-xs font-bold transition-colors focus:outline-none"
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
          <div className="bg-foreground/5 animate-slide-down mt-2 grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 sm:grid-cols-2 md:grid-cols-4">
            {/* User ID and Tractor ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                User ID
              </label>
              <input
                type="number"
                placeholder="Specific User ID..."
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:border-[var(--color-brand-green)]/40 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                Tractor ID
              </label>
              <input
                type="number"
                placeholder="Specific Tractor ID..."
                value={tractorIdFilter}
                onChange={(e) => setTractorIdFilter(e.target.value)}
                className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:border-[var(--color-brand-green)]/40 focus:outline-none"
              />
            </div>

            {/* Price Ranges */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                Tractor Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Down Payment Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                Down Payment Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minDownPayment}
                  onChange={(e) => setMinDownPayment(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxDownPayment}
                  onChange={(e) => setMaxDownPayment(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Loan Amount Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                Loan Amount Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minLoanAmount}
                  onChange={(e) => setMinLoanAmount(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxLoanAmount}
                  onChange={(e) => setMaxLoanAmount(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Interest Rate Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                Interest Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min %"
                  value={minInterestRate}
                  onChange={(e) => setMinInterestRate(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max %"
                  value={maxInterestRate}
                  onChange={(e) => setMaxInterestRate(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Tenure Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                Tenure Range (Months)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Mo"
                  value={minTenure}
                  onChange={(e) => setMinTenure(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max Mo"
                  value={maxTenure}
                  onChange={(e) => setMaxTenure(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* EMI Amount Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                EMI Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minEmi}
                  onChange={(e) => setMinEmi(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                <span className="text-muted text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxEmi}
                  onChange={(e) => setMaxEmi(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Date Pickers */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                Calculated Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
                <span className="text-muted text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="text-muted flex flex-wrap items-center gap-2 text-xs font-medium">
          <span>Active Filters:</span>
          {tractorModel && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Model: {tractorModel}
              <button onClick={() => setTractorModel('')} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          )}
          {userName && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              User Name: {userName}
              <button onClick={() => setUserName('')} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          )}
          {userIdFilter && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              User ID: {userIdFilter}
              <button onClick={() => setUserIdFilter('')} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          )}
          {tractorIdFilter && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Tractor ID: {tractorIdFilter}
              <button onClick={() => setTractorIdFilter('')} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Price: {minPrice ? formatCurrency(Number(minPrice)) : '0'} -{' '}
              {maxPrice ? formatCurrency(Number(maxPrice)) : 'Any'}
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(minDownPayment || maxDownPayment) && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Down PMT: {minDownPayment ? formatCurrency(Number(minDownPayment)) : '0'} -{' '}
              {maxDownPayment ? formatCurrency(Number(maxDownPayment)) : 'Any'}
              <button
                onClick={() => {
                  setMinDownPayment('');
                  setMaxDownPayment('');
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(minInterestRate || maxInterestRate) && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Interest: {minInterestRate ? `${minInterestRate}%` : '0%'} -{' '}
              {maxInterestRate ? `${maxInterestRate}%` : 'Any'}
              <button
                onClick={() => {
                  setMinInterestRate('');
                  setMaxInterestRate('');
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(minTenure || maxTenure) && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Tenure: {minTenure ? `${minTenure} Mo` : '6'} - {maxTenure ? `${maxTenure} Mo` : '84'}
              <button
                onClick={() => {
                  setMinTenure('');
                  setMaxTenure('');
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(minLoanAmount || maxLoanAmount) && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Loan: {minLoanAmount ? formatCurrency(Number(minLoanAmount)) : '0'} -{' '}
              {maxLoanAmount ? formatCurrency(Number(maxLoanAmount)) : 'Any'}
              <button
                onClick={() => {
                  setMinLoanAmount('');
                  setMaxLoanAmount('');
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(minEmi || maxEmi) && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              EMI: {minEmi ? formatCurrency(Number(minEmi)) : '0'} -{' '}
              {maxEmi ? formatCurrency(Number(maxEmi)) : 'Any'}
              <button
                onClick={() => {
                  setMinEmi('');
                  setMaxEmi('');
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(startDate || endDate) && (
            <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-bold">
              Date: {startDate ? startDate : 'Any'} to {endDate ? endDate : 'Any'}
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Main Table view */}
      {loading ? (
        <div className="glass-panel flex h-64 flex-col items-center justify-center gap-4 rounded-2xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-brand-green)]/20 border-t-[var(--color-brand-green)]" />
          <span className="text-muted text-xs font-bold tracking-widest uppercase">
            Loading capitalization data...
          </span>
        </div>
      ) : error ? (
        <div className="glass-panel flex h-64 flex-col items-center justify-center gap-2 rounded-2xl text-red-500">
          <AlertCircle size={32} />
          <span className="text-sm font-bold">{error}</span>
          <button
            onClick={fetchCalculations}
            className="mt-2 text-xs font-bold underline hover:text-red-600"
          >
            Try Again
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="glass-panel text-muted flex h-64 flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center text-sm font-bold uppercase">
          <span>No EMI calculations found matching these criteria.</span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="spatial-button mt-2 rounded-full px-4 py-2 text-xs"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="glass-panel flex flex-col overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-muted bg-foreground/5 border-b border-[var(--border-subtle)] text-[10px] font-black tracking-wider uppercase">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Down PMT</th>
                  <th className="px-6 py-4 text-right">EMI</th>
                  <th className="px-6 py-4 text-center">Interest</th>
                  <th className="px-6 py-4 text-center">Tenure</th>
                  <th className="px-6 py-4">Calculated Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80 divide-y divide-[var(--border-subtle)] font-medium">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-foreground/5 transition-all">
                    <td className="px-6 py-4">
                      {rec.user ? (
                        <div className="flex flex-col">
                          <span className="text-foreground text-sm font-bold">
                            {rec.user.fullName}
                          </span>
                          <span className="text-muted mt-0.5 text-[10px] font-bold">
                            {rec.user.mobile
                              ? rec.user.mobile.startsWith('+')
                                ? rec.user.mobile
                                : `+91 ${rec.user.mobile}`
                              : 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs font-bold italic">Guest Visitor</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-black uppercase">
                      {rec.tractor?.modelName || (
                        <span className="text-muted italic">Manual Entry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {formatCurrency(Number(rec.tractorPrice))}
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {formatCurrency(Number(rec.downPayment))}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[var(--color-brand-green)]">
                      {formatCurrency(Number(rec.monthlyEmi))}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{rec.interestRatePct}%</td>
                    <td className="px-6 py-4 text-center font-bold">{rec.tenureMonths} Mths</td>
                    <td className="px-6 py-4 text-xs">{formatDate(rec.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(rec.id)}
                          className="hover:bg-foreground/5 text-muted rounded-lg p-1.5 transition-all hover:text-[var(--color-brand-green)]"
                          title="View detailed schedule"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="hover:bg-foreground/5 text-muted rounded-lg p-1.5 transition-all hover:text-[var(--color-brand-orange)]"
                          title="Edit calculation variables"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(rec.id)}
                          className="hover:bg-foreground/5 text-muted rounded-lg p-1.5 transition-all hover:text-red-500"
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
            <div className="bg-foreground/5 border-t border-[var(--border-subtle)] p-4">
              <Pagination
                page={page}
                limit={limit}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-fade-in relative flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl">
            <button
              onClick={() => setDetailRecord(null)}
              className="bg-foreground/5 text-muted absolute top-4 right-4 z-10 rounded-full p-2 transition-all hover:bg-red-500/10 hover:text-red-500"
            >
              <X size={18} />
            </button>

            <div className="border-b border-[var(--border-subtle)] p-6 md:p-8">
              <h3 className="text-foreground text-xl font-black uppercase">
                EMI Calculation Details
              </h3>
              <p className="text-muted mt-1 text-xs font-bold">
                Record ID: #{detailRecord.id} | Logged on: {formatDate(detailRecord.createdAt)}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-8">
              {/* User Profile Card */}
              <div className="bg-foreground/5 grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border-subtle)] p-4 text-xs md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-black tracking-wider text-[var(--color-brand-orange)] uppercase">
                    User Profile
                  </h4>
                  {detailRecord.user ? (
                    <div className="text-foreground flex flex-col gap-1 font-bold">
                      <span>
                        Name:{' '}
                        <span className="text-muted font-medium">{detailRecord.user.fullName}</span>
                      </span>
                      <span>
                        Email:{' '}
                        <span className="text-muted font-medium">{detailRecord.user.email}</span>
                      </span>
                      <span>
                        Mobile:{' '}
                        <span className="text-muted font-medium">{detailRecord.user.mobile}</span>
                      </span>
                      <span>
                        Location:{' '}
                        <span className="text-muted font-medium">
                          {detailRecord.user.district}, {detailRecord.user.state}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted font-bold italic">
                      Anonymous visitor (No account profile associated)
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="mb-2 font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                    Tractor Details
                  </h4>
                  <div className="text-foreground flex flex-col gap-1 font-bold">
                    <span>
                      Model Name:{' '}
                      <span className="text-muted font-medium">
                        {detailRecord.tractor?.modelName || 'Manual Custom Entry'}
                      </span>
                    </span>
                    <span>
                      Tractor Price:{' '}
                      <span className="text-muted font-medium">
                        {formatCurrency(Number(detailRecord.tractorPrice))}
                      </span>
                    </span>
                    <span>
                      Down Payment:{' '}
                      <span className="text-muted font-medium">
                        {formatCurrency(Number(detailRecord.downPayment))}
                      </span>
                    </span>
                    <span>
                      Loan Amount:{' '}
                      <span className="text-muted font-medium">
                        {formatCurrency(Number(detailRecord.loanAmount))}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Finance details */}
              <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                    Monthly EMI
                  </span>
                  <p className="mt-1 text-lg font-black text-[var(--color-brand-green)]">
                    {formatCurrency(Number(detailRecord.monthlyEmi))}
                  </p>
                </div>
                <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                    Interest Rate
                  </span>
                  <p className="text-foreground mt-1 text-lg font-black">
                    {detailRecord.interestRatePct}% P.A.
                  </p>
                </div>
                <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                    Total Interest
                  </span>
                  <p className="mt-1 text-lg font-black text-[var(--color-brand-orange)]">
                    {formatCurrency(Number(detailRecord.totalInterest))}
                  </p>
                </div>
                <div className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <span className="text-muted text-[10px] font-black tracking-wider uppercase">
                    Total Payable
                  </span>
                  <p className="text-foreground mt-1 text-lg font-black">
                    {formatCurrency(Number(detailRecord.totalPayable))}
                  </p>
                </div>
              </div>

              {/* Repayment Schedule */}
              <div>
                <h4 className="text-foreground mb-3 text-sm font-black tracking-wider uppercase">
                  Amortization Table
                </h4>
                {detailRecord.amortizationTable && detailRecord.amortizationTable.length > 0 ? (
                  <div className="max-h-60 overflow-hidden overflow-y-auto rounded-2xl border border-[var(--border-subtle)]">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-background sticky top-0 border-b border-[var(--border-subtle)]">
                        <tr className="text-muted text-[9px] font-black tracking-wider uppercase">
                          <th className="bg-background px-4 py-2.5">Period</th>
                          <th className="bg-background px-4 py-2.5 text-right">Installment</th>
                          <th className="bg-background px-4 py-2.5 text-right">Principal Paid</th>
                          <th className="bg-background px-4 py-2.5 text-right">Interest Paid</th>
                          <th className="bg-background px-4 py-2.5 text-right">
                            Remaining Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-foreground/5 text-foreground/80 divide-y font-semibold">
                        {detailRecord.amortizationTable.map((item) => (
                          <tr key={item.period} className="hover:bg-foreground/5 transition-colors">
                            <td className="px-4 py-2.5 font-black">Month {item.period}</td>
                            <td className="px-4 py-2.5 text-right font-bold">
                              {formatCurrency(Number(item.emiAmount))}
                            </td>
                            <td className="px-4 py-2.5 text-right text-emerald-600">
                              +{formatCurrency(Number(item.principalPaid))}
                            </td>
                            <td className="px-4 py-2.5 text-right text-[var(--color-brand-orange)]">
                              -{formatCurrency(Number(item.interestPaid))}
                            </td>
                            <td className="px-4 py-2.5 text-right font-black">
                              {formatCurrency(Number(item.remainingBalance))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted rounded-2xl border border-dashed border-[var(--border-subtle)] py-6 text-center text-xs italic">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-fade-in relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-2xl md:p-8">
            <button
              onClick={() => setEditRecord(null)}
              className="bg-foreground/5 text-muted absolute top-4 right-4 rounded-full p-2 transition-all hover:bg-red-500/10 hover:text-red-500"
            >
              <X size={18} />
            </button>

            <h3 className="text-foreground mb-4 text-xl font-black uppercase">
              Edit Calculation Variables
            </h3>
            <p className="text-muted mb-6 text-xs font-bold">
              Modify calculations parameters for Record #{editRecord.id}.
            </p>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4 text-sm font-semibold">
              {editError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs font-bold text-red-500">
                  <AlertCircle size={14} /> {editError}
                </div>
              )}

              {/* Price input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted text-xs font-black tracking-wider uppercase">
                  Tractor Price
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseInt(e.target.value, 10))}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-2 lg:px-3 py-3 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/60 focus:outline-none"
                  required
                />
              </div>

              {/* Downpayment input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted text-xs font-black tracking-wider uppercase">
                  Down Payment
                </label>
                <input
                  type="number"
                  value={editDownPayment}
                  onChange={(e) => setEditDownPayment(parseInt(e.target.value, 10))}
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-2 lg:px-3 py-3 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/60 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Interest Rate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-black tracking-wider uppercase">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editInterest}
                    onChange={(e) => setEditInterest(parseFloat(e.target.value))}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-2 lg:px-3 py-3 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/60 focus:outline-none"
                    required
                  />
                </div>

                {/* Tenure */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-black tracking-wider uppercase">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={editTenure}
                    onChange={(e) => setEditTenure(parseInt(e.target.value, 10))}
                    className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-2 lg:px-3 py-3 text-sm font-bold transition-colors focus:border-[var(--color-brand-green)]/60 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground w-full rounded-xl py-3 text-xs font-black tracking-wider uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="w-full rounded-xl bg-[var(--color-brand-orange)] py-3 text-xs font-black tracking-wider text-white uppercase transition-all hover:bg-[var(--color-brand-orange-light)] disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-scale-up flex w-full max-w-sm flex-col items-center rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-center shadow-2xl">
            <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-foreground mb-2 text-lg font-black uppercase">
              Delete calculation record?
            </h3>
            <p className="text-muted mb-6 text-xs font-bold">
              Are you sure you want to permanently delete calculation log #{deleteId}? This action
              cannot be undone.
            </p>

            <div className="flex w-full gap-3 text-xs font-black tracking-wider uppercase">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="bg-foreground/5 hover:bg-foreground/10 text-foreground w-full rounded-xl py-3 transition-all"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submittingDelete}
                className="w-full rounded-xl bg-red-500 py-3 text-white transition-all hover:bg-red-600 disabled:opacity-50"
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
