import api from '@/lib/api';

export const reviewService = {
    createReview: async (animeId: number, content: string, isSpoiler: boolean = false) => {
        const response = await api.post('/reviews', { anime_id: animeId, content, is_spoiler: isSpoiler });
        return response.data;
    },

    updateReview: async (id: number, content: string, isSpoiler: boolean = false) => {
        const response = await api.put(`/reviews/${id}`, { content, is_spoiler: isSpoiler });
        return response.data;
    },

    deleteReview: async (id: number) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    }
};
