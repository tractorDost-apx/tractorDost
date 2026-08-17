import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'TractorDost | Premium Tractor Marketplace',
  description: 'The best place to buy, sell, and discover tractors and implements.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
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
      </head>
      <body className="flex min-h-screen flex-col relative overflow-x-hidden selection:bg-[var(--color-spatial-accent-blue)] selection:text-white">
        <SplashScreen />
        <AuthProvider>
          <LayoutOrchestrator>
            {children}
          </LayoutOrchestrator>
        </AuthProvider>
      </body>
    </html>
  );
}
