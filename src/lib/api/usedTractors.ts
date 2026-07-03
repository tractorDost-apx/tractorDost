// Enums matching Prisma
export enum ConditionGrade {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED'
}

export enum UrgencyLevel {
  FIFTEEN_DAYS = 'FIFTEEN_DAYS',
  THIRTY_DAYS = 'THIRTY_DAYS',
  NO_RUSH = 'NO_RUSH'
}

// Interface strictly mirroring the Prisma UsedTractorListing model
export interface UsedTractorListing {
  id: number;
  sellerId: number;
  tractorId?: number;
  
  tractorBrand: string;
  tractorModel: string;
  yearOfManufacture: number;
  ownership: number;
  hoursUsed: number | null;
  conditionGrade: ConditionGrade;

  askingPrice: number;
  negotiable: boolean;
  estimatedMarketPrice: number | null;
  financeAvailable: boolean;

  listingStatus: ListingStatus;
  urgency: UrgencyLevel;
  isCertified: boolean;
  certifiedAt: string | null;
  
  // Advanced Condition Details from Backend
  tyreCondition?: ConditionGrade;
  engineConditionPct?: number;
  hydraulicsCondition?: ConditionGrade;
  bodyCondition?: ConditionGrade;
  
  // Documents & Status
  rcAvailable: boolean;
  loanClearanceStatus?: string;
  
  state: string;
  district: string;
  villageCity: string | null;
  
  viewsCount: number;
  leadCount: number;

  description: string | null;
  majorRepairs?: string | null;
  
  createdAt: string;
  
  // UI ONLY Mock Data (Usually handled by relations to UsedTractorDocument/Media)
  imageUrl?: string;
}

