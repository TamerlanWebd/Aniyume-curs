import api from '@/lib/api';

export const ratingService = {
    rateAnime: async (animeId: number, rating: number) => {
        const response = await api.post('/ratings', { anime_id: animeId, rating });
        return response.data;
    },

    deleteRating: async (animeId: number) => {
        const response = await api.delete(`/ratings/${animeId}`);
        return response.data;
    }
};
