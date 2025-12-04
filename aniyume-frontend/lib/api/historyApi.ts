import http from './http';

export function fetchHistory(params?: { limit?: number }) {
    return http.get('/user/history', { params });
}

export function addToHistory(anilistId: number, payload: {
    episode: number;
    duration?: number;
    progress?: number;
}) {
    return http.post(`/user/history/${anilistId}`, payload);
}
