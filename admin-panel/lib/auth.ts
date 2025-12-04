import { apiService } from './api';

export const TOKEN_KEY = 'token';

export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
};

export const isAuthenticated = () => !!getToken();

export const login = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
};

// Legacy export for backward compatibility
export const auth = {
    getToken,
    isAuthenticated,
    login,
    logout
};
