'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  Building2,
  Headphones,
  HelpCircle,
} from 'lucide-react';
import { leadAPI } from '@/lib/api/leads';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    inquiryType: 'FARMER_SUPPORT',
    state: '',
    district: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const cleanMobile = formData.mobile.replace(/\s+/g, '').replace(/^\+91/, '');
      await leadAPI.createLead({
        leadType: 'CALLBACK',
        name: formData.name.trim(),
        mobile: cleanMobile,
        email: formData.email?.trim() || undefined,
        state: formData.state?.trim() || 'Maharashtra',
        district: formData.district?.trim() || undefined,
        message: `[Inquiry: ${formData.inquiryType}] ${formData.message}`.trim().slice(0, 1000),
        sourcePage: '/contact',
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit contact inquiry:', err);
      setErrorMessage(
        err?.response?.data?.message || 'Failed to submit message. Please try again or call our helpline.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="relative flex flex-col items-center justify-center pb-10 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Headphones size={14} /> 24/7 Farmer Support & Inquiries
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Get in Touch with <span className="text-[var(--color-brand-green)]">TractorDost</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Have questions about tractor pricing, loan eligibility, or dealer partnerships? Our agricultural advisors are here to help.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Main Grid: Contact Cards + Contact Form */}
      <div className="mb-20 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column: Direct Contact Info Cards */}
        <div className="space-y-6 lg:col-span-5">
          {/* Toll Free Phone */}
          <div className="rounded-3xl border border-border/50 bg-card/60 p-6 shadow-sm transition-all hover:border-[var(--color-brand-green)]/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Phone size={24} />
            </div>
            <h3 className="text-foreground text-lg font-black">Customer Helpline</h3>
            <p className="text-muted-foreground text-xs mb-3">Toll-free assistance for farmers across India</p>
            <a
              href="tel:18002093678"
              className="text-foreground text-xl font-extrabold hover:text-[var(--color-brand-green)] transition-colors"
            >
              1800-209-DOST (3678)
            </a>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Clock size={12} /> Mon - Sat: 8:30 AM to 8:00 PM IST
            </div>
          </div>

          {/* Email Support */}
          <div className="rounded-3xl border border-border/50 bg-card/60 p-6 shadow-sm transition-all hover:border-[var(--color-brand-green)]/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Mail size={24} />
            </div>
            <h3 className="text-foreground text-lg font-black">Email Support</h3>
            <p className="text-muted-foreground text-xs mb-3">For general inquiries, documentation & feedback</p>
            <div className="space-y-1 text-sm font-bold text-foreground">
              <div>
                <a href="mailto:support@tractordost.com" className="hover:text-[var(--color-brand-green)]">
                  support@tractordost.com
                </a>
              </div>
              <div>
                <a href="mailto:dealers@tractordost.com" className="text-xs text-muted-foreground hover:text-foreground">
                  dealers@tractordost.com (Dealer Onboarding)
                </a>
              </div>
            </div>
          </div>

          {/* Headquarters */}
          <div className="rounded-3xl border border-border/50 bg-card/60 p-6 shadow-sm transition-all hover:border-[var(--color-brand-green)]/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <MapPin size={24} />
            </div>
            <h3 className="text-foreground text-lg font-black">Corporate Headquarters</h3>
            <p className="text-muted-foreground text-xs leading-relaxed mt-1">
              TractorDost Agritech Private Limited<br />
              Level 4, AgTech Innovation Park, Baner-Pashan Link Road,<br />
              Pune, Maharashtra 411045, India
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Message / Inquiry Form */}
        <div className="rounded-3xl border border-border/50 bg-card/60 p-8 shadow-xl backdrop-blur-xl lg:col-span-7">
          <div className="mb-8 flex items-center gap-3 border-b border-border/40 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-black">Send Us a Message</h2>
              <p className="text-muted-foreground text-xs">We typically respond within 2 to 4 business hours</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-foreground mb-2 text-2xl font-black">Thank You!</h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                Your message has been assigned to our customer relationship team. We will call you on <span className="font-bold text-foreground">+91 {formData.mobile}</span> shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-full border border-border/50 px-6 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/40"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Deshmukh"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. anand@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, inquiryType: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  >
                    <option value="FARMER_SUPPORT">Farmer Support & Buying Advice</option>
                    <option value="LOAN_INQUIRY">Loan & Finance Assistance</option>
                    <option value="DEALER_PARTNERSHIP">Dealer / Franchise Partnership</option>
                    <option value="ADVERTISING">Banner Ads & Brand Promotion</option>
                    <option value="FEEDBACK">Platform Feedback / Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    State / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Your Message or Question *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you need help with..."
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-[var(--color-brand-green)]/50 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-4 text-sm font-black tracking-widest text-white uppercase shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green)]/90 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <TractorLoader size={18} /> Sending Message...
                  </>
                ) : (
                  <>
                    Send Message Now <Send size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
