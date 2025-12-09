import api from '@/lib/api';

export const animeService = {
    getAnimeList: async (params: any) => {
        const response = await api.get('/anime', { params });
        return response.data;
    },

    getAnimeById: async (id: string | number) => {
        const response = await api.get(`/anime/${id}`);
        return response.data;
    },

    searchAnime: async (query: string) => {
        const response = await api.get('/anime', { params: { search: query } });
        return response.data;
    },

    getAnimeStreams: async (title: string, preload: number = 1) => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_STREAM_API_URL}/streams?title=${encodeURIComponent(title)}&preload=${preload}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Provide more detailed error message
            throw new Error(errorData.detail || `Stream Service Error: ${response.status}`);
        }

        return response.json();
    },

    getAnimeEpisodeStream: async (title: string, episodeNum: string) => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_STREAM_API_URL}/stream/episode?title=${encodeURIComponent(title)}&episode_num=${episodeNum}`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Episode Fetch Error: ${response.status}`);
        }

        return response.json();
    },

    // Admin functions
    uploadAnimePoster: async (id: string | number, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/anime/${id}/poster`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    uploadAnimeBanner: async (id: string | number, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/anime/${id}/banner`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateAnimePlayer: async (id: string | number, data: any) => {
        const response = await api.post(`/anime/${id}/player`, data);
        return response.data;
    }
};
