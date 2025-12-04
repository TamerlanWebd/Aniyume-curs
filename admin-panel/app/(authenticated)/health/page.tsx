'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, HardDrive, Clock, Server } from 'lucide-react';

export default function HealthPage() {
    const { data: health, isLoading, error } = useQuery({
        queryKey: ['health'],
        queryFn: async () => {
            const response = await apiService.getHealth();
            return response.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return <HealthSkeleton />;
    }

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <Activity className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-red-600">System Unhealthy</h2>
                    <p className="text-muted-foreground">Could not connect to the API health endpoint.</p>
                </div>
            </div>
        );
    }

    if (!health) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
                <p className="text-muted-foreground">Real-time monitoring of system services and resources.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`h-3 w-3 rounded-full ${health.checks.database === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-2xl font-bold">{health.checks.database === 'ok' ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">MySQL / PostgreSQL connection</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Firestore Status</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`h-3 w-3 rounded-full ${health.checks.firestore === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-2xl font-bold">{health.checks.firestore === 'ok' ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Firebase NoSQL connection</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cache Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`h-3 w-3 rounded-full ${health.checks.cache === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-2xl font-bold">{health.checks.cache === 'ok' ? 'Operational' : 'Down'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Redis / File cache</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Memory Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Current Usage</span>
                                <Badge variant="outline">{health.memory_usage.used}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Peak Usage</span>
                                <Badge variant="outline">{health.memory_usage.peak}</Badge>
                            </div>
                            {/* Visual bar for memory could go here if we had percentage */}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            System Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Server Time</span>
                                <span className="text-sm text-muted-foreground">{health.server_time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Uptime</span>
                                <span className="text-sm text-muted-foreground">{health.uptime}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function HealthSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-[200px]" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-[120px]" />
                <Skeleton className="h-[120px]" />
                <Skeleton className="h-[120px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[200px]" />
                <Skeleton className="h-[200px]" />
            </div>
        </div>
    );
}
