import jsPDF from 'jspdf';
import autoTableImport from 'jspdf-autotable';
import { Tractor } from '@/lib/api/tractors';

/**
 * Resilient helper to call autoTable across different bundling formats
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

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Strip HTML tags from rich text strings (overview, whyBuy, etc.)
 */
function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, ' • ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Format enum strings (e.g. TWO_WD -> 2WD, WATER_COOLED -> Water Cooled)
 */
function formatEnum(val: string | undefined | null): string {
  if (!val) return '--';
  if (val === 'TWO_WD') return '2WD';
  if (val === 'FOUR_WD') return '4WD';
  return val
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Format price in Indian Lakhs or thousands
 */
function formatPrice(price: number | string | null | undefined): string {
  if (!price) return 'Price on Request';
  const num = Number(price);
  if (isNaN(num) || num <= 0) return 'Price on Request';
  if (num >= 100000) {
    return `Rs. ${(num / 100000).toFixed(2)} Lakh`;
  }
  return `Rs. ${num.toLocaleString('en-IN')}`;
}

/**
 * Fetch image and convert to base64 Data URL safely
 */
async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    let targetUrl = url;
    // Remote URLs run through our Next.js API proxy to guarantee no CORS / tainted canvas issues
    if (url.startsWith('http://') || url.startsWith('https://')) {
      targetUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    const response = await fetch(targetUrl);
    if (!response.ok) {
      // Fallback: try direct fetch if proxy failed
      if (targetUrl !== url) {
        const directResp = await fetch(url, { mode: 'cors' });
        if (directResp.ok) {
          const blob = await directResp.blob();
          return await blobToBase64(blob);
        }
      }
      return null;
    }

    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (err) {
    console.warn('Could not load image for PDF brochure:', url, err);
    return null;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getImageNaturalDimensions(base64: string): Promise<ImageDimensions> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width || 400,
        height: img.naturalHeight || img.height || 300,
      });
    };
    img.onerror = () => resolve({ width: 400, height: 300 });
    img.src = base64;
  });
}

/**
 * Main export: Generate and download the comprehensive TractorDost brochure
 */