// Mock Data
const MOCK_USED_TRACTORS: UsedTractorListing[] = [
  {
    id: 1,
    sellerId: 101,
    tractorBrand: "Mahindra",
    tractorModel: "575 DI XP Plus",
    yearOfManufacture: 2021,
    ownership: 1,
    hoursUsed: 1250,
    conditionGrade: ConditionGrade.EXCELLENT,
    tyreCondition: ConditionGrade.GOOD,
    engineConditionPct: 95,
    bodyCondition: ConditionGrade.EXCELLENT,
    askingPrice: 580000,
    negotiable: true,
    estimatedMarketPrice: 610000,
    financeAvailable: true,
    listingStatus: ListingStatus.ACTIVE,
    urgency: UrgencyLevel.FIFTEEN_DAYS,
    isCertified: true,
    certifiedAt: "2024-05-10T10:00:00Z",
    rcAvailable: true,
    loanClearanceStatus: 'CLEAR',
    state: "Maharashtra",
    district: "Pune",
    villageCity: "Baramati",
    viewsCount: 450,
    leadCount: 12,
    description: "Very well maintained single owner tractor. Used only for light farming. Full service history available.",
    createdAt: "2024-05-01T10:00:00Z",
    imageUrl: "https://images.pexels.com/photos/10800366/pexels-photo-10800366.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 2,
    sellerId: 102,
    tractorBrand: "Swaraj",
    tractorModel: "744 FE",
    yearOfManufacture: 2018,
    ownership: 2,
    hoursUsed: 3400,
    conditionGrade: ConditionGrade.GOOD,
    tyreCondition: ConditionGrade.FAIR,
    engineConditionPct: 80,
    askingPrice: 390000,
    negotiable: false,
    estimatedMarketPrice: 400000,
    financeAvailable: false,
    listingStatus: ListingStatus.ACTIVE,
    urgency: UrgencyLevel.NO_RUSH,
    isCertified: false,
    certifiedAt: null,
    rcAvailable: true,
    loanClearanceStatus: 'CLEAR',
    state: "Punjab",
    district: "Ludhiana",
    villageCity: "Jagraon",
    viewsCount: 120,
    leadCount: 3,
    description: "Good working condition. Recently replaced tyres and serviced engine.",
    createdAt: "2024-05-05T10:00:00Z",
    imageUrl: "https://images.pexels.com/photos/11096739/pexels-photo-11096739.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 3,
    sellerId: 103,
    tractorBrand: "John Deere",
    tractorModel: "5310",
    yearOfManufacture: 2023,
    ownership: 1,
    hoursUsed: 400,
    conditionGrade: ConditionGrade.EXCELLENT,
    tyreCondition: ConditionGrade.EXCELLENT,
    engineConditionPct: 99,
    bodyCondition: ConditionGrade.EXCELLENT,
    askingPrice: 850000,
    negotiable: true,
    estimatedMarketPrice: 900000,
    financeAvailable: true,
    listingStatus: ListingStatus.ACTIVE,
    urgency: UrgencyLevel.THIRTY_DAYS,
    isCertified: true,
    certifiedAt: "2024-05-15T10:00:00Z",
    rcAvailable: true,
    loanClearanceStatus: 'CLEAR',
    state: "Madhya Pradesh",
    district: "Bhopal",
    villageCity: "Sehore",
    viewsCount: 890,
    leadCount: 45,
    description: "Almost brand new. Selling because I am upgrading to a higher HP model.",
    createdAt: "2024-05-10T10:00:00Z",
    imageUrl: "https://images.pexels.com/photos/20340785/pexels-photo-20340785.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 4,
    sellerId: 104,
    tractorBrand: "Massey Ferguson",
    tractorModel: "241 DI Maha Shakti",
    yearOfManufacture: 2015,
    ownership: 3,
    hoursUsed: 5600,
    conditionGrade: ConditionGrade.FAIR,
    tyreCondition: ConditionGrade.POOR,
    engineConditionPct: 60,
    askingPrice: 220000,
    negotiable: true,
    estimatedMarketPrice: 200000,
    financeAvailable: false,
    listingStatus: ListingStatus.ACTIVE,
    urgency: UrgencyLevel.FIFTEEN_DAYS,
    isCertified: false,
    certifiedAt: null,
    rcAvailable: false,
    majorRepairs: "Engine requires overhaul.",
    state: "Uttar Pradesh",
    district: "Agra",
    villageCity: "Fatehabad",
    viewsCount: 300,
    leadCount: 15,
    description: "Engine requires some minor work. Ideal for transport use.",
    createdAt: "2024-04-20T10:00:00Z",
    imageUrl: "https://images.pexels.com/photos/10800363/pexels-photo-10800363.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 5,
    sellerId: 105,
    tractorBrand: "Sonalika",
    tractorModel: "DI 750 III",
    yearOfManufacture: 2020,
    ownership: 1,
    hoursUsed: 2100,
    conditionGrade: ConditionGrade.GOOD,
    tyreCondition: ConditionGrade.GOOD,
    engineConditionPct: 88,
    askingPrice: 480000,
    negotiable: true,
    estimatedMarketPrice: 495000,
    financeAvailable: true,
    listingStatus: ListingStatus.ACTIVE,
    urgency: UrgencyLevel.NO_RUSH,
    isCertified: true,
    certifiedAt: "2024-05-12T10:00:00Z",
    rcAvailable: true,
    state: "Haryana",
    district: "Karnal",
    villageCity: "Assandh",
    viewsCount: 512,
    leadCount: 22,
    description: "Company serviced regularly. Used mainly for rotary tiller work.",
    createdAt: "2024-05-11T10:00:00Z",
    imageUrl: "https://images.pexels.com/photos/10800356/pexels-photo-10800356.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

export const usedTractorAPI = {
  getAllListings: async (params?: { 
    brand?: string; 
    state?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    isCertified?: boolean;
    financeAvailable?: boolean;
    rcAvailable?: boolean;
    maxHoursUsed?: number;
    minYear?: number;
    ownership?: number;
    search?: string;
  }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filtered = [...MOCK_USED_TRACTORS];

    if (params) {
      if (params.brand) {
        filtered = filtered.filter(t => t.tractorBrand.toLowerCase() === params.brand!.toLowerCase());
      }
      if (params.state) {
        filtered = filtered.filter(t => t.state === params.state);
      }
      if (params.minPrice !== undefined) {
        filtered = filtered.filter(t => t.askingPrice >= params.minPrice!);
      }
      if (params.maxPrice !== undefined) {
        filtered = filtered.filter(t => t.askingPrice <= params.maxPrice!);
      }
      if (params.isCertified) {
        filtered = filtered.filter(t => t.isCertified === true);
      }
      if (params.financeAvailable) {
        filtered = filtered.filter(t => t.financeAvailable === true);
      }
      if (params.rcAvailable) {
        filtered = filtered.filter(t => t.rcAvailable === true);
      }
      if (params.maxHoursUsed !== undefined) {
        filtered = filtered.filter(t => t.hoursUsed && t.hoursUsed <= params.maxHoursUsed!);
      }
      if (params.minYear !== undefined) {
        filtered = filtered.filter(t => t.yearOfManufacture >= params.minYear!);
      }
      if (params.ownership !== undefined) {
        filtered = filtered.filter(t => t.ownership === params.ownership!);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.tractorModel.toLowerCase().includes(q) || 
          t.tractorBrand.toLowerCase().includes(q) ||
          t.district.toLowerCase().includes(q)
        );
      }
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length
    };
  },
  
  createListing: async (data: Partial<UsedTractorListing>) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newId = Math.max(...MOCK_USED_TRACTORS.map(t => t.id)) + 1;
    const newListing: UsedTractorListing = {
      ...data,
      id: newId,
      sellerId: 999, // Mock logged in user
      listingStatus: ListingStatus.PENDING_APPROVAL,
      viewsCount: 0,
      leadCount: 0,
      createdAt: new Date().toISOString(),
      isCertified: false,
      certifiedAt: null,
      estimatedMarketPrice: data.askingPrice ? data.askingPrice * 0.95 : null,
      imageUrl: "https://images.pexels.com/photos/10800366/pexels-photo-10800366.jpeg?auto=compress&cs=tinysrgb&w=800"
    } as UsedTractorListing;
    
    MOCK_USED_TRACTORS.unshift(newListing);
    
    return {
      success: true,
      data: newListing,
      message: "Tractor listing submitted successfully and is pending approval."
    };
  },

  getListingById: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const tractor = MOCK_USED_TRACTORS.find(t => t.id === id);
    
    if (!tractor) {
      return { success: false, message: "Tractor not found" };
    }

    // Enhance with mock relations like inspections and documents for the detail view
    const enhancedTractor = {
      ...tractor,
      inspection: tractor.isCertified ? {
        engineScore: tractor.engineConditionPct || 85,
        tyreScore: tractor.tyreCondition === ConditionGrade.EXCELLENT ? 90 : 70,
        hydraulicsScore: 88,
        bodyScore: tractor.bodyCondition === ConditionGrade.EXCELLENT ? 95 : 75,
        clutchScore: 82,
        overallScore: 85,
        inspectorNotes: "Mechanically sound. Minor scratches on the right fender. Tyres have 70% life left."
      } : null,
      documents: [
        { docType: 'rc', url: '#', verifiedAt: tractor.rcAvailable ? "2024-05-15T10:00:00Z" : null },
        { docType: 'loan_noc', url: '#', verifiedAt: tractor.loanClearanceStatus === 'CLEAR' ? "2024-05-15T10:00:00Z" : null }
      ],
      media: [
        { url: tractor.imageUrl, isPrimary: true },
        { url: "https://images.pexels.com/photos/10800363/pexels-photo-10800363.jpeg?auto=compress&cs=tinysrgb&w=800", isPrimary: false },
        { url: "https://images.pexels.com/photos/11096739/pexels-photo-11096739.jpeg?auto=compress&cs=tinysrgb&w=800", isPrimary: false }
      ]
    };

    return {
      success: true,
      data: enhancedTractor
    };
  },

  submitEnquiry: async (listingId: number, data: { name: string, mobile: string, offerPrice?: number }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: "Your enquiry has been sent to the seller successfully!"
    };
  },

  // ADMIN METHODS
  updateListingStatus: async (listingId: number, status: ListingStatus, isCertified?: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_USED_TRACTORS.findIndex(t => t.id === listingId);
    if (index !== -1) {
      MOCK_USED_TRACTORS[index].listingStatus = status;
      if (isCertified !== undefined) {
        MOCK_USED_TRACTORS[index].isCertified = isCertified;
      }
      return { success: true, message: "Listing updated successfully." };
    }
    return { success: false, message: "Listing not found." };
  },

  updateInspection: async (listingId: number, inspectionData: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: "Inspection report saved successfully." };
  }
};
