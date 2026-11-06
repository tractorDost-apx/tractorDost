import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LayoutOrchestrator } from '@/components/layout/LayoutOrchestrator';
import { AuthProvider } from '@/store/AuthContext';
import { SplashScreen } from '@/components/ui/SplashScreen';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c100e' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tractordost.com'),
  title: {
    default: 'TractorDost | India\'s Leading Tractor & Farm Machinery Marketplace',
    template: '%s | TractorDost',
  },
  description:
    'TractorDost is India\'s premier digital tractor marketplace. Explore new & certified used tractors, on-road prices, EMI calculators, compare 250+ models, and connect with 1,400+ authorized dealers across Maharashtra and India.',
  applicationName: 'TractorDost',
  authors: [
    { name: 'APXTECK', url: 'https://www.apxteck.com/' },
    { name: 'TractorDost Technologies Pvt. Ltd.', url: 'https://tractordost.com' },
  ],
  creator: 'APXTECK (https://www.apxteck.com/)',
  publisher: 'TractorDost Technologies Pvt. Ltd.',
  generator: 'Next.js',
  keywords: [
    'TractorDost',
    'tractors India',
    'buy tractor online',
    'sell tractor',
    'tractor price 2026',
    'on road tractor price',
    'used tractors India',
    'second hand tractor',
    'tractor loan',
    'tractor EMI calculator',
    'compare tractors',
    'Mahindra tractors',
    'Swaraj tractors',
    'Sonalika tractors',
    'John Deere India',
    'Massey Ferguson',
    'New Holland tractors',
    'Eicher tractors',
    'Farmtrac',
    'Powertrac',
    'Kubota tractors',
    'farm implements',
    'harvester price',
    'tractor dealers Maharashtra',
    'tractor dealers India',
    'APXTECK',
  ],
  alternates: {
    canonical: 'https://tractordost.com',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'TractorDost | India\'s Leading Tractor & Farm Machinery Marketplace',
    description:
      'Explore verified tractors, live on-road prices, flexible agriculture loans, and find authorized dealers near you.',
    url: 'https://tractordost.com',
    siteName: 'TractorDost',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/TD%20Black.png',
        width: 1200,
        height: 630,
        alt: 'TractorDost - India\'s Trusted Tractor Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TractorDost | Buy, Sell & Compare Tractors in India',
    description:
      'Compare specifications, calculate agricultural EMIs, check true market resale valuations, and discover verified dealers.',
    images: ['/TD%20Black.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'IN-MH',
    'geo.placename': 'Maharashtra, India',
    'geo.position': '19.7515;75.7139',
    'ICBM': '19.7515, 75.7139',
    'coverage': 'India',
    'distribution': 'Global',
    'rating': 'General',
    'designer': 'APXTECK - https://www.apxteck.com/',
    'developer': 'APXTECK - https://www.apxteck.com/',
    'target-country': 'IN',
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://tractordost.com/#website',
      'url': 'https://tractordost.com',
      'name': 'TractorDost',
      'description': 'India\'s leading tractor and agricultural machinery marketplace.',
      'inLanguage': 'en-IN',
      'publisher': {
        '@id': 'https://tractordost.com/#organization',
      },
      'creator': {
        '@type': 'Organization',
        'name': 'APXTECK',
        'url': 'https://www.apxteck.com/',
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://tractordost.com/tractors?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://tractordost.com/#organization',
      'name': 'TractorDost Technologies Pvt. Ltd.',
      'url': 'https://tractordost.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://tractordost.com/TD%20Black.png',
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-1800-208-8282',
        'contactType': 'customer support',
        'areaServed': 'IN',
        'availableLanguage': ['English', 'Hindi', 'Marathi'],
      },
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Pune',
        'addressRegion': 'Maharashtra',
        'addressCountry': 'IN',
      },
      'founder': {
        '@type': 'Organization',
        'name': 'APXTECK',
        'url': 'https://www.apxteck.com/',
      },
    },
    {
      '@type': ['AutoDealer', 'Marketplace'],
      '@id': 'https://tractordost.com/#marketplace',
      'name': 'TractorDost Marketplace',
      'url': 'https://tractordost.com',
      'image': 'https://tractordost.com/TD%20Black.png',
      'priceRange': '₹₹₹',
      'telephone': '+91-1800-208-8282',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Pune',
        'addressRegion': 'Maharashtra',
        'addressCountry': 'IN',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 19.7515,
        'longitude': 75.7139,
      },
      'areaServed': [
        'Maharashtra',
        'Punjab',
        'Haryana',
        'Uttar Pradesh',
        'Madhya Pradesh',
        'Gujarat',
        'Rajasthan',
        'Karnataka',
        'India',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} min-h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
                
                if (localStorage.getItem('tractorDost_splash_shown')) {
                  document.documentElement.classList.add('hide-splash')
                }
              } catch (_) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData),
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-clip selection:bg-[var(--color-spatial-accent-blue)] selection:text-white"
      >
        <SplashScreen />
        <AuthProvider>
          <LayoutOrchestrator>{children}</LayoutOrchestrator>
        </AuthProvider>
      </body>
    </html>
  );
}
