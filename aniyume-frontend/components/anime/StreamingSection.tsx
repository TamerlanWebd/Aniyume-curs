'use client';

import { useState, useEffect, useRef } from 'react';
import { animeService } from '@/lib/services/animeService';
import { PlayCircle, Loader2, AlertCircle } from 'lucide-react';
import Hls from 'hls.js';

interface StreamingEpisode {
    title: string;
    num: string;
    url: string;
    quality: string;
}

interface StreamingResponse {
    anime_title: string;
    streaming_episodes: StreamingEpisode[];
}

interface StreamingSectionProps {
    animeId: number | string;
}

export default function StreamingSection({ animeId }: StreamingSectionProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<StreamingResponse | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<StreamingEpisode | null>(null);
    const [resolvingEpisode, setResolvingEpisode] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                setLoading(true);
                const response = await animeService.getAnimeStreams(animeId);
                setData(response);
                if (response.streaming_episodes.length > 0) {
                    const firstEp = response.streaming_episodes[0];
                    if (firstEp.url) {
                        setSelectedEpisode(firstEp);
                    } else {
                        // If first episode exists but no URL (shouldn't happen with new backend logic for first ep, but good safety)
                        handleEpisodeClick(firstEp);
                    }
                }
            } catch (err: any) {
                console.error('Failed to fetch streams:', err);
                const status = err.response?.status;
                const detail = err.response?.data?.detail || err.message;
                setError(`Не удалось загрузить список серий (${status}: ${detail}). Возможно, они еще не вышли или недоступны.`);
            } finally {
                setLoading(false);
            }
        };

        fetchStreams();
    }, [animeId]);

    const handleEpisodeClick = async (ep: StreamingEpisode) => {
        if (ep.url) {
            setSelectedEpisode(ep);
            return;
        }

        try {
            setResolvingEpisode(true);
            setSelectedEpisode(ep); // Show "Loading..." or similar in player

            const response = await animeService.getAnimeEpisodeStream(animeId, ep.num);

            if (response.url) {
                const updatedEp = { ...ep, url: response.url, quality: response.quality };

                // Update cache
                if (data) {
                    const newEpisodes = data.streaming_episodes.map(e =>
                        e.num === ep.num ? updatedEp : e
                    );
                    setData({ ...data, streaming_episodes: newEpisodes });
                }

                setSelectedEpisode(updatedEp);
            } else {
                console.error('No URL found for episode');
            }
        } catch (err) {
            console.error('Failed to resolve episode:', err);
        } finally {
            setResolvingEpisode(false);
        }
    };

    useEffect(() => {
        if (!selectedEpisode?.url || !videoRef.current) return;

        const video = videoRef.current;
        const videoSrc = selectedEpisode.url;

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Check if URL is HLS stream
        if (videoSrc.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });

                hls.loadSource(videoSrc);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('HLS manifest loaded');
                    video.play().catch(e => console.log("Autoplay blocked", e));
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS error:', data);
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                break;
                        }
                    }
                });

                hlsRef.current = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSrc;
            }
        } else {
            video.src = videoSrc;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [selectedEpisode?.url]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                <span className="ml-2 text-gray-400">Загрузка плеера...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
            </div>
        );
    }

    if (!data || data.streaming_episodes.length === 0) {
        return (
            <div className="mb-6 p-6 bg-gray-800 rounded-lg text-center text-gray-400">
                Серии не найдены
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border border-teal-500/20 bg-gray-800">
                <div className="bg-teal-500/5 border-b border-teal-500/10 p-4">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
                        <PlayCircle className="h-6 w-6 text-teal-400" />
                        Смотреть онлайн: {data.anime_title}
                    </h3>
                </div>

                <div className="p-0">
                    {/* Video Player Area */}
                    <div className="aspect-video bg-black w-full relative">
                        {resolvingEpisode && (
                            <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-teal-400 mb-2" />
                                    <span className="text-white font-medium">Загрузка видео...</span>
                                </div>
                            </div>
                        )}

                        {selectedEpisode?.url ? (
                            <video
                                ref={videoRef}
                                controls
                                className="w-full h-full"
                                autoPlay={false}
                            >
                                <source src={selectedEpisode.url} />
                                Ваш браузер не поддерживает видео тег.
                            </video>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/50">
                                {selectedEpisode ? 'Ожидание загрузки...' : 'Выберите серию'}
                            </div>
                        )}
                    </div>

                    {/* Episode List */}
                    <div className="p-4 bg-gray-900">
                        <div className="flex justify-between items-end mb-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400">
                                Список серий ({data.streaming_episodes.length})
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {data.streaming_episodes.map((ep) => (
                                <button
                                    key={ep.num}
                                    className={`w-full px-3 py-2 rounded text-left truncate transition-colors ${selectedEpisode?.num === ep.num
                                        ? "bg-teal-600 text-white"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                                        }`}
                                    onClick={() => handleEpisodeClick(ep)}
                                    title={ep.title}
                                    disabled={resolvingEpisode && selectedEpisode?.num === ep.num}
                                >
                                    <span className="truncate block">
                                        Эпизод {ep.num}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
