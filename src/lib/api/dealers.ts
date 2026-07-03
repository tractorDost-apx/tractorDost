export type DealerType = 'BRAND_DEALER' | 'MULTI_BRAND' | 'USED_TRACTOR_DEALER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface DealerBrand {
  brandId: number;
  isPrimary: boolean;
  brand: {
    id: number;
    name: string;
    logoUrl?: string;
  };
}

export interface Dealer {
  id: number;
  userId?: number;
  businessName: string;
  slug: string;
  dealerType: DealerType;
  
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  
  address: string;
  state: string;
  district: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
  
  verificationStatus: VerificationStatus;
  isCertified: boolean;
  certifiedAt?: string;
  isActive: boolean;
  
  rating: number;
  reviewsCount: number;
  aboutDealer?: string;
  
  brands: DealerBrand[];
  
  // Virtual properties for UI
  hasShowroom?: boolean;
  hasServiceCenter?: boolean;
}

// ----------------------------------------------------------------------
// MOCK DATA GENERATOR (Strictly matching Prisma Schema)
// ----------------------------------------------------------------------

const MOCK_DEALERS: Dealer[] = [
  {
    id: 1,
    businessName: "Kisan Tractors & Motors",
    slug: "kisan-tractors-and-motors-pune",
    dealerType: "BRAND_DEALER",
    phone: "+91 9876543210",
    whatsapp: "+91 9876543210",
    email: "contact@kisantractors.com",
    address: "123 Mumbai Highway, Wakad",
    state: "Maharashtra",
    district: "Pune",
    pincode: "411057",
    verificationStatus: "VERIFIED",
    isCertified: true,
    isActive: true,
    rating: 4.8,
    reviewsCount: 124,
    aboutDealer: "Authorized Mahindra dealer with a 3S facility (Sales, Service, Spares). We have been serving farmers in Pune district for over 15 years with extreme dedication.",
    brands: [
      { brandId: 1, isPrimary: true, brand: { id: 1, name: "Mahindra" } }
    ],
    hasShowroom: true,
    hasServiceCenter: true
  },
  {
    id: 2,
    businessName: "AgriTech Auto Traders",
    slug: "agritech-auto-traders-nashik",
    dealerType: "MULTI_BRAND",
    phone: "+91 8765432109",
    address: "Opp. APMC Market, Panchavati",
    state: "Maharashtra",
    district: "Nashik",
    verificationStatus: "VERIFIED",
    isCertified: false,
    isActive: true,
    rating: 4.2,
    reviewsCount: 45,
    brands: [
      { brandId: 2, isPrimary: true, brand: { id: 2, name: "Swaraj" } },
      { brandId: 3, isPrimary: false, brand: { id: 3, name: "Sonalika" } }
    ],
    hasShowroom: true,
    hasServiceCenter: false
  },
  {
    id: 3,
    businessName: "Green Earth Farm Solutions",
    slug: "green-earth-farm-solutions-bhopal",
    dealerType: "BRAND_DEALER",
    phone: "+91 7654321098",
    whatsapp: "+91 7654321098",
    address: "Kolar Road, Phase 2",
    state: "Madhya Pradesh",
    district: "Bhopal",
    verificationStatus: "VERIFIED",
    isCertified: true,
    isActive: true,
    rating: 4.9,
    reviewsCount: 210,
    brands: [
      { brandId: 4, isPrimary: true, brand: { id: 4, name: "John Deere" } }
    ],
    hasShowroom: true,
    hasServiceCenter: true
  },
  {
    id: 4,
    businessName: "Jai Jawan Tractors",
    slug: "jai-jawan-tractors-ludhiana",
    dealerType: "USED_TRACTOR_DEALER",
    phone: "+91 9988776655",
    address: "GT Road, Sahnewal",
    state: "Punjab",
    district: "Ludhiana",
    verificationStatus: "VERIFIED",
    isCertified: false,
    isActive: true,
    rating: 4.0,
    reviewsCount: 32,
    aboutDealer: "Specialists in certified pre-owned tractors. We offer finance and exchange bonuses.",
    brands: [],
    hasShowroom: true,
    hasServiceCenter: true
  },
  {
    id: 5,
    businessName: "Shree Ganesh Auto",
    slug: "shree-ganesh-auto-solapur",
    dealerType: "BRAND_DEALER",
    phone: "+91 8877665544",
    whatsapp: "+91 8877665544",
    address: "Akkalkot Road, MIDC",
    state: "Maharashtra",
    district: "Solapur",
    verificationStatus: "VERIFIED",
    isCertified: true,
    isActive: true,
    rating: 4.6,
    reviewsCount: 89,
    brands: [
      { brandId: 5, isPrimary: true, brand: { id: 5, name: "Escorts" } }
    ],
    hasShowroom: true,
    hasServiceCenter: true
  }
];

export const dealerAPI = {
  getAllDealers: async (params?: { state?: string; brandId?: number; search?: string }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filtered = [...MOCK_DEALERS];
    
    if (params?.state) {
      filtered = filtered.filter(d => d.state === params.state);
    }
    
    if (params?.brandId) {
      filtered = filtered.filter(d => 
        d.brands.some(b => b.brandId === params.brandId)
      );
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.businessName.toLowerCase().includes(q) || 
        d.district.toLowerCase().includes(q) ||
        d.brands.some(b => b.brand.name.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length
    };
  },
  
  getDealerBySlug: async (slug: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const dealer = MOCK_DEALERS.find(d => d.slug === slug);
    
    if (!dealer) {
      return { success: false, error: 'Dealer not found' };
    }
    
    return { success: true, data: dealer };
  }
};
