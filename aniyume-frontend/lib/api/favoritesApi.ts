import http from './http';

export function fetchFavorites() {
    return http.get('/user/favorites');
}

export function addFavorite(anilistId: number) {
    return http.post(`/user/favorites/${anilistId}`);
}

export function removeFavorite(anilistId: number) {
    return http.delete(`/user/favorites/${anilistId}`);
}
