'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Download,
  RefreshCw,
  Wallet,
  Receipt,
  X,
  ExternalLink,
} from 'lucide-react';

type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
type PaymentMethod = 'RAZORPAY_UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';

interface PaymentRecord {
  id: string;
  transactionRef: string;
  customerName: string;
  customerMobile: string;
  amount: number;
  purpose: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayFee: number;
  createdAt: string;
}

const STATUS_META: Record<PaymentStatus, { label: string; bg: string; text: string; icon: any }> = {
  SUCCESS: { label: 'Captured', bg: 'border-emerald-500/30 bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2 },
  PENDING: { label: 'Pending Bank OTP', bg: 'border-amber-500/30 bg-amber-500/10', text: 'text-amber-500', icon: Clock },
  FAILED: { label: 'Payment Failed', bg: 'border-rose-500/30 bg-rose-500/10', text: 'text-rose-400', icon: XCircle },
  REFUNDED: { label: 'Refund Processed', bg: 'border-blue-500/30 bg-blue-500/10', text: 'text-blue-400', icon: AlertCircle },
};

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'PAY-10041',
    transactionRef: 'rzp_live_9a8b7c6d5e',
    customerName: 'Kisan Tractor Showroom Pune',
    customerMobile: '9822123456',
    amount: 9999,
    purpose: 'Gold Dealership Annual Subscription',
    method: 'RAZORPAY_UPI',
    status: 'SUCCESS',
    gatewayFee: 199.98,
    createdAt: '2026-10-25T14:32:00Z',
  },
  {
    id: 'PAY-10040',
    transactionRef: 'rzp_live_1f2e3d4c5b',
    customerName: 'Ramesh Patil',
    customerMobile: '9850987654',
    amount: 499,
    purpose: 'Homepage Hero Boost (Swaraj 744 FE)',
    method: 'RAZORPAY_UPI',
    status: 'SUCCESS',
    gatewayFee: 9.98,
    createdAt: '2026-10-25T11:15:00Z',
  },
  {
    id: 'PAY-10039',
    transactionRef: 'rzp_live_8g7f6e5d4c',
    customerName: 'Vinayak Deshmukh',
    customerMobile: '9765432198',
    amount: 249,
    purpose: 'Featured Listing Boost (Mahindra 575 DI)',
    method: 'CREDIT_CARD',
    status: 'SUCCESS',
    gatewayFee: 4.98,
    createdAt: '2026-10-24T18:40:00Z',
  },
  {
    id: 'PAY-10038',
    transactionRef: 'rzp_live_3h4j5k6m7n',
    customerName: 'Santosh Shinde',
    customerMobile: '9921456789',
    amount: 1499,
    purpose: '50-Point Physical Inspection Fee',
    method: 'NET_BANKING',
    status: 'PENDING',
    gatewayFee: 0,
    createdAt: '2026-10-24T16:05:00Z',
  },
  {
    id: 'PAY-10037',
    transactionRef: 'rzp_live_0x9y8z7w6v',
    customerName: 'Gajanan Kute',
    customerMobile: '9881234567',
    amount: 149,
    purpose: 'Urgent Sale Tag Boost',
    method: 'RAZORPAY_UPI',
    status: 'FAILED',
    gatewayFee: 0,
    createdAt: '2026-10-23T09:22:00Z',
  },
];

export default function PaymentsAdminPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(DEFAULT_PAYMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !search ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionRef.toLowerCase().includes(search.toLowerCase()) ||
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.customerMobile.includes(search) ||
        p.purpose.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  // KPIs
  const totalCaptured = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((acc, p) => acc + p.amount, 0);
  const successCount = payments.filter((p) => p.status === 'SUCCESS').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const failedCount = payments.filter((p) => p.status === 'FAILED').length;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-sm">
              <Receipt size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Payments & Gateway Ledger
                </h1>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-500">
                  Razorpay & UPI
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Real-time reconciliation of listing boosts, subscription dues, and inspection transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Settled Volume
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">
            ₹{totalCaptured.toLocaleString('en-IN')}
          </div>
          <span className="text-muted text-xs font-semibold">Net Captured Gross</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Successful Orders
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{successCount}</div>
          <span className="text-muted text-xs font-semibold">100% Reconciled</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Pending Clearances
          </span>
          <div className="text-amber-500 mt-1 text-2xl font-black">{pendingCount}</div>
          <span className="text-muted text-xs font-semibold">Gateway Processing</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Failed Attempts
          </span>
          <div className="text-rose-400 mt-1 text-2xl font-black">{failedCount}</div>
          <span className="text-muted text-xs font-semibold">Bank Dropped</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payment ID, Razorpay ref, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:outline-none"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="SUCCESS">Captured / Paid</option>
            <option value="PENDING">Pending Settlement</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Transaction Details</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Payment Purpose</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Method</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredPayments.map((p) => {
                const meta = STATUS_META[p.status];
                const Icon = meta.icon;

                return (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col font-mono">
                        <span className="text-foreground text-xs font-black">
                          {p.id}
                        </span>
                        <span className="text-[10px] text-muted">
                          {p.transactionRef}
                        </span>
                        <span className="text-[9px] text-muted mt-0.5">
                          {new Date(p.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground text-xs font-black">
                          {p.customerName}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          +91 {p.customerMobile}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-foreground text-xs font-medium max-w-xs line-clamp-1">
                        {p.purpose}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-black text-foreground">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4 font-mono text-[10px] text-muted">
                      {p.method.replace(/_/g, ' ')}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${meta.bg} ${meta.text}`}
                      >
                        <Icon size={11} />
                        {meta.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-2.5 py-1 text-xs font-bold text-foreground hover:bg-foreground/10"
                      >
                        <Receipt size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-emerald-400" />
                <h3 className="text-foreground text-base font-black">
                  Transaction Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Payment ID:</span>
                <span className="font-mono font-black text-foreground">{selectedPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Gateway Reference:</span>
                <span className="font-mono text-muted">{selectedPayment.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Customer Name:</span>
                <span className="font-bold text-foreground">{selectedPayment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Item / Description:</span>
                <span className="font-medium text-foreground text-right max-w-[200px]">{selectedPayment.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Method:</span>
                <span className="font-mono font-bold text-foreground">{selectedPayment.method}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-subtle)] pt-3 text-sm font-black">
                <span className="text-foreground">Total Paid:</span>
                <span className="text-emerald-400 font-mono">₹{selectedPayment.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPayment(null)}
              className="w-full mt-6 rounded-xl bg-[var(--color-brand-green)] py-2 text-xs font-black text-white hover:opacity-95"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