export async function generateTractorBrochurePdf(tractor: Tractor): Promise<void> {
  // 1. Initialize Document (A4 portrait: 210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182 mm
  const brandGreen: [number, number, number] = [46, 90, 30]; // #2E5A1E
  const brandGreenLight: [number, number, number] = [236, 245, 233];
  const brandOrange: [number, number, number] = [234, 88, 12]; // #EA580C
  const darkSlate: [number, number, number] = [15, 23, 42]; // #0F172A
  const mutedText: [number, number, number] = [100, 116, 139]; // #64748B
  const subtleBorder: [number, number, number] = [226, 232, 240]; // #E2E8F0
  const cardBg: [number, number, number] = [248, 250, 252]; // #F8FAFC

  // 2. Fetch Assets in Parallel
  const logoPromise = getBase64Image('/TD%20Black.png');
  const mediaList = tractor.media || [];
  const primaryMedia =
    mediaList.find(
      (m: any) =>
        m.isPrimary &&
        m.mediaType !== 'VIDEO' &&
        m.mediaType !== 'PDF' &&
        m.url
    ) ||
    mediaList.find(
      (m: any) =>
        m.mediaType !== 'VIDEO' &&
        m.mediaType !== 'PDF' &&
        m.url
    );
  const tractorImagePromise = primaryMedia?.url
    ? getBase64Image(primaryMedia.url)
    : Promise.resolve(null);

  const [logoBase64, tractorImageBase64] = await Promise.all([
    logoPromise,
    tractorImagePromise,
  ]);

  // 3. Helper to draw consistent professional footers on every page
  const drawPageFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 16;

    // Top border line
    doc.setDrawColor(...subtleBorder);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY, pageWidth - marginX, footerY);

    // Brand and web link
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...brandGreen);
    doc.text('TractorDost', marginX, footerY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkSlate);
    doc.text('|  www.tractorDost.com', marginX + 17, footerY + 4.5);

    doc.setTextColor(...mutedText);
    doc.text(
      '|  support@tractordost.com  |  Toll-Free Helpline: 1800-120-3456',
      marginX + 50,
      footerY + 4.5
    );

    // Page Number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text(
      `Page ${pageNum} of ${totalPages}`,
      pageWidth - marginX,
      footerY + 4.5,
      { align: 'right' }
    );

    // Disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedText);
    doc.text(
      'Disclaimer: Specifications, features, and pricing are based on manufacturer data and subject to change without notice.',
      marginX,
      footerY + 9
    );
  };

  // =========================================================================
  // PAGE 1: COVER & EXECUTIVE OVERVIEW
  // =========================================================================

  // Top color accent bar
  doc.setFillColor(...brandGreen);
  doc.rect(0, 0, pageWidth * 0.7, 3.5, 'F');
  doc.setFillColor(...brandOrange);
  doc.rect(pageWidth * 0.7, 0, pageWidth * 0.3, 3.5, 'F');

  let currentY = 10;

  // Header: Logo & Tagline on Left, Official Brochure Badge on Right
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', marginX, currentY, 38, 12, undefined, 'FAST');
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...brandGreen);
      doc.text('TractorDost', marginX, currentY + 9);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...brandGreen);
    doc.text('TractorDost', marginX, currentY + 9);
  }

  // Right Header Info Box
  const rightBoxX = pageWidth - marginX - 70;
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...subtleBorder);
  doc.roundedRect(rightBoxX, currentY - 1, 70, 13, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...brandOrange);
  doc.text('OFFICIAL PRODUCT BROCHURE', rightBoxX + 35, currentY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedText);
  const nowStr = new Date().toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  });
  doc.text(`Verified Catalog Data • Issued: ${nowStr}`, rightBoxX + 35, currentY + 9, {
    align: 'center',
  });

  currentY += 17;

  // Header Divider
  doc.setDrawColor(...subtleBorder);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 6;

  // Model Badges Row
  let badgeX = marginX;
  const badges: { text: string; bg: [number, number, number]; fg: [number, number, number] }[] = [];

  if (tractor.brand?.name) {
    badges.push({
      text: tractor.brand.name.toUpperCase(),
      bg: brandGreen,
      fg: [255, 255, 255],
    });
  }
  if (tractor.family?.name) {
    badges.push({
      text: tractor.family.name.toUpperCase(),
      bg: [37, 99, 235], // Blue
      fg: [255, 255, 255],
    });
  }
  if (tractor.driveType) {
    badges.push({
      text: formatEnum(tractor.driveType),
      bg: darkSlate,
      fg: [255, 255, 255],
    });
  }
  if (tractor.fuelType) {
    badges.push({
      text: formatEnum(tractor.fuelType),
      bg: [217, 119, 6], // Amber
      fg: [255, 255, 255],
    });
  }
  if (tractor.launchStatus) {
    badges.push({
      text: formatEnum(tractor.launchStatus),
      bg: brandOrange,
      fg: [255, 255, 255],
    });
  }

  badges.forEach((b) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const textWidth = doc.getTextWidth(b.text);
    const padX = 3.5;
    const bWidth = textWidth + padX * 2;
    doc.setFillColor(...b.bg);
    doc.roundedRect(badgeX, currentY, bWidth, 5.5, 1.5, 1.5, 'F');
    doc.setTextColor(...b.fg);
    doc.text(b.text, badgeX + padX, currentY + 3.8);
    badgeX += bWidth + 2.5;
  });

  currentY += 9;

  // Tractor Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(...darkSlate);
  const titleText = `${tractor.brand?.name || ''} ${tractor.modelName}`.trim();
  doc.text(titleText, marginX, currentY + 5);

  currentY += 10;

  // Hero Section: Left Image Frame, Right Key Specs & Pricing
  const heroCardY = currentY;
  const imageFrameWidth = 92;
  const imageFrameHeight = 68;

  // Image Frame Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...subtleBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, heroCardY, imageFrameWidth, imageFrameHeight, 3, 3, 'FD');

  if (tractorImageBase64) {
    try {
      const dims = await getImageNaturalDimensions(tractorImageBase64);
      const padding = 6;
      const maxImgW = imageFrameWidth - padding * 2;
      const maxImgH = imageFrameHeight - padding * 2;
      const scale = Math.min(maxImgW / dims.width, maxImgH / dims.height);
      const renderW = dims.width * scale;
      const renderH = dims.height * scale;
      const renderX = marginX + (imageFrameWidth - renderW) / 2;
      const renderY = heroCardY + (imageFrameHeight - renderH) / 2;

      const format = tractorImageBase64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(
        tractorImageBase64,
        format,
        renderX,
        renderY,
        renderW,
        renderH,
        undefined,
        'FAST'
      );
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...mutedText);
      doc.text('Photo Available Online', marginX + imageFrameWidth / 2, heroCardY + 34, {
        align: 'center',
      });
    }
  } else {
    // Stylized placeholder graphic
    doc.setFillColor(...cardBg);
    doc.roundedRect(marginX + 4, heroCardY + 4, imageFrameWidth - 8, imageFrameHeight - 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...mutedText);
    doc.text(titleText, marginX + imageFrameWidth / 2, heroCardY + 32, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Verified Specifications', marginX + imageFrameWidth / 2, heroCardY + 38, {
      align: 'center',
    });
  }

  // Right Side: Pricing Banner & Key Specs Grid
  const rightColX = marginX + imageFrameWidth + 5;
  const rightColW = contentWidth - imageFrameWidth - 5; // 85 mm

  // Price Card
  doc.setFillColor(...brandGreenLight);
  doc.setDrawColor(...brandGreen);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightColX, heroCardY, rightColW, 23, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandGreen);
  doc.text('ESTIMATED EX-SHOWROOM PRICE', rightColX + 4, heroCardY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...brandGreen);
  let priceStr = formatPrice(tractor.exShowroomPriceMin);
  if (
    tractor.exShowroomPriceMax &&
    Number(tractor.exShowroomPriceMax) > Number(tractor.exShowroomPriceMin)
  ) {
    priceStr += ` - ${formatPrice(tractor.exShowroomPriceMax)}`;
  }
  doc.text(priceStr, rightColX + 4, heroCardY + 12.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...darkSlate);
  const finText = tractor.financeAvailable
    ? '✓ 100% Finance & Low Interest EMI Available'
    : '✓ Verified Dealer Network & Transparent Pricing';
  doc.text(finText, rightColX + 4, heroCardY + 18.5);

  // Quick Key Specs Matrix (4 compact cards below price)
  const matrixY = heroCardY + 26;
  const cardW = (rightColW - 3) / 2;
  const cardH = 19;

  const keySpecs = [
    {
      label: 'ENGINE POWER',
      value: tractor.hp ? `${tractor.hp} HP` : '--',
      sub: tractor.spec?.engineCc ? `${tractor.spec.engineCc} CC` : 'Displacement',
    },
    {
      label: 'CYLINDERS',
      value: tractor.spec?.cylinders ? `${tractor.spec.cylinders} Cylinders` : '--',
      sub: tractor.spec?.ratedRpm ? `${tractor.spec.ratedRpm} RPM` : 'Engine RPM',
    },
    {
      label: 'LIFTING CAPACITY',
      value: tractor.spec?.liftingCapacityKg ? `${tractor.spec.liftingCapacityKg} Kg` : '--',
      sub: formatEnum(tractor.spec?.hydraulicsType) || 'Hydraulics',
    },
    {
      label: 'TRANSMISSION',
      value:
        tractor.spec?.forwardGears || tractor.spec?.reverseGears
          ? `${tractor.spec?.forwardGears || 0}F + ${tractor.spec?.reverseGears || 0}R`
          : formatEnum(tractor.driveType),
      sub: formatEnum(tractor.spec?.gearboxType) || 'Gearbox',
    },
  ];

  keySpecs.forEach((spec, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = rightColX + col * (cardW + 3);
    const cy = matrixY + row * (cardH + 3);

    doc.setFillColor(...cardBg);
    doc.setDrawColor(...subtleBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedText);
    doc.text(spec.label, cx + 3, cy + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkSlate);
    doc.text(spec.value, cx + 3, cy + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedText);
    doc.text(spec.sub, cx + 3, cy + 16);
  });

  currentY = heroCardY + imageFrameHeight + 7;

  // Overview Section
  const overviewClean = stripHtml(tractor.overview);
  if (overviewClean) {
    doc.setFillColor(...brandGreen);
    doc.rect(marginX, currentY, 2.5, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...darkSlate);
    doc.text('Vehicle Overview', marginX + 5, currentY + 4.8);

    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkSlate);

    // Limit overview text to fit nicely on page 1
    const splitOverview = doc.splitTextToSize(overviewClean, contentWidth);
    const maxLines = 8;
    const displayLines = splitOverview.slice(0, maxLines);
    if (splitOverview.length > maxLines) {
      displayLines[maxLines - 1] = displayLines[maxLines - 1] + '...';
    }
    doc.text(displayLines, marginX, currentY);
    currentY += displayLines.length * 4.2 + 4;
  }

  // Why Buy This Tractor Highlight Box (or Pros & Cons)
  const whyBuyClean = stripHtml(tractor.whyBuy);
  const prosList: string[] = Array.isArray(tractor.pros) ? tractor.pros : [];
  const consList: string[] = Array.isArray(tractor.cons) ? tractor.cons : [];

  if (whyBuyClean || prosList.length > 0) {
    const boxH = Math.min(36, pageHeight - currentY - 24);
    if (boxH > 18) {
      doc.setFillColor(...cardBg);
      doc.setDrawColor(...brandOrange);
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, currentY, contentWidth, boxH, 2.5, 2.5, 'FD');

      // Orange header ribbon
      doc.setFillColor(...brandOrange);
      doc.roundedRect(marginX, currentY, 4, boxH, 1, 1, 'F');

      let innerY = currentY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...brandOrange);
      doc.text('KEY HIGHLIGHTS & ADVANTAGES', marginX + 7, innerY);

      innerY += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...darkSlate);

      if (whyBuyClean) {
        const splitWhy = doc.splitTextToSize(whyBuyClean, contentWidth - 12);
        const linesToShow = splitWhy.slice(0, Math.floor((boxH - 12) / 3.8));
        doc.text(linesToShow, marginX + 7, innerY);
      } else if (prosList.length > 0) {
        prosList.slice(0, 3).forEach((p) => {
          doc.text(`✓  ${p}`, marginX + 7, innerY);
          innerY += 4.5;
        });
      }
    }
  }

  // Draw Page 1 Footer placeholder (will finalize with total pages at the end)

  // =========================================================================
  // PAGE 2+: DETAILED SPECIFICATIONS & COMPARISONS
  // =========================================================================

  doc.addPage();
  currentY = 12;

  // Running Header for Page 2+
  const drawRunningHeader = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...brandGreen);
    doc.text('TractorDost Verified Specifications', marginX, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.text(`|  ${titleText}  |  ${title}`, marginX + 54, currentY);

    doc.setDrawColor(...subtleBorder);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY + 3, pageWidth - marginX, currentY + 3);
    currentY += 8;
  };

  drawRunningHeader('Full Technical Specifications');

  // Build Comprehensive Spec Data Rows Grouped by Category
  interface SpecGroup {
    category: string;
    items: [string, string][];
  }

  const specGroups: SpecGroup[] = [
    {
      category: '1. Engine & Performance',
      items: [
        ['Fuel Type', formatEnum(tractor.fuelType)],
        ['Engine Power', tractor.hp ? `${tractor.hp} HP` : '--'],
        ['Displacement (CC)', tractor.spec?.engineCc ? `${tractor.spec.engineCc} CC` : '--'],
        ['Number of Cylinders', tractor.spec?.cylinders ? String(tractor.spec.cylinders) : '--'],
        ['Rated Engine RPM', tractor.spec?.ratedRpm ? `${tractor.spec.ratedRpm} RPM` : '--'],
        ['Max Torque (Nm)', tractor.spec?.maxTorqueNm ? `${tractor.spec.maxTorqueNm} Nm` : '--'],
        ['Cooling System', formatEnum(tractor.spec?.coolingType)],
        ['Aspiration', tractor.spec?.aspiration || '--'],
        ['Air Cleaner / Filter', tractor.spec?.airFilterType || '--'],
        ['Fuel Injection', tractor.spec?.fuelInjectionType ? tractor.spec.fuelInjectionType.replace(/_/g, ' ') : '--'],
        ['Governor Type', tractor.spec?.governorType || '--'],
        ['Engine Oil Capacity', tractor.spec?.engineOilCapacityL ? `${tractor.spec.engineOilCapacityL} Litres` : '--'],
        ['Emission Norm', formatEnum(tractor.emissionNorm)],
      ],
    },
    {
      category: '2. Transmission & Drive Line',
      items: [
        ['Drive Type', formatEnum(tractor.driveType)],
        ['Gearbox Type', formatEnum(tractor.spec?.gearboxType)],
        ['Clutch Type', formatEnum(tractor.spec?.clutchType)],
        [
          'Number of Gears',
          tractor.spec?.forwardGears || tractor.spec?.reverseGears
            ? `${tractor.spec?.forwardGears || 0} Forward + ${tractor.spec?.reverseGears || 0} Reverse`
            : '--',
        ],
        ['Max Forward Speed', tractor.spec?.maxSpeedFwdKmph ? `${tractor.spec.maxSpeedFwdKmph} km/h` : '--'],
        ['Max Reverse Speed', tractor.spec?.maxSpeedRevKmph ? `${tractor.spec.maxSpeedRevKmph} km/h` : '--'],
        ['Creeper Gear Option', tractor.spec?.hasCreeper ? 'Yes' : 'No'],
        ['Shuttle Shift', tractor.spec?.hasShuttle ? 'Yes' : 'No'],
        ['Differential Lock', tractor.spec?.differentialLock ? 'Yes' : 'No'],
      ],
    },
    {
      category: '3. Power Take-Off (PTO)',
      items: [
        ['PTO Type', formatEnum(tractor.spec?.ptoType)],
        ['PTO Power (HP)', tractor.spec?.ptoHp ? `${tractor.spec.ptoHp} HP` : '--'],
        ['Standard PTO RPM', tractor.spec?.ptoRpm ? `${tractor.spec.ptoRpm} RPM` : '--'],
        ['Multi-Speed / Dual Options', tractor.spec?.ptoRpmOptions || '--'],
        ['PTO Shaft Type', tractor.spec?.ptoShaftType ? tractor.spec.ptoShaftType.replace(/_/g, ' ') : '--'],
      ],
    },
    {
      category: '4. Hydraulics & 3-Point Hitch',
      items: [
        ['Hydraulic System', formatEnum(tractor.spec?.hydraulicsType)],
        [
          'Hydraulic Lifting Capacity',
          tractor.spec?.liftingCapacityKg ? `${tractor.spec.liftingCapacityKg} Kg` : '--',
        ],
        ['Pump Flow Rate', tractor.spec?.pumpFlowRateLpm ? `${tractor.spec.pumpFlowRateLpm} LPM` : '--'],
        ['3-Point Linkage Category', tractor.spec?.linkageCategory || '--'],
        ['Auxiliary Hydraulic Spool Valves', tractor.spec?.auxHydraulicPorts ? String(tractor.spec.auxHydraulicPorts) : '--'],
      ],
    },
    {
      category: '5. Steering & Braking System',
      items: [
        ['Steering Type', formatEnum(tractor.spec?.steeringType)],
        ['Brake Type', formatEnum(tractor.spec?.brakeType)],
        ['Parking Brake', formatEnum(tractor.spec?.parkingBrake)],
        ['Suspended Pedals', tractor.spec?.suspendedPedal || '--'],
        ['Adjustable Operator Seat', tractor.spec?.steeringSeat || '--'],
      ],
    },
    {
      category: '6. Dimensions, Weight & Capacities',
      items: [
        ['Overall Length (mm)', tractor.spec?.overallLengthMm ? `${tractor.spec.overallLengthMm} mm` : '--'],
        ['Overall Width (mm)', tractor.spec?.overallWidthMm ? `${tractor.spec.overallWidthMm} mm` : '--'],
        ['Overall Height (mm)', tractor.spec?.overallHeightMm ? `${tractor.spec.overallHeightMm} mm` : '--'],
        ['Wheelbase (mm)', tractor.spec?.wheelbaseMm ? `${tractor.spec.wheelbaseMm} mm` : '--'],
        ['Ground Clearance (mm)', tractor.spec?.groundClearanceMm ? `${tractor.spec.groundClearanceMm} mm` : '--'],
        ['Turning Radius with Brakes (m)', tractor.spec?.turningRadiusM ? `${tractor.spec.turningRadiusM} m` : '--'],
        ['Total Tractor Weight (Kg)', tractor.spec?.totalWeightKg ? `${tractor.spec.totalWeightKg} Kg` : '--'],
        ['Fuel Tank Capacity', tractor.spec?.fuelTankCapacityL ? `${tractor.spec.fuelTankCapacityL} Litres` : '--'],
      ],
    },
    {
      category: '7. Tyres & Electricals',
      items: [
        ['Front Tyre Size', tractor.spec?.frontTyreSize || '--'],
        ['Rear Tyre Size', tractor.spec?.rearTyreSize || '--'],
        ['Tyre Type / Pattern', tractor.spec?.tyreType || '--'],
        ['Battery Rating', tractor.spec?.batteryVoltage ? `${tractor.spec.batteryVoltage}V ${tractor.spec?.batteryAh || ''}Ah` : '--'],
        ['Alternator Rating', tractor.spec?.alternatorAmps ? `${tractor.spec.alternatorAmps} Amps` : '--'],
      ],
    },
    {
      category: '8. Warranty & Service Guidelines',
      items: [
        ['Manufacturer Warranty (Years)', tractor.spec?.warrantyYears ? `${tractor.spec.warrantyYears} Years` : '--'],
        ['Warranty Working Hours', tractor.spec?.warrantyHours ? `${tractor.spec.warrantyHours} Hours` : '--'],
        ['First Free Service', tractor.spec?.firstServiceHours ? `${tractor.spec.firstServiceHours} Hours` : '--'],
        ['Regular Service Interval', tractor.spec?.regularServiceIntervalH ? `Every ${tractor.spec.regularServiceIntervalH} Hours` : '--'],
        ['Engine Oil Change Interval', tractor.spec?.oilChangeIntervalH ? `Every ${tractor.spec.oilChangeIntervalH} Hours` : '--'],
        ['Recommended Engine Oil', tractor.spec?.engineOilSpec || '--'],
        ['Estimated Annual Service Cost', tractor.spec?.annualServiceCostEstimate ? `Rs. ${Number(tractor.spec.annualServiceCostEstimate).toLocaleString('en-IN')}` : '--'],
      ],
    },
  ];

  // If Electric tractor, add electric spec group
  if (
    tractor.fuelType === 'ELECTRIC' ||
    tractor.spec?.batteryCapacityKwh ||
    tractor.spec?.motorKw
  ) {
    specGroups.splice(1, 0, {
      category: 'Electric Drive & Battery System',
      items: [
        ['Battery Capacity', tractor.spec?.batteryCapacityKwh ? `${tractor.spec.batteryCapacityKwh} kWh` : '--'],
        ['Electric Motor Power', tractor.spec?.motorKw ? `${tractor.spec.motorKw} kW` : '--'],
        ['Charging Time (0-100%)', tractor.spec?.chargingTimeHours ? `${tractor.spec.chargingTimeHours} Hours` : '--'],
        ['Estimated Range / Operating Hours', tractor.spec?.rangePerChargeKm ? `${tractor.spec.rangePerChargeKm} km / charge` : '--'],
      ],
    });
  }

  // Combine groups into a table body format with section headers
  const tableRows: any[] = [];
  specGroups.forEach((group) => {
    // Check if group has at least one meaningful spec
    const hasData = group.items.some(([, val]) => val !== '--' && val !== '');
    if (!hasData) return;

    // Section Header row
    tableRows.push([
      {
        content: group.category,
        colSpan: 2,
        styles: {
          fillColor: brandGreen,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        },
      },
    ]);

    // Data rows
    group.items.forEach(([label, val]) => {
      if (val === '--' || !val) return;
      tableRows.push([label, val]);
    });
  });

  applyAutoTable(doc, {
    startY: currentY,
    head: [['Technical Specification', 'Official Value / Rating']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: darkSlate,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 7.5,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: 'auto', fontStyle: 'bold', textColor: darkSlate },
    },
    margin: { left: marginX, right: marginX, bottom: 22 },
  });

  // State-wise On-Road Pricing Table if available
  const statePrices = tractor.priceByState || [];
  if (statePrices.length > 0) {
    let priceTableY = (doc as any).lastAutoTable?.finalY + 8 || currentY + 10;
    if (priceTableY > pageHeight - 55) {
      doc.addPage();
      priceTableY = 16;
      drawRunningHeader('State On-Road Price Guide');
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkSlate);
      doc.text('State-Wise Estimated On-Road Pricing', marginX, priceTableY);
      priceTableY += 4;
    }

    const stateRows = statePrices.map((p) => [
      p.state,
      `Rs. ${Number(p.exShowroom).toLocaleString('en-IN')}`,
      p.rtoCharges ? `Rs. ${Number(p.rtoCharges).toLocaleString('en-IN')}` : '--',
      p.insuranceEst ? `Rs. ${Number(p.insuranceEst).toLocaleString('en-IN')}` : '--',
      p.onRoadPrice ? `Rs. ${Number(p.onRoadPrice).toLocaleString('en-IN')}` : '--',
    ]);

    applyAutoTable(doc, {
      startY: priceTableY,
      head: [['State / Region', 'Ex-Showroom', 'RTO & Reg.', 'Insurance Est.', 'Total On-Road']],
      body: stateRows,
      theme: 'striped',
      headStyles: {
        fillColor: brandOrange,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2.5,
      },
      bodyStyles: {
        textColor: darkSlate,
        fontSize: 7.5,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [255, 247, 237], // subtle amber tint
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        4: { fontStyle: 'bold', textColor: brandOrange },
      },
      margin: { left: marginX, right: marginX, bottom: 22 },
    });
  }

  // =========================================================================
  // APPLY FOOTERS TO ALL PAGES
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p, totalPages);
  }

  // 4. Save and trigger download
  const cleanModelName = tractor.modelName
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
  const filename = `${tractor.brand?.name || 'Tractor'}_${cleanModelName}_TractorDost_Brochure.pdf`;
  doc.save(filename);
}
