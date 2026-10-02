import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/data/AppContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GlobalFilterBar } from '@/components/filters/GlobalFilterBar';

export const metadata: Metadata = {
  title: 'Retail Insight DSS — QuickMart',
  description: 'Enterprise Decision Support System for Convenience Store Network Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex">
        <LanguageProvider>
          <AppProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
              <Header />
              <GlobalFilterBar />
              <main className="flex-1 p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
