export const siteConfig = {
  name: 'TractorDost',
  shortName: 'TractorDost',
  description:
    "India's Leading Digital Tractor & Agricultural Machinery Marketplace. Discover on-road prices, compare tractor specifications, calculate crop loans, find verified second-hand tractors, and connect with authorized farm equipment dealers.",
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/TD%20White.png',
  helpline: {
    tollFree: '1800-208-8282',
    phoneDisplay: '1800-208-8282',
    workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
  },
  contact: {
    email: 'support@tractordost.com',
    businessEmail: 'dealers@tractordost.com',
    headquarters: 'Pune, Maharashtra, India',
  },
  social: {
    facebook: 'https://facebook.com/tractordost',
    instagram: 'https://instagram.com/tractordost',
    youtube: 'https://youtube.com/@tractordost',
    twitter: 'https://twitter.com/tractordost',
    whatsapp: 'https://wa.me/919876543210',
    linkedin: 'https://linkedin.com/company/tractordost',
  },
  links: {
    newTractors: '/tractors',
    usedTractors: '/used-tractors',
    sellTractor: '/sell-used-tractor',
    valuation: '/used-tractor-valuation',
    loans: '/loan',
    emiCalculator: '/emi-calculator',
    compare: '/compare',
    dealers: '/dealers',
    serviceCenters: '/service-centers',
    harvesters: '/harvesters',
    tyres: '/tyres',
    videos: '/videos',
    webStories: '/web-stories',
    blogs: '/blogs',
    news: '/news',
    about: '/about',
    contact: '/contact',
    faqs: '/faq',
  },
};

export type SiteConfig = typeof siteConfig;
