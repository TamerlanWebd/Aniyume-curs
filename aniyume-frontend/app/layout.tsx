import './globals.css'
import { Inter } from 'next/font/google'
import LayoutClient from './layoutClient'
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Aniyume - Онлайн-платформа для просмотра аниме',
  description: 'Смотрите аниме онлайн, ищите по жанрам и сохраняйте любимые'
}

import SWRegister from '@/components/SWRegister';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SWRegister />
        <LayoutClient>
          <AuthProvider>
            {children}
            <ScrollToTop />
          </AuthProvider>
        </LayoutClient>
      </body>
    </html>
  )
}
