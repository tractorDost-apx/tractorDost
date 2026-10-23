import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTableImport from 'jspdf-autotable';
import { Lead, LeadStats } from '@/lib/api/leads';
import { getLeadSourceInfo } from '@/app/(admin)/admin/leads/lead-helpers';
import { Dealer } from '@/types/models/dealer';
import { UsedTractorListing } from '@/types/models/used-listing';
import { User } from '@/types/models/user';
import { Review } from '@/lib/api/reviews';

/**
 * Resilient AutoTable invocation helper supporting various module formats
 */
const applyAutoTable = (doc: jsPDF, options: any) => {
  if (typeof autoTableImport === 'function') {
    (autoTableImport as any)(doc, options);
  } else if (typeof (autoTableImport as any)?.default === 'function') {
    (autoTableImport as any).default(doc, options);
  } else if (typeof (autoTableImport as any)?.autoTable === 'function') {
    (autoTableImport as any).autoTable(doc, options);
  } else if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(options);
  } else {
    throw new Error('AutoTable plugin not initialized properly');
  }
};

export interface FullReportExportData {
  periodLabel: string;
  leadStats: LeadStats | null;
  leads: Lead[];
  dealers: Dealer[];
  listings: UsedTractorListing[];
  users: User[];
  reviews: Review[];
  kpis: {
    totalLeads: number;
    conversionRate: number;
    todayLeads: number;
    totalDealers: number;
    verifiedDealers: number;
    totalListings: number;
    activeListings: number;
    totalUsers: number;
    verifiedUsers: number;
    avgRating: number;
    totalReviews: number;
  };
}

/**
 * Trigger browser download for a Blob
 */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Export full multi-sheet analytics workbook in Excel (.xlsx)
 */
