"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';


export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
    const [query, setQuery] = useState('');

    // Simple debounce implementation inside component if hook doesn't exist
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm"
                placeholder="Поиск аниме..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}
