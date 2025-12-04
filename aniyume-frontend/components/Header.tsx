'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaSignInAlt, FaUserPlus, FaFire, FaSearch,FaBookmark } from 'react-icons/fa';
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { IoCalendarNumberSharp } from "react-icons/io5";


export default function Header() {
  return (
    <header className="bg-[#2EC4B6] text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-15">
        <Link href="/">
          <Image
            src="/images/logo1.png"
            alt="Aniyume Logo"
            width={1000}
            height={1000}
            className="h-15 w-auto"
          />
        </Link>

     <div className="grow flex justify-center px-4">
       <div className="relative w-full max-w-xs">
           <input
              type="text"
              placeholder="Искать аниме..."
              className="w-full py-2 pl-10 pr-4 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>

        <nav className="flex items-center space-x-6">
          <ul className="flex space-x-6 items-center">  
            <li>
              <Link href="/anime" className="flex items-center space-x-2 hover:text-gray-200 transition-colors">
                <FaFire className="text-xl" />
                <span className="hidden md:inline">Популярное</span>
              </Link>
            </li> 
              <li>
              <Link href="/favorites" className="flex items-center space-x-2 hover:text-gray-200 transition-colors ">
                <IoCalendarNumberSharp className="text-xl" />
                <span className="hidden md:inline">Расписание</span>
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="flex items-center space-x-2 hover:text-gray-200 transition-colors">
                <HiAdjustmentsHorizontal className="text-xl" />
                <span className="hidden md:inline">Фильтр</span>
              </Link>
            </li>
            <li>
              <button className="flex items-center space-x-2 hover:text-gray-200 transition-colors ">
                <FaBookmark className="text-xl" />
                <span className="hidden md:inline">Закладки</span>
              </button>
            </li>
         </ul>

          <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-white/30">
            <Link href="/login" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:text-gray-200 transition-colors duration-200 border-y border-white/40">
              <FaSignInAlt className="text-xl" />
              <span className="hidden md:inline">Вход</span>
            </Link>
            <Link href="/register" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:text-gray-200 transition-colors duration-200 border-y border-white/40">
              <FaUserPlus className="text-xl" />
              <span className="hidden md:inline">Регистрация</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
