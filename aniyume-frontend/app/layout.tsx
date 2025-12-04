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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>

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
