import http from './http';

export function fetchHealth() {
    return http.get('/health');
}

export function fetchAnimeList(params?: { page?: number; perPage?: number; search?: string }) {
    return http.get('/anime', { params });
}

export function fetchPopularAnime() {
    return http.get('/anime/popular');
}

export function fetchTrendingAnime() {
    return http.get('/anime/trending');
}

export function fetchAnimeById(anilistId: number) {
    return http.get(`/anime/${anilistId}`);
}
