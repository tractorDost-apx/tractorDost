export interface BrandMeta {
  name: string;
  slug: string;
  country: string;
  isPopular: boolean;
  hpRange: string;
  priceRange: string;
  tagline: string;
}

export const POPULAR_TRACTOR_BRANDS: BrandMeta[] = [
  {
    name: 'Mahindra',
    slug: 'mahindra',
    country: 'India',
    isPopular: true,
    hpRange: '15 HP - 75 HP',
    priceRange: '₹3.05 Lakh - ₹15.20 Lakh',
    tagline: 'Tough Hardum Dumdar',
  },
  {
    name: 'Swaraj',
    slug: 'swaraj',
    country: 'India',
    isPopular: true,
    hpRange: '15 HP - 65 HP',
    priceRange: '₹2.60 Lakh - ₹13.50 Lakh',
    tagline: 'Mera Swaraj',
  },
  {
    name: 'Sonalika',
    slug: 'sonalika',
    country: 'India',
    isPopular: true,
    hpRange: '20 HP - 120 HP',
    priceRange: '₹3.25 Lakh - ₹17.00 Lakh',
    tagline: 'Pride of India',
  },
  {
    name: 'John Deere',
    slug: 'john-deere',
    country: 'USA / India',
    isPopular: true,
    hpRange: '28 HP - 120 HP',
    priceRange: '₹5.50 Lakh - ₹32.00 Lakh',
    tagline: 'Reliability and Power',
  },
  {
    name: 'Massey Ferguson',
    slug: 'massey-ferguson',
    country: 'India (TAFE)',
    isPopular: true,
    hpRange: '24 HP - 75 HP',
    priceRange: '₹4.50 Lakh - ₹15.70 Lakh',
    tagline: 'Leader in Farming Tech',
  },
  {
    name: 'New Holland',
    slug: 'new-holland',
    country: 'Italy / India',
    isPopular: true,
    hpRange: '35 HP - 90 HP',
    priceRange: '₹5.20 Lakh - ₹26.00 Lakh',
    tagline: 'Clean Energy Leader',
  },
  {
    name: 'Eicher',
    slug: 'eicher',
    country: 'India',
    isPopular: true,
    hpRange: '18 HP - 55 HP',
    priceRange: '₹3.20 Lakh - ₹8.80 Lakh',
    tagline: 'Fuel Efficient Champion',
  },
  {
    name: 'Farmtrac',
    slug: 'farmtrac',
    country: 'India (Escorts Kubota)',
    isPopular: true,
    hpRange: '22 HP - 80 HP',
    priceRange: '₹4.80 Lakh - ₹14.50 Lakh',
    tagline: 'Power with Comfort',
  },
  {
    name: 'Kubota',
    slug: 'kubota',
    country: 'Japan / India',
    isPopular: true,
    hpRange: '21 HP - 55 HP',
    priceRange: '₹4.30 Lakh - ₹11.20 Lakh',
    tagline: 'Japanese Engineering Excellence',
  },
  {
    name: 'Powertrac',
    slug: 'powertrac',
    country: 'India (Escorts Kubota)',
    isPopular: true,
    hpRange: '25 HP - 60 HP',
    priceRange: '₹4.30 Lakh - ₹9.50 Lakh',
    tagline: 'Diesel Saver King',
  },
  {
    name: 'Captain',
    slug: 'captain',
    country: 'India',
    isPopular: false,
    hpRange: '15 HP - 28 HP',
    priceRange: '₹2.80 Lakh - ₹5.50 Lakh',
    tagline: 'Mini Tractor Specialist',
  },
  {
    name: 'Solis',
    slug: 'solis',
    country: 'India (ITL)',
    isPopular: false,
    hpRange: '24 HP - 90 HP',
    priceRange: '₹4.80 Lakh - ₹15.20 Lakh',
    tagline: 'Global Technology for India',
  },
];

export const BRAND_NAMES: string[] = POPULAR_TRACTOR_BRANDS.map((b) => b.name);
