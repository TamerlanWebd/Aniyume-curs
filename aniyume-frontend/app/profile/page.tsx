"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimeGrid from '@/components/AnimeGrid';
import { userAnimeService } from '@/lib/services/userAnimeService';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (activeTab === 'favorites') {
          data = await userAnimeService.getFavorites();
        } else {
          // For watchlist, we might need to filter by status on client or API
          // Assuming getWatchlist returns all, we filter here or API supports params
          const watchlist = await userAnimeService.getWatchlist();
          // data = watchlist.filter(item => item.pivot.status === activeTab); // If we had status tabs
          data = watchlist; // Just showing all watchlist for now or we can implement tabs
        }
        setAnimeList(data.data || data); // Handle pagination structure
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [activeTab, user]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            {user?.avatar_url && (
              <img src={user.avatar_url} alt={user.name} className="w-20 h-20 rounded-full border-4 border-purple-600" />
            )}
            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex space-x-4 border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'favorites' ? 'border-b-2 border-purple-500 text-purple-500' : 'text-gray-400 hover:text-white'
                }`}
            >
              Избранное
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'watchlist' ? 'border-b-2 border-purple-500 text-purple-500' : 'text-gray-400 hover:text-white'
                }`}
            >
              Список просмотра
            </button>
          </div>

          <AnimeGrid animeList={animeList} loading={loading} />
        </div>
      </main>
    </ProtectedRoute>
  );
}