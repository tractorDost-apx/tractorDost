export interface ShowroomBrand {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface Showroom {
  id: number;
  dealerId: number;
  brandId?: number;
  showroomName: string;
  slug: string;

  address: string;
  state: string;
  district: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;

  phone?: string;
  email?: string;
  workingHours?: any;
  totalArea?: string;

  parkingAvailable: boolean;
  testDriveAvailable: boolean;
  description?: string;
  isActive: boolean;

  brand?: ShowroomBrand;

  // Virtual properties for UI
  rating: number;
  reviewsCount: number;
}

// ----------------------------------------------------------------------
// MOCK DATA GENERATOR (Strictly matching Prisma Schema)
// ----------------------------------------------------------------------

const MOCK_SHOWROOMS: Showroom[] = [
  {
    id: 1,
    dealerId: 1,
    brandId: 1,
    showroomName: 'Kisan Mahindra Showroom',
    slug: 'kisan-mahindra-showroom-pune',
    address: '123 Mumbai Highway, Wakad',
    state: 'Maharashtra',
    district: 'Pune',
    pincode: '411057',
    phone: '+91 9876543210',
    email: 'sales@kisantractors.com',
    parkingAvailable: true,
    testDriveAvailable: true,
    totalArea: '5000 sq ft',
    description:
      'Experience the full range of Mahindra tractors in our state-of-the-art showroom. We offer dedicated test drive tracks and expert consultation.',
    isActive: true,
    brand: { id: 1, name: 'Mahindra' },
    rating: 4.8,
    reviewsCount: 124,
  },
  {
    id: 2,
    dealerId: 2,
    brandId: 2,
    showroomName: 'AgriTech Swaraj Center',
    slug: 'agritech-swaraj-center-nashik',
    address: 'Opp. APMC Market, Panchavati',
    state: 'Maharashtra',
    district: 'Nashik',
    phone: '+91 8765432109',
    parkingAvailable: false,
    testDriveAvailable: true,
    isActive: true,
    brand: { id: 2, name: 'Swaraj' },
    rating: 4.2,
    reviewsCount: 45,
  },
  {
    id: 3,
    dealerId: 3,
    brandId: 4,
    showroomName: 'Green Earth John Deere Experience',
    slug: 'green-earth-john-deere-bhopal',
    address: 'Kolar Road, Phase 2',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    phone: '+91 7654321098',
    parkingAvailable: true,
    testDriveAvailable: true,
    totalArea: '8000 sq ft',
    description:
      'The largest John Deere experience center in central India. Fully AC showroom with a dedicated lounge for farmers.',
    isActive: true,
    brand: { id: 4, name: 'John Deere' },
    rating: 4.9,
    reviewsCount: 210,
  },
  {
    id: 4,
    dealerId: 5,
    brandId: 5,
    showroomName: 'Shree Ganesh Escorts Showroom',
    slug: 'shree-ganesh-escorts-solapur',
    address: 'Akkalkot Road, MIDC',
    state: 'Maharashtra',
    district: 'Solapur',
    phone: '+91 8877665544',
    parkingAvailable: true,
    testDriveAvailable: false,
    isActive: true,
    brand: { id: 5, name: 'Escorts' },
    rating: 4.6,
    reviewsCount: 89,
  },
  {
    id: 5,
    dealerId: 6,
    brandId: 3,
    showroomName: 'Punjab Sonalika Hub',
    slug: 'punjab-sonalika-hub-ludhiana',
    address: 'GT Road, Sahnewal',
    state: 'Punjab',
    district: 'Ludhiana',
    phone: '+91 9988776655',
    parkingAvailable: true,
    testDriveAvailable: true,
    isActive: true,
    brand: { id: 3, name: 'Sonalika' },
    rating: 4.5,
    reviewsCount: 156,
  },
];

export const showroomAPI = {
  getAllShowrooms: async (params?: { state?: string; brandId?: number; search?: string }) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    let filtered = [...MOCK_SHOWROOMS];

    if (params?.state) {
      filtered = filtered.filter((s) => s.state === params.state);
    }

    if (params?.brandId) {
      filtered = filtered.filter((s) => s.brandId === params.brandId);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.showroomName.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          (s.brand && s.brand.name.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      data: filtered,
      total: filtered.length,
    };
  },

  getShowroomBySlug: async (slug: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const showroom = MOCK_SHOWROOMS.find((s) => s.slug === slug);

    if (!showroom) {
      return { success: false, error: 'Showroom not found' };
    }

    return { success: true, data: showroom };
  },
};
