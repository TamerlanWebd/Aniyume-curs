'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2, SkipForward, SkipBack } from 'lucide-react';
import Hls from 'hls.js';

interface Episode {
    title: string;
    num: string;
    url: string;
    quality: string;
    ready: boolean;
}

interface PlayerProps {
    animeTitle: string;
    episodes: Episode[];
    onEpisodeChange?: (episodeNum: string) => void;
}

export default function KinopoiskPlayer({ animeTitle, episodes, onEpisodeChange }: PlayerProps) {
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Автоматический выбор первого эпизода
    useEffect(() => {
        if (episodes.length > 0 && !currentEpisode) {
            const firstReady = episodes.find(ep => ep.ready) || episodes[0];
            handleSelectEpisode(firstReady);
        }
    }, [episodes]);

    // Инициализация плеера
    const initializePlayer = useCallback(async (episode: Episode) => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        // Очистка предыдущего HLS
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        setLoading(true);

        try {
            if (episode.url.includes('.m3u8')) {
                // HLS Stream
                if (Hls.isSupported()) {
                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90,
                        maxBufferLength: 30,
                        maxMaxBufferLength: 60,
                    });

                    hls.loadSource(episode.url);
                    hls.attachMedia(video);

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log('✅ HLS готов');
                        setLoading(false);
                        video.play().catch(e => console.log('Autoplay blocked'));
                    });

                    hls.on(Hls.Events.ERROR, (_, data) => {
                        if (data.fatal) {
                            console.error('❌ HLS Error:', data);
                            setLoading(false);
                        }
                    });

                    hlsRef.current = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = episode.url;
                    setLoading(false);
                }
            } else {
                // MP4 Stream
                video.src = episode.url;
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Player init error:', error);
            setLoading(false);
        }
    }, []);

    // Выбор эпизода
    const handleSelectEpisode = async (episode: Episode) => {
        setCurrentEpisode(episode);

        if (episode.ready && episode.url) {
            await initializePlayer(episode);
        } else {
            setLoading(true);
            onEpisodeChange?.(episode.num);
        }
    };

    // Переключение воспроизведения
    const togglePlay = () => {
        if (!videoRef.current) return;

        if (playing) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    };

    // Управление громкостью
    const handleVolumeChange = (newVolume: number) => {
        if (!videoRef.current) return;
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        setMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMuted = !muted;
        setMuted(newMuted);
        videoRef.current.muted = newMuted;
    };

    // Перемотка
    const handleSeek = (time: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    // Полноэкранный режим
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!fullscreen) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    // Следующий/предыдущий эпизод
    const goToNextEpisode = () => {
        if (!currentEpisode) return;
        const currentIndex = episodes.findIndex(ep => ep.num === currentEpisode.num);
        if (currentIndex < episodes.length - 1) {
            handleSelectEpisode(episodes[currentIndex + 1]);
        }
    };

    const goToPreviousEpisode = () => {
        if (!currentEpisode) return;
        const currentIndex = episodes.findIndex(ep => ep.num === currentEpisode.num);
        if (currentIndex > 0) {
            handleSelectEpisode(episodes[currentIndex - 1]);
        }
    };

    // Скрытие контролов
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    };

    // Клавиатурные shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Don't trigger shortcuts if user is typing in an input
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            if (!videoRef.current) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleSeek(Math.min(duration, currentTime + 10));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleSeek(Math.max(0, currentTime - 10));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleVolumeChange(Math.min(1, volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleVolumeChange(Math.max(0, volume - 0.1));
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'KeyN':
                    e.preventDefault();
                    goToNextEpisode();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    goToPreviousEpisode();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [playing, currentTime, duration, volume, currentEpisode]);

    // События видео
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setPlaying(true);
        const handlePause = () => setPlaying(false);
        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };
        const handleEnded = () => goToNextEpisode();

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('ended', handleEnded);
        };
    }, [episodes, currentEpisode]);

    // Fullscreen events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Форматирование времени
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4">
            {/* Плеер */}
            <div
                ref={containerRef}
                className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
                style={{ aspectRatio: '16/9' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => playing && setShowControls(false)}
            >
                {/* Видео */}
                <video
                    ref={videoRef}
                    className="w-full h-full"
                    onClick={togglePlay}
                />

                {/* Загрузка */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                        <div className="text-center">
                            <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
                            <p className="text-white font-semibold">Загрузка видео...</p>
                        </div>
                    </div>
                )}

                {/* Индикатор качества и скорости */}
                {playing && (
                    <div className="absolute top-4 right-4 z-20 space-y-2">
                        {/* Качество */}
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                            {currentEpisode?.quality || 'HD'}
                        </div>

                        {/* Индикатор буферизации */}
                        {buffered < currentTime && (
                            <div className="bg-yellow-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white animate-pulse">
                                Буферизация...
                            </div>
                        )}
                    </div>
                )}

                {/* Подсказки по управлению (показываются при паузе) */}
                {!playing && !loading && showControls && (
                    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-xs text-gray-300">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            <span>Space</span><span className="text-white">Воспроизведение</span>
                            <span>← →</span><span className="text-white">±10 секунд</span>
                            <span>↑ ↓</span><span className="text-white">Громкость</span>
                            <span>F</span><span className="text-white">Полный экран</span>
                            <span>N/P</span><span className="text-white">След./Пред. эпизод</span>
                            <span>M</span><span className="text-white">Выкл. звук</span>
                        </div>
                    </div>
                )}

                {/* Контролы */}
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Progress Bar */}
                    <div className="mb-3">
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => handleSeek(Number(e.target.value))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            style={{
                                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Prev Episode */}
                            <button
                                onClick={goToPreviousEpisode}
                                className="p-2 hover:bg-white/10 rounded-full transition"
                                disabled={!currentEpisode || episodes[0].num === currentEpisode.num}
                            >
                                <SkipBack className="w-5 h-5 text-white" />
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition"
                            >
                                {playing ? (
                                    <Pause className="w-6 h-6 text-white fill-current" />
                                ) : (
                                    <Play className="w-6 h-6 text-white fill-current" />
                                )}
                            </button>

                            {/* Next Episode */}
                            <button
                                onClick={goToNextEpisode}
                                className="p-2 hover:bg-white/10 rounded-full transition"
                                disabled={!currentEpisode || episodes[episodes.length - 1].num === currentEpisode.num}
                            >
                                <SkipForward className="w-5 h-5 text-white" />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2">
                                <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full">
                                    {muted || volume === 0 ? (
                                        <VolumeX className="w-5 h-5 text-white" />
                                    ) : (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={muted ? 0 : volume}
                                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            {/* Episode Info */}
                            {currentEpisode && (
                                <span className="text-sm text-white font-medium ml-2">
                                    Эпизод {currentEpisode.num} • {currentEpisode.quality}
                                </span>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white/10 rounded-full transition"
                        >
                            {fullscreen ? (
                                <Minimize className="w-5 h-5 text-white" />
                            ) : (
                                <Maximize className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Центральная кнопка Play */}
                {!playing && !loading && (
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center z-10"
                    >
                        <div className="w-20 h-20 bg-purple-600/90 hover:bg-purple-700 rounded-full flex items-center justify-center transition">
                            <Play className="w-10 h-10 text-white fill-current ml-1" />
                        </div>
                    </button>
                )}
            </div>

            {/* Список эпизодов */}
            <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">Эпизоды</span>
                    <span className="text-sm text-gray-400">({episodes.length})</span>
                </h3>

                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-60 overflow-y-auto">
                    {episodes.map((episode) => (
                        <button
                            key={episode.num}
                            onClick={() => handleSelectEpisode(episode)}
                            className={`relative p-3 rounded-lg font-semibold transition-all ${currentEpisode?.num === episode.num
                                    ? 'bg-purple-600 text-white scale-105 shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            {episode.num}
                            {episode.ready && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
