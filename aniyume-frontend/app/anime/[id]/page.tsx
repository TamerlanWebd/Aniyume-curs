"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AnimeBanner from '@/components/AnimeBanner';
import AnimePoster from '@/components/AnimePoster';
import AnimeInfo from '@/components/AnimeInfo';
import AnimePlayer from '@/components/AnimePlayer';
import EpisodeSelector from '@/components/EpisodeSelector';
import ReviewList from '@/components/ReviewList';
import RatingWidget from '@/components/RatingWidget';
import { animeService } from '@/lib/services/animeService';
import { userAnimeService } from '@/lib/services/userAnimeService';
import { useAuth } from '@/context/AuthContext';
import { Heart, Plus, Check } from 'lucide-react';

export default function AnimeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [inFavorites, setInFavorites] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await animeService.getAnimeById(id as string);
        setAnime(data);

        // If user is logged in, check favorites and watchlist status
        // Ideally these should come from the API in a user-specific field or separate calls
        // For now, let's assume we might need separate calls or the API includes `is_favorite` etc.
        // But our current API setup might not return `is_favorite` directly on the public endpoint unless authenticated.
        // We can fetch user lists to check.
        if (user) {
          // Optimization: Fetch user specific state
          // const favs = await userAnimeService.getFavorites();
          // setInFavorites(favs.some((f: any) => f.id === Number(id)));
        }

      } catch (error) {
        console.error("Failed to fetch anime details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) return alert("Войдите, чтобы добавить в избранное");
    try {
      if (inFavorites) {
        await userAnimeService.removeFromFavorites(Number(id));
        setInFavorites(false);
      } else {
        await userAnimeService.addToFavorites(Number(id));
        setInFavorites(true);
      }
    } catch (error) {
      console.error("Favorite toggle failed", error);
    }
  };

  const addToWatchlist = async (status: string) => {
    if (!user) return alert("Войдите, чтобы добавить в список");
    try {
      await userAnimeService.addToWatchlist(Number(id), status);
      setWatchlistStatus(status);
    } catch (error) {
      console.error("Watchlist update failed", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (!anime) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Anime not found</div>;

  const currentEpisodeData = anime.episodes_data?.find((ep: any) => ep.number === currentEpisode);
  const playerUrl = currentEpisodeData?.url || anime.player_url;

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-10">
      <Navbar />
      <AnimeBanner bannerUrl={anime.banner_url} title={anime.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4 flex flex-col gap-4">
            <AnimePoster posterUrl={anime.poster_url} title={anime.title} />

            <div className="flex flex-col gap-2">
              <button
                onClick={toggleFavorite}
                className={`w-full py-2 rounded font-bold flex items-center justify-center gap-2 transition-colors ${inFavorites ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <Heart className={`w-5 h-5 ${inFavorites ? 'fill-current' : ''}`} />
                {inFavorites ? 'В избранном' : 'В избранное'}
              </button>

              <div className="relative group">
                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold flex items-center justify-center gap-2">
                  {watchlistStatus ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {watchlistStatus ? 'В списке' : 'Добавить в список'}
                </button>
                {/* Dropdown for watchlist status */}
                <div className="absolute top-full left-0 w-full bg-gray-800 rounded shadow-xl hidden group-hover:block z-20">
                  <button onClick={() => addToWatchlist('watching')} className="block w-full text-left px-4 py-2 hover:bg-gray-700">Смотрю</button>
                  <button onClick={() => addToWatchlist('completed')} className="block w-full text-left px-4 py-2 hover:bg-gray-700">Просмотрено</button>
                  <button onClick={() => addToWatchlist('planned')} className="block w-full text-left px-4 py-2 hover:bg-gray-700">В планах</button>
                  <button onClick={() => addToWatchlist('dropped')} className="block w-full text-left px-4 py-2 hover:bg-gray-700">Брошено</button>
                </div>
              </div>
            </div>

            {user && (
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <p className="mb-2 text-sm text-gray-400">Ваша оценка</p>
                <RatingWidget animeId={anime.id} initialRating={0} />
              </div>
            )}
          </div>

          <div className="w-full md:w-3/4 flex flex-col gap-6">
            <AnimeInfo anime={anime} />

            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Смотреть онлайн</h2>
              <AnimePlayer videoSource={anime.video_source} playerUrl={playerUrl} />
              <EpisodeSelector
                episodesData={anime.episodes_data}
                currentEpisode={currentEpisode}
                onSelect={setCurrentEpisode}
              />
            </div>

            <ReviewList reviews={anime.reviews} />
          </div>
        </div>
      </div>
    </main>
  );
}
