'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Film, Activity } from 'lucide-react';
import { echo } from '@/lib/echo';
import { toast } from 'sonner';

interface RealTimeStatsProps {
    initialStats?: {
        anime_count: number;
        user_count: number;
    };
}

export function RealTimeStats({ initialStats }: RealTimeStatsProps) {
    const [stats, setStats] = useState({
        anime_count: initialStats?.anime_count || 0,
        user_count: initialStats?.user_count || 0,
    });

    const [lastAction, setLastAction] = useState<string | null>(null);

    useEffect(() => {
        if (!echo) return;

        const channel = echo.channel('dashboard');

        channel.listen('.stats.updated', (e: any) => {
            console.log('Stats updated:', e);
            setStats(e.stats);

            if (e.stats.recent_action) {
                const { action, model } = e.stats.recent_action;
                const message = `${action.toUpperCase()} ${model}`;
                setLastAction(message);
                toast.info(`New Activity: ${message}`);
            }
        });

        return () => {
            echo.leave('dashboard');
        };
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Anime</CardTitle>
                    <Film className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.anime_count}</div>
                    <p className="text-xs text-muted-foreground">Live count</p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.user_count}</div>
                    <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Live Activity</CardTitle>
                    <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{lastAction || 'Idle'}</div>
                    <p className="text-xs text-muted-foreground">Real-time updates</p>
                </CardContent>
            </Card>
        </div>
    );
}
