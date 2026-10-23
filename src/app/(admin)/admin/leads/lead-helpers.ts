import { Lead } from '@/lib/api/leads';

export interface LeadProductLink {
  href: string;
  label: string;
  isDirect: boolean;
}

export function getLeadProductLink(lead: {
  tractorId?: number | null;
  tractor?: { id: number; modelName?: string } | null;
  implmentId?: number | null;
  interestedModel?: string | null;
  interestedBrand?: string | null;
}): LeadProductLink | null {
  const tractorId = lead.tractorId || lead.tractor?.id;
  if (tractorId) {
    const label = lead.interestedModel || lead.tractor?.modelName || `Tractor #${tractorId}`;
    return {
      href: `/tractors/${tractorId}`,
      label,
      isDirect: true,
    };
  }

  const implmentId = lead.implmentId;
  if (implmentId) {
    const label = lead.interestedModel || `Implement #${implmentId}`;
    return {
      href: `/implements/${implmentId}`,
      label,
      isDirect: true,
    };
  }

  if (lead.interestedModel && lead.interestedModel.trim()) {
    const model = lead.interestedModel.trim();
    return {
      href: `/tractors?search=${encodeURIComponent(model)}`,
      label: model,
      isDirect: false,
    };
  }

  if (lead.interestedBrand && lead.interestedBrand.trim()) {
    const brand = lead.interestedBrand.trim();
    return {
      href: `/tractors?brand=${encodeURIComponent(brand)}`,
      label: brand,
      isDirect: false,
    };
  }

  return null;
}

export interface LeadLocationInfo {
  hasCoords: boolean;
  coordsString: string | null;
  locationText: string;
  mapsUrl: string | null;
}

export function getLeadLocationInfo(lead: {
  latitude?: string | number | null;
  longitude?: string | number | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
}): LeadLocationInfo {
  const latStr = lead.latitude !== null && lead.latitude !== undefined ? String(lead.latitude).trim() : '';
  const lngStr = lead.longitude !== null && lead.longitude !== undefined ? String(lead.longitude).trim() : '';

  const hasCoords = Boolean(latStr && lngStr && !isNaN(Number(latStr)) && !isNaN(Number(lngStr)));
  const coordsString = hasCoords ? `${latStr}, ${lngStr}` : null;

  const parts = [lead.address, lead.city, lead.district, lead.state]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean);

  // Deduplicate consecutive duplicates (e.g. Pune, Pune, Maharashtra)
  const dedupedParts: string[] = [];
  for (const part of parts) {
    if (!dedupedParts.includes(part)) {
      dedupedParts.push(part);
    }
  }

  const locationText = dedupedParts.join(', ') || 'Location not specified';

  let mapsUrl: string | null = null;
  if (hasCoords) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latStr},${lngStr}`)}`;
  } else if (dedupedParts.length > 0) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
  }

  return {
    hasCoords,
    coordsString,
    locationText,
    mapsUrl,
  };
}

export interface LeadSourceInfo {
  rawPage: string;
  pageLabel: string;
  pageHref: string | null;
  campaignLabel: string;
  originProductLabel: string | null;
  originProductHref: string | null;
}

export function getLeadSourceInfo(lead: {
  sourcePage?: string | null;
  sourceCampaign?: string | null;
  tractorId?: number | null;
  implmentId?: number | null;
  tractor?: { id: number; modelName?: string } | null;
  interestedModel?: string | null;
  interestedBrand?: string | null;
}): LeadSourceInfo {
  const rawPage = (lead.sourcePage || '').trim();
  const rawCampaign = (lead.sourceCampaign || '').trim();

  let pageLabel = 'Direct Website';
  let pageHref: string | null = null;
  let originProductLabel: string | null = null;
  let originProductHref: string | null = null;

  const tractorId = lead.tractorId || lead.tractor?.id;
  const implementId = lead.implmentId;

  if (tractorId) {
    originProductLabel = lead.tractor?.modelName || lead.interestedModel || `Tractor #${tractorId}`;
    originProductHref = `/tractors/${tractorId}`;
  } else if (implementId) {
    originProductLabel = lead.interestedModel || `Implement #${implementId}`;
    originProductHref = `/implements/${implementId}`;
  } else if (lead.interestedModel) {
    originProductLabel = lead.interestedModel;
    originProductHref = `/tractors?search=${encodeURIComponent(lead.interestedModel)}`;
  }

  if (rawPage.includes('tractor-detail') || (tractorId && !rawPage)) {
    pageLabel = 'Tractor Detail Page';
    pageHref = originProductHref || '/tractors';
  } else if (rawPage.includes('implement-detail') || (implementId && !rawPage)) {
    pageLabel = 'Implement Detail Page';
    pageHref = originProductHref || '/implements';
  } else if (rawPage.includes('compare')) {
    pageLabel = 'Compare Tractors Tool';
    pageHref = '/compare';
  } else if (rawPage.includes('emi')) {
    pageLabel = 'EMI Calculator Page';
    pageHref = '/emi-calculator';
  } else if (rawPage.includes('on-road') || rawPage.includes('price')) {
    pageLabel = 'On-Road Price Page';
    pageHref = '/on-road-price';
  } else if (rawPage.includes('used')) {
    pageLabel = 'Used Tractor Marketplace';
    pageHref = '/used-tractors';
  } else if (rawPage.includes('dealer')) {
    pageLabel = 'Dealer Directory Page';
    pageHref = '/dealers';
  } else if (rawPage) {
    pageLabel = rawPage
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (rawPage.startsWith('/')) {
      pageHref = rawPage;
    }
  }

  let campaignLabel = rawCampaign || 'Organic Enquiry';
  if (rawCampaign === 'detail-access') {
    campaignLabel = 'Detail Access Gate (Specs & Features Unlock)';
  } else if (rawCampaign.includes('emi')) {
    campaignLabel = 'EMI Calculation Lead Form';
  } else if (rawCampaign.includes('price')) {
    campaignLabel = 'On-Road Price Request Form';
  } else if (rawCampaign) {
    campaignLabel = rawCampaign
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return {
    rawPage,
    pageLabel,
    pageHref,
    campaignLabel,
    originProductLabel,
    originProductHref,
  };
}

export function parseStaffUsers(
  candidateUsers: any[],
  currentUser?: any
): { id: number; fullName: string }[] {
  const staffMap = new Map<number, { id: number; fullName: string }>();

  const list = [...candidateUsers];
  if (currentUser) {
    list.push(currentUser);
  }

  for (const u of list) {
    if (!u || !u.id) continue;
    if (u.isDeleted || u.isActive === false) continue;

    const roleName = (typeof u.role === 'string' ? u.role : u.role?.name || '').toUpperCase();
    if (['AGENT', 'ADMIN', 'SUPER_ADMIN'].includes(roleName)) {
      const roleBadge = roleName === 'AGENT' ? 'Agent' : 'Admin';
      const rawName = u.fullName?.trim() || u.name?.trim();
      const mobilePart = u.mobile ? String(u.mobile).trim() : null;
      const emailPart = u.email ? String(u.email).trim() : null;

      const baseLabel = rawName || (mobilePart ? `${roleBadge} (${mobilePart})` : null) || emailPart || `${roleBadge} #${u.id}`;
      const fullName = baseLabel.endsWith(`(${roleBadge})`) ? baseLabel : `${baseLabel} (${roleBadge})`;

      staffMap.set(Number(u.id), {
        id: Number(u.id),
        fullName,
      });
    }
  }

  return Array.from(staffMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
}
