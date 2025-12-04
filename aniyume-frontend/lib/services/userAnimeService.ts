import api from '@/lib/api';

export const userAnimeService = {
    getFavorites: async () => {
        const response = await api.get('/user/anime/favorites');
        return response.data;
    },

    addToFavorites: async (animeId: number) => {
        const response = await api.post(`/user/anime/favorites/${animeId}`);
        return response.data;
    },

    removeFromFavorites: async (animeId: number) => {
        const response = await api.delete(`/user/anime/favorites/${animeId}`);
        return response.data;
    },

    getWatchlist: async () => {
        const response = await api.get('/user/anime/watchlist');
        return response.data;
    },

    addToWatchlist: async (animeId: number, status: string, episodes_watched: number = 0) => {
        const response = await api.post(`/user/anime/watchlist/${animeId}`, { status, episodes_watched });
        return response.data;
    },

    updateWatchlist: async (animeId: number, data: { status?: string; episodes_watched?: number }) => {
        const response = await api.put(`/user/anime/watchlist/${animeId}`, data);
        return response.data;
    },

    removeFromWatchlist: async (animeId: number) => {
        const response = await api.delete(`/user/anime/watchlist/${animeId}`);
        return response.data;
    }
};
