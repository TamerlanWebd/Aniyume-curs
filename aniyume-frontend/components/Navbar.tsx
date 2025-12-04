"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-primary text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-purple-500">
                            AniYume
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                    Каталог
                                </Link>
                                {user && (
                                    <Link href="/profile" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                        Мой список
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full" />
                                        ) : (
                                            <User className="h-8 w-8 p-1 bg-gray-700 rounded-full" />
                                        )}
                                        <span className="text-sm font-medium">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium flex items-center"
                                    >
                                        <LogOut className="h-4 w-4 mr-1" /> Выйти
                                    </button>
                                </div>
                            ) : (
                                <div className="space-x-2">
                                    <Link href="/login" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                        Войти
                                    </Link>
                                    <Link href="/register" className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                                        Регистрация
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium">
                            Каталог
                        </Link>
                        {user && (
                            <Link href="/profile" className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium">
                                Мой список
                            </Link>
                        )}
                        {!user && (
                            <>
                                <Link href="/login" className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium">
                                    Войти
                                </Link>
                                <Link href="/register" className="block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium">
                                    Регистрация
                                </Link>
                            </>
                        )}
                        {user && (
                            <button
                                onClick={logout}
                                className="w-full text-left block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium text-red-500"
                            >
                                Выйти
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
