'use client';

import { useEffect, useState } from 'react';
import http from '@/lib/api/http';

export default function DebugPage() {
    const [apiUrl, setApiUrl] = useState('');
    const [testResult, setTestResult] = useState('');

    useEffect(() => {
        setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'NOT SET');

        const testApi = async () => {
            try {
                const response = await http.get('/health');
                setTestResult('✅ API Connected: ' + JSON.stringify(response.data));
            } catch (error: any) {
                setTestResult('❌ API Error: ' + error.message);
            }
        };

        testApi();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API Debug</h1>
            <div className="space-y-2">
                <p><strong>API URL:</strong> {apiUrl}</p>
                <p><strong>Test Result:</strong> {testResult}</p>
            </div>
        </div>
    );
}
