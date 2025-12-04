"use client";

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AnimeGrid from '@/components/AnimeGrid';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import { animeService } from '@/lib/services/animeService';

export default function Home() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    sort: 'popularity'
  });

  const fetchAnime = useCallback(async (searchQuery = '') => {
    try {
      setLoading(true);
      const params = { ...filters, search: searchQuery };
      const data = await animeService.getAnimeList(params);
      setAnimeList(data.data);
    } catch (error) {
      console.error("Failed to fetch anime", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = useCallback((query: string) => {
    fetchAnime(query);
  }, [fetchAnime]);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Каталог Аниме</h1>
          <SearchBar onSearch={handleSearch} />
        </div>

        <FilterPanel filters={filters} onChange={handleFilterChange} />

        <AnimeGrid animeList={animeList} loading={loading} />
      </div>
    </main>
  );
}