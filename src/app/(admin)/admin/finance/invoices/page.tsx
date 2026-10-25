'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  billedTo: string;
  gstin?: string;
  description: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  invoiceDate: string;
  paymentMode: string;
  status: 'PAID' | 'REFUNDED' | 'UNPAID';
}

const DEFAULT_INVOICES: InvoiceRecord[] = [
  {
    id: '1',
    invoiceNo: 'TD-INV-2026-00104',
    billedTo: 'Kisan Mahindra Tractors Pune',
    gstin: '27AABCT1234F1ZQ',
    description: 'Annual Platinum Dealership Platform Subscription',
    taxableAmount: 127118,
    cgst: 11440.62,
    sgst: 11440.62,
    totalAmount: 149999,
    invoiceDate: '2026-10-25',
    paymentMode: 'Net Banking / Razorpay',
    status: 'PAID',
  },
  {
    id: '2',
    invoiceNo: 'TD-INV-2026-00103',
    billedTo: 'Rameshwar Patil',
    description: 'Homepage Hero 7-Day Listing Boost (Swaraj 744 FE)',
    taxableAmount: 422.88,
    cgst: 38.06,
    sgst: 38.06,
    totalAmount: 499,
    invoiceDate: '2026-10-24',
    paymentMode: 'UPI',
    status: 'PAID',
  },
  {
    id: '3',
    invoiceNo: 'TD-INV-2026-00102',
    billedTo: 'Vinayak Deshmukh',
    description: 'Certified 50-Point Physical Tractor Inspection',
    taxableAmount: 1270.34,
    cgst: 114.33,
    sgst: 114.33,
    totalAmount: 1499,
    invoiceDate: '2026-10-23',
    paymentMode: 'UPI',
    status: 'PAID',
  },
  {
    id: '4',
    invoiceNo: 'TD-INV-2026-00101',
    billedTo: 'Sai Samarth Swaraj Hub',
    gstin: '27AABCS5678G2ZR',
    description: 'Quarterly Gold Verified Dealership SaaS',
    taxableAmount: 16948.31,
    cgst: 1525.35,
    sgst: 1525.35,
    totalAmount: 19999,
    invoiceDate: '2026-10-20',
    paymentMode: 'Corporate Card',
    status: 'PAID',
  },
];

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(DEFAULT_INVOICES);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      return (
        !search ||
        i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        i.billedTo.toLowerCase().includes(search.toLowerCase()) ||
        (i.gstin && i.gstin.toLowerCase().includes(search.toLowerCase())) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [invoices, search]);

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalGst = invoices.reduce((acc, i) => acc + i.cgst + i.sgst, 0);

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  GST Invoices & Billing
                </h1>
                <span className="rounded-lg bg-blue-500/10 px-2.5 py-0.5 text-xs font-black text-blue-400">
                  Tax Accounting
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Generate and archive compliant GST tax invoices for seller promotions, inspections, and SaaS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Total Billed Gross
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">
            ₹{totalInvoiced.toLocaleString('en-IN')}
          </div>
          <span className="text-muted text-xs font-semibold">Total Revenue Invoiced</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            GST Collected (18%)
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">
            ₹{Math.round(totalGst).toLocaleString('en-IN')}
          </div>
          <span className="text-muted text-xs font-semibold">CGST 9% + SGST 9%</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Invoices Issued
          </span>
          <div className="text-blue-400 mt-1 text-2xl font-black">{invoices.length}</div>
          <span className="text-muted text-xs font-semibold">Digital Tax Records</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Compliance
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">100% Valid</div>
          <span className="text-muted text-xs font-semibold">GSTR-1 Ready</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, buyer name, or GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Invoice No & Date</th>
                <th className="px-5 py-4">Billed To (Entity)</th>
                <th className="px-5 py-4">Service Description</th>
                <th className="px-5 py-4">Taxable Base</th>
                <th className="px-5 py-4">GST (18%)</th>
                <th className="px-5 py-4">Total Amount</th>
                <th className="px-5 py-4 text-right">View / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="transition-colors hover:bg-foreground/[0.02]"
                >
                  <td className="px-5 py-4 font-mono">
                    <span className="text-foreground text-xs font-black block">
                      {inv.invoiceNo}
                    </span>
                    <span className="text-[10px] text-muted">
                      {inv.invoiceDate}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-foreground text-xs font-black">
                        {inv.billedTo}
                      </span>
                      {inv.gstin && (
                        <span className="font-mono text-[10px] text-muted font-bold">
                          GST: {inv.gstin}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-foreground text-xs font-medium max-w-xs line-clamp-1">
                      {inv.description}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    ₹{Math.round(inv.taxableAmount).toLocaleString('en-IN')}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-muted">
                    ₹{Math.round(inv.cgst + inv.sgst).toLocaleString('en-IN')}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs font-black text-emerald-400">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10"
                    >
                      <Printer size={12} />
                      <span>Print GST</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE GST INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-[var(--border-subtle)] bg-background p-8 shadow-2xl animate-scale-up">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-6 mb-6">
              <div>
                <h2 className="text-foreground text-2xl font-black">TRACTOR DOST INDIA</h2>
                <p className="text-muted text-xs mt-1">Authorized Agri Marketplace & Valuations</p>
                <p className="text-muted text-xs font-mono">GSTIN: 27AABCT9988Z1Z5 • State: Maharashtra (27)</p>
              </div>
              <div className="text-right">
                <span className="inline-flex rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400 border border-emerald-500/20">
                  TAX INVOICE
                </span>
                <p className="font-mono text-xs font-black text-foreground mt-2">{selectedInvoice.invoiceNo}</p>
                <p className="text-muted text-xs font-mono">Date: {selectedInvoice.invoiceDate}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 mb-6">
              <span className="text-muted text-[10px] font-black uppercase tracking-wider block mb-1">
                Billed To Customer / Dealership
              </span>
              <p className="text-foreground font-black text-sm">{selectedInvoice.billedTo}</p>
              {selectedInvoice.gstin && (
                <p className="text-muted font-mono text-xs mt-0.5">GSTIN: {selectedInvoice.gstin}</p>
              )}
            </div>

            {/* Itemized Table */}
            <table className="w-full text-left text-xs mb-6">
              <thead className="border-b border-[var(--border-subtle)] text-[10px] font-black uppercase text-muted">
                <tr>
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-right">Taxable</th>
                  <th className="py-2 text-right">GST (18%)</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                <tr>
                  <td className="py-3 font-semibold text-foreground">{selectedInvoice.description}</td>
                  <td className="py-3 font-mono text-right text-muted">₹{Math.round(selectedInvoice.taxableAmount).toLocaleString('en-IN')}</td>
                  <td className="py-3 font-mono text-right text-muted">₹{Math.round(selectedInvoice.cgst + selectedInvoice.sgst).toLocaleString('en-IN')}</td>
                  <td className="py-3 font-mono text-right font-black text-foreground">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {/* Total Breakdown */}
            <div className="border-t border-[var(--border-subtle)] pt-4 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-muted">
                <span>Taxable Value:</span>
                <span>₹{Math.round(selectedInvoice.taxableAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>CGST (9%):</span>
                <span>₹{selectedInvoice.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>SGST (9%):</span>
                <span>₹{selectedInvoice.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-[var(--border-subtle)]">
                <span>Net Total Invoice:</span>
                <span className="text-emerald-400">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
