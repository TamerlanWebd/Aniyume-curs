'use client';

import { usePathname } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';



export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noLayoutPages = ['/login', '/register'];
  const hideLayout = noLayoutPages.includes(pathname);

  const hideCarousel = pathname.startsWith('/anime/');

  return (
    <>
      {!hideLayout && <Header />}

      {!hideLayout && !hideCarousel && (
        <>
        
        </>
      )}

      <main className="container mx-auto p-4 min-h-screen">{children}</main>

      {!hideLayout && <Footer />}
    </>
  );
}
