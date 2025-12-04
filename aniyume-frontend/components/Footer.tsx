'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaInstagram,
  FaYoutube,
  FaDiscord,
  FaFire,
  FaBookmark,
  FaInfoCircle,
  FaShieldAlt,
  FaBalanceScale,
  FaQuestionCircle
} from 'react-icons/fa';
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { IoCalendarNumberSharp } from "react-icons/io5";


export default function Footer() {
  return (
    <footer className="bg-[#2EC4B6] text-white py-10 mt-10 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        <div>
          <Link href="/">
            <Image
              src="/images/oblako.png"
              alt="Aniyume Logo"
              width={500}
              height={400}
              className="h-auto w-auto mb-4 drop-shadow-lg"
            />
          </Link>
          <p className="text-xl mb-4 leading-relaxed font-bold">
            Ваш лучший источник для просмотра аниме онлайн. Откройте для себя что-то новое!
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-white/50 pb-2">Навигация</h3>
          <ul className="space-y-3">
            <li><Link href="/" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><FaFire/>Популярное</Link></li>
            <li><Link href="/" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><IoCalendarNumberSharp />Расписание</Link></li>
            <li><Link href="/" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><HiAdjustmentsHorizontal />Фильтр</Link></li>
             <li><Link href="/" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><FaBookmark />Закладки</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-white/50 pb-2">Полезное</h3>
          <ul className="space-y-3">
            <li><Link href="/about" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><FaInfoCircle /> О нас</Link></li>
            <li><Link href="/privacy" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><FaShieldAlt /> Политика конфиденциальности</Link></li>
            <li><Link href="/terms" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><FaBalanceScale /> Условия использования</Link></li>
            <li><Link href="/faq" className="flex items-center gap-3 hover:text-gray-200 transition-colors duration-300 text-lg"><FaQuestionCircle /> FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-white/50 pb-2">Присоединяйтесь к нам</h3>
          <div className="flex space-x-6 mb-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors duration-300"><FaInstagram className="text-3xl" /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors duration-300"><FaYoutube className="text-3xl" /></a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors duration-300"><FaDiscord className="text-3xl" /></a>
          </div>
          <p className="text-lg">
            Email: <a href="mailto:support@aniyume.com" className="hover:underline hover:text-gray-200 transition-colors duration-300">support@aniyume.com</a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/40 mt-10 pt-8 text-center text-sm relative z-10">
        &copy; {new Date().getFullYear()} Aniyume. Все права защищены.
      </div>

   
    </footer>
  );
}
