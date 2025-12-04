'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('auth_token', token);
            router.push('/profile');
        } else {
            // Show error if no token
            const error = searchParams.get('error');
            if (error) {
                console.error("Auth error:", error);
            }
            router.push('/login?error=AuthFailed');
        }
    }, [searchParams, router]);

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Авторизация...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EC4B6] mx-auto"></div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Suspense fallback={<div>Loading...</div>}>
                <AuthCallbackContent />
            </Suspense>
        </div>
    );
}