export const exportReportToExcel = (data: FullReportExportData) => {
  const wb = XLSX.utils.book_new();
  const timestamp = new Date().toISOString().slice(0, 10);

  // 1. Executive Summary Sheet
  const summaryRows = [
    { Metric: 'Report Title', Value: 'TractorDost Admin Analytics & Executive Report' },
    { Metric: 'Generated At', Value: new Date().toLocaleString('en-IN') },
    { Metric: 'Time Horizon / Period', Value: data.periodLabel },
    { Metric: '', Value: '' },
    { Metric: '--- EXECUTIVE KPIS ---', Value: '' },
    { Metric: 'Total CRM Leads', Value: data.kpis.totalLeads },
    { Metric: 'Lead Conversion Rate', Value: `${data.kpis.conversionRate}%` },
    { Metric: "Today's New Leads", Value: data.kpis.todayLeads },
    { Metric: 'Total Dealerships', Value: data.kpis.totalDealers },
    { Metric: 'Verified Dealerships', Value: data.kpis.verifiedDealers },
    { Metric: 'Total Used Tractor Listings', Value: data.kpis.totalListings },
    { Metric: 'Active Used Tractor Listings', Value: data.kpis.activeListings },
    { Metric: 'Total Registered Users', Value: data.kpis.totalUsers },
    { Metric: 'KYC Verified Users', Value: data.kpis.verifiedUsers },
    { Metric: 'Platform Average Rating', Value: `${data.kpis.avgRating} / 5.0` },
    { Metric: 'Total Reviews Moderated', Value: data.kpis.totalReviews },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Executive Summary');

  // 2. Leads Data Sheet
  if (data.leads.length > 0) {
    const leadsRows = data.leads.map((l) => {
      const sourceInfo = getLeadSourceInfo(l);
      return {
        'Lead ID': l.id,
        Name: l.name || 'Anonymous',
        Mobile: l.mobile || '-',
        Email: l.email || '-',
        Type: l.leadType,
        Status: l.status,
        'Intent Score': l.intentScore ?? 0,
        'Interested Brand': l.interestedBrand || l.tractor?.modelName || '-',
        'Interested Model': l.interestedModel || '-',
        State: l.state || '-',
        City: l.city || l.district || '-',
        'Source Platform': sourceInfo.platformName,
        'Source Page': sourceInfo.pageLabel,
        'Source Campaign': sourceInfo.campaignLabel,
        'Created At': new Date(l.createdAt).toLocaleDateString('en-IN'),
      };
    });
    const leadsWs = XLSX.utils.json_to_sheet(leadsRows);
    XLSX.utils.book_append_sheet(wb, leadsWs, 'Leads Pipeline');
  }

  // 3. Dealers Network Sheet
  if (data.dealers.length > 0) {
    const dealersRows = data.dealers.map((d) => ({
      'Dealer ID': d.id,
      'Business Name': d.businessName,
      'Dealer Type': d.dealerType,
      'Verification Status': d.verificationStatus || 'PENDING',
      'Is Certified': d.isCertified ? 'Yes' : 'No',
      Phone: d.phone || '-',
      Email: d.email || '-',
      State: d.state || '-',
      District: d.district || '-',
      Rating: d.rating ?? 0,
      'Reviews Count': d.reviewsCount ?? 0,
      'GST Number': d.gstNumber || '-',
      'Created At': new Date(d.createdAt).toLocaleDateString('en-IN'),
    }));
    const dealersWs = XLSX.utils.json_to_sheet(dealersRows);
    XLSX.utils.book_append_sheet(wb, dealersWs, 'Dealers Network');
  }

  // 4. Used Listings Sheet
  if (data.listings.length > 0) {
    const listingsRows = data.listings.map((item) => ({
      'Listing ID': item.id,
      Brand: item.tractorBrand || '-',
      Model: item.tractorModel || '-',
      'Manufacturing Year': item.yearOfManufacture || '-',
      'Asking Price (INR)': item.askingPrice ?? item.price ?? 0,
      'Hours Run': item.hoursUsed ?? '-',
      Condition: item.conditionGrade || '-',
      Status: item.listingStatus,
      'Is Certified': item.isCertified ? 'Yes' : 'No',
      City: item.villageCity || '-',
      State: item.state || '-',
      'Created At': new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN'),
    }));
    const listingsWs = XLSX.utils.json_to_sheet(listingsRows);
    XLSX.utils.book_append_sheet(wb, listingsWs, 'Used Inventory');
  }

  // 5. Users Sheet
  if (data.users.length > 0) {
    const usersRows = data.users.map((u) => ({
      'User ID': u.id,
      'Full Name': u.fullName || 'User',
      Email: u.email || '-',
      Mobile: String(u.mobile || '-'),
      Role: u.role?.name || 'CUSTOMER',
      'Is Active': u.isActive ? 'Active' : 'Suspended',
      'KYC Status': u.kycStatus || 'PENDING',
      State: u.state || '-',
      City: u.villageCity || u.district || '-',
      'Created At': new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN'),
    }));
    const usersWs = XLSX.utils.json_to_sheet(usersRows);
    XLSX.utils.book_append_sheet(wb, usersWs, 'Users Directory');
  }

  // 6. Reviews Sheet
  if (data.reviews.length > 0) {
    const reviewsRows = data.reviews.map((r) => ({
      'Review ID': r.id,
      'Target Type': r.targetType,
      'Target ID': r.targetId,
      'Overall Rating': r.overallRating,
      Headline: r.headline || '-',
      Body: r.body || '-',
      'Is Approved': r.isApproved ? 'Approved' : 'Pending',
      'Is Verified': r.isVerified ? 'Verified' : 'Unverified',
      'Helpful Count': r.helpfulCount ?? 0,
      'Created At': new Date(r.createdAt).toLocaleDateString('en-IN'),
    }));
    const reviewsWs = XLSX.utils.json_to_sheet(reviewsRows);
    XLSX.utils.book_append_sheet(wb, reviewsWs, 'Customer Reviews');
  }

  // Trigger download
  XLSX.writeFile(wb, `TractorDost_Analytics_${timestamp}.xlsx`);
};

/**
 * Export arbitrary dataset to CSV
 */
export const exportDataToCSV = (rows: Record<string, any>[], filenamePrefix = 'export') => {
  if (!rows || rows.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const timestamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `${filenamePrefix}_${timestamp}.csv`);
};

/**
 * Export Executive PDF Report
 */
export const exportExecutivePDF = (data: FullReportExportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const timestamp = new Date().toLocaleString('en-IN');

  // Brand Header
  doc.setFillColor(24, 24, 27); // Dark zinc-900
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Brand Accent Bar
  doc.setFillColor(132, 204, 22); // Lime-500
  doc.rect(0, 86, pageWidth, 4, 'F');

  // Title & Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TRACTOR DOST', 40, 42);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(163, 163, 163);
  doc.text('Admin Executive Intelligence & Business Performance Report', 40, 62);

  // Metadata right-aligned
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 216);
  doc.text(`Generated: ${timestamp}`, pageWidth - 40, 40, { align: 'right' });
  doc.text(`Period: ${data.periodLabel}`, pageWidth - 40, 56, { align: 'right' });
  doc.text(`Status: Confidential`, pageWidth - 40, 72, { align: 'right' });

  let startY = 115;

  // 1. KPI Cards Summary Table
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('1. Executive KPI Scorecard', 40, startY);

  const kpiData = [
    [
      'Total CRM Leads',
      data.kpis.totalLeads.toLocaleString(),
      'Conversion Rate',
      `${data.kpis.conversionRate}%`,
    ],
    [
      "Today's Leads",
      data.kpis.todayLeads.toLocaleString(),
      'Follow-up Due',
      `${data.leadStats?.followupDueCount ?? 0}`,
    ],
    [
      'Total Dealerships',
      data.kpis.totalDealers.toLocaleString(),
      'Verified Dealerships',
      data.kpis.verifiedDealers.toLocaleString(),
    ],
    [
      'Used Inventory Listings',
      data.kpis.totalListings.toLocaleString(),
      'Active Marketplace Listings',
      data.kpis.activeListings.toLocaleString(),
    ],
    [
      'Registered Platform Users',
      data.kpis.totalUsers.toLocaleString(),
      'KYC Verified Users',
      data.kpis.verifiedUsers.toLocaleString(),
    ],
    [
      'Customer Satisfaction Score',
      `${data.kpis.avgRating} / 5.0`,
      'Total Moderated Reviews',
      data.kpis.totalReviews.toLocaleString(),
    ],
  ];

  applyAutoTable(doc, {
    startY: startY + 10,
    head: [['Metric', 'Value', 'Key Indicator', 'Value']],
    body: kpiData,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    headStyles: {
      fillColor: [39, 39, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Calculate position after first table
  let lastY = (doc as any).lastAutoTable?.finalY ?? startY + 160;

  // 2. Leads Breakdown Table
  if (lastY > pageHeight - 160) {
    doc.addPage();
    lastY = 40;
  } else {
    lastY += 25;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('2. Top Recent Inquiries & Lead Pipeline', 40, lastY);

  const topLeads = data.leads.slice(0, 8).map((l) => [
    `#${l.id}`,
    l.name || 'Anonymous',
    l.mobile || '-',
    l.leadType || '-',
    l.interestedBrand || l.tractor?.modelName || 'General',
    l.status,
    new Date(l.createdAt).toLocaleDateString('en-IN'),
  ]);

  applyAutoTable(doc, {
    startY: lastY + 10,
    head: [['ID', 'Customer', 'Mobile', 'Type', 'Interest', 'Status', 'Date']],
    body: topLeads.length > 0 ? topLeads : [['-', 'No leads recorded', '-', '-', '-', '-', '-']],
    margin: { left: 40, right: 40 },
    theme: 'striped',
    headStyles: {
      fillColor: [77, 124, 15],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
  });

  lastY = (doc as any).lastAutoTable?.finalY ?? lastY + 140;

  // 3. Dealers Network Overview
  if (lastY > pageHeight - 160) {
    doc.addPage();
    lastY = 40;
  } else {
    lastY += 25;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('3. Key Dealership Partners', 40, lastY);

  const topDealers = data.dealers.slice(0, 8).map((d) => [
    `#${d.id}`,
    d.businessName,
    d.dealerType,
    d.state || '-',
    d.district || '-',
    d.verificationStatus || 'PENDING',
    `${d.rating ?? 0} ★`,
  ]);

  applyAutoTable(doc, {
    startY: lastY + 10,
    head: [['ID', 'Dealership Name', 'Category', 'State', 'District', 'Verification', 'Rating']],
    body:
      topDealers.length > 0 ? topDealers : [['-', 'No dealers recorded', '-', '-', '-', '-', '-']],
    margin: { left: 40, right: 40 },
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
  });

  lastY = (doc as any).lastAutoTable?.finalY ?? lastY + 140;

  // 4. Used Marketplace Overview
  if (lastY > pageHeight - 160) {
    doc.addPage();
    lastY = 40;
  } else {
    lastY += 25;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('4. Recent Marketplace Listings', 40, lastY);

  const topListings = data.listings.slice(0, 8).map((item) => [
    `#${item.id}`,
    item.tractorModel || 'Tractor',
    item.tractorBrand || '-',
    item.yearOfManufacture ? String(item.yearOfManufacture) : '-',
    item.askingPrice ? `₹${Number(item.askingPrice).toLocaleString('en-IN')}` : '₹0',
    item.listingStatus,
    item.state || '-',
  ]);

  applyAutoTable(doc, {
    startY: lastY + 10,
    head: [['ID', 'Tractor Model', 'Brand', 'Year', 'Price', 'Status', 'Location']],
    body:
      topListings.length > 0
        ? topListings
        : [['-', 'No listings recorded', '-', '-', '-', '-', '-']],
    margin: { left: 40, right: 40 },
    theme: 'striped',
    headStyles: {
      fillColor: [39, 39, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
  });

  // Footer for each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(228, 228, 231);
    doc.line(40, pageHeight - 30, pageWidth - 40, pageHeight - 30);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 113, 122);
    doc.text('TractorDost Platform Intelligence • Confidential Internal Report', 40, pageHeight - 18);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 18, { align: 'right' });
  }

  // Trigger save
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`TractorDost_Executive_Report_${dateStr}.pdf`);
};
