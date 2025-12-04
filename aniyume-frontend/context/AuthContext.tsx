"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle as firebaseSignInWithGoogle, signOut as firebaseSignOut, auth } from '@/lib/firebase';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    is_admin: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    loginWithGoogle: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            const firebaseUser = await firebaseSignInWithGoogle();
            const idToken = await firebaseUser.getIdToken();

            const response = await api.post('/auth/firebase-login', { token: idToken });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
            router.push('/profile');
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut();
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
