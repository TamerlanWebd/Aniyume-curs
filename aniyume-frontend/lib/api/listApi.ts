import http from './http';

export function fetchUserList(params?: { status?: string }) {
    return http.get('/user/list', { params });
}

export function addToUserList(anilistId: number, payload: {
    status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold';
    progress?: number;
    rating?: number;
    notes?: string;
}) {
    return http.post(`/user/list/${anilistId}`, payload);
}

export function updateListItem(itemId: string, payload: {
    status?: 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold';
    progress?: number;
    rating?: number;
    notes?: string;
}) {
    return http.patch(`/user/list/${itemId}`, payload);
}

export function removeFromUserList(itemId: string) {
    return http.delete(`/user/list/${itemId}`);
}
