'use client';

import { useState, useEffect } from 'react';
import { animeService } from '@/lib/services/animeService';
import { Loader2, AlertCircle } from 'lucide-react';
import KinopoiskPlayer from './KinopoiskPlayer';
import { analytics } from '@/lib/analytics';

interface Episode {
    title: string;
    num: string;
    url: string;
    quality: string;
    ready: boolean;
}

interface StreamingSectionProps {
    animeTitle: string;
}

export default function StreamingSection({ animeTitle }: StreamingSectionProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loadTime, setLoadTime] = useState(0);

    useEffect(() => {
        const fetchStreams = async () => {
            const startTime = performance.now();
            analytics.startTimer('stream_load');

            try {
                setLoading(true);
                setError(null);

                // Запрашиваем с предзагрузкой 3 эпизодов
                const response = await animeService.getAnimeStreams(animeTitle, 3);

                setEpisodes(response.streaming_episodes);
                setLoadTime(response.load_time || ((performance.now() - startTime) / 1000));

                const loadDuration = analytics.endTimer('stream_load');
                analytics.sendMetric('player_load_time', loadDuration, {
                    anime_title: animeTitle,
                    episodes_count: String(response.streaming_episodes.length)
                });

                console.log(`⚡ Плеер загружен за ${response.load_time}s`);

            } catch (err: any) {
                console.error('❌ Ошибка загрузки:', err);
                setError(err.response?.data?.detail || err.message || 'Ошибка загрузки плеера');
            } finally {
                setLoading(false);
            }
        };

        if (animeTitle) {
            fetchStreams();
        }
    }, [animeTitle]);

    // Загрузка эпизода по требованию
    const handleEpisodeChange = async (episodeNum: string) => {
        try {
            const response = await animeService.getAnimeEpisodeStream(animeTitle, episodeNum);

            setEpisodes(prev =>
                prev.map(ep =>
                    ep.num === episodeNum
                        ? { ...ep, url: response.url, quality: response.quality, ready: true }
                        : ep
                )
            );
        } catch (err) {
            console.error('❌ Ошибка загрузки эпизода:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                <p className="text-gray-400 text-lg">Подготовка плеера...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-6 flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                    <p className="text-red-400 font-semibold">Ошибка загрузки плеера</p>
                    <p className="text-red-300/80 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (episodes.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p className="text-lg">Эпизоды не найдены</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Информация о загрузке */}
            {loadTime > 0 && (
                <div className="text-right text-xs text-gray-500">
                    Загружено за {loadTime.toFixed(2)}s
                </div>
            )}

            {/* Плеер */}
            <KinopoiskPlayer
                animeTitle={animeTitle}
                episodes={episodes}
                onEpisodeChange={handleEpisodeChange}
            />
        </div>
    );
}
