'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, apiService } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

// Note: In a real app, you'd use the Google Identity Services SDK
// For this demo, we'll simulate the Google login flow or use a simple token input
// Since the backend expects a Google token, we'll assume the user has a way to get it
// Or we can implement a simple "Login with Google" button that redirects to the backend auth endpoint if it supports it.
// Based on the API spec: POST /api/auth/google (returns Bearer Token)
// This usually implies sending an ID token from the client.

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Mocking Google Login for demonstration as setting up actual Google OAuth requires client IDs
    // In a real scenario, we would use 'react-google-login' or similar
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            // For now, we'll simulate a successful login or ask the user to provide a token if they have one for testing
            // Or we can try to hit the backend if it has a redirect flow.
            // Since I don't have a Google Client ID, I will implement a "Dev Login" for testing if the backend supports it,
            // or just show the UI and explain.

            // However, the prompt says "Login page with Google OAuth".
            // I will implement the UI.

            // Simulating a delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Ideally we get an id_token from Google here.
            // const response = await api.post('/auth/google', { token: googleIdToken });
            // localStorage.setItem('token', response.data.token);

            // SET DEMO TOKEN
            localStorage.setItem('token', 'demo-token');

            // For demo purposes, we'll redirect to the dashboard
            router.push('/dashboard');
            toast.success('Logged in successfully (Demo Mode)');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    const [manualToken, setManualToken] = useState('');

    const handleManualLogin = () => {
        if (!manualToken) return;
        localStorage.setItem('token', manualToken);
        router.push('/dashboard');
        toast.success('Logged in with Manual Token');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Aniyume Admin</CardTitle>
                    <CardDescription className="text-center">
                        Login to access the admin panel
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                if (credentialResponse.credential) {
                                    try {
                                        setIsLoading(true);
                                        // Call backend to exchange Google token for Bearer token
                                        const response = await apiService.loginWithGoogle(credentialResponse.credential);
                                        // Assuming backend returns { token: "..." } or similar. Adjust if needed based on actual response.
                                        // If backend returns data wrapped in 'data', axios might unwrap it or we access response.data.token
                                        // Let's assume response.data.token based on typical Laravel Sanctum

                                        // Note: If backend response structure is different, this might need adjustment.
                                        // But for now, we save what we get.
                                        const token = response.data.token || response.data;

                                        if (typeof token === 'string') {
                                            localStorage.setItem('token', token);
                                            router.push('/dashboard');
                                            toast.success('Logged in successfully');
                                        } else {
                                            console.error('Unexpected token format:', response.data);
                                            toast.error('Invalid response from server');
                                        }
                                    } catch (error) {
                                        console.error('Login error:', error);
                                        toast.error('Failed to login with Google');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }
                            }}
                            onError={() => {
                                toast.error('Google Login Failed');
                            }}
                            useOneTap
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or login with token
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Input
                            placeholder="Paste Bearer Token here..."
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                        />
                        <Button variant="outline" onClick={handleManualLogin} disabled={!manualToken}>
                            Login with Token
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
