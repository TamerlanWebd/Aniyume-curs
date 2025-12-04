"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ImageUploader from '@/components/ImageUploader';
import PlayerEditor from '@/components/PlayerEditor';
import { animeService } from '@/lib/services/animeService';
import api from '@/lib/api'; // Direct API access for update if service doesn't cover all fields

export default function AdminAnimeEdit() {
    const { id } = useParams();
    const router = useRouter();
    const [anime, setAnime] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnime = async () => {
            try {
                setLoading(true);
                const data = await animeService.getAnimeById(id as string);
                setAnime(data);
            } catch (error) {
                console.error("Failed to fetch anime", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnime();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Use a generic update endpoint or specific service method
            await api.put(`/anime/${id}`, anime);
            alert("Аниме обновлено!");
        } catch (error) {
            console.error("Update failed", error);
            alert("Ошибка обновления");
        }
    };

    const handlePosterUpload = async (file: File) => {
        const data = await animeService.uploadAnimePoster(id as string, file);
        setAnime({ ...anime, poster_url: data.url });
        return data.url;
    };

    const handleBannerUpload = async (file: File) => {
        const data = await animeService.uploadAnimeBanner(id as string, file);
        setAnime({ ...anime, banner_url: data.url });
        return data.url;
    };

    const handlePlayerSave = async (playerData: any) => {
        await animeService.updateAnimePlayer(id as string, playerData);
        setAnime({ ...anime, ...playerData });
    };

    if (loading) return <div>Loading...</div>;
    if (!anime) return <div>Not found</div>;

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-gray-900 text-white pb-10">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">Редактирование: {anime.title}</h1>

                    <form onSubmit={handleUpdate} className="space-y-6 bg-gray-800 p-6 rounded-lg mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Название</label>
                            <input
                                type="text"
                                value={anime.title}
                                onChange={(e) => setAnime({ ...anime, title: e.target.value })}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">English Title</label>
                            <input
                                type="text"
                                value={anime.title_english || ''}
                                onChange={(e) => setAnime({ ...anime, title_english: e.target.value })}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Описание</label>
                            <textarea
                                value={anime.description || ''}
                                onChange={(e) => setAnime({ ...anime, description: e.target.value })}
                                rows={4}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white px-3 py-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Тип</label>
                                <select
                                    value={anime.type}
                                    onChange={(e) => setAnime({ ...anime, type: e.target.value })}
                                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white px-3 py-2"
                                >
                                    <option value="TV">TV</option>
                                    <option value="MOVIE">MOVIE</option>
                                    <option value="OVA">OVA</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Статус</label>
                                <select
                                    value={anime.status}
                                    onChange={(e) => setAnime({ ...anime, status: e.target.value })}
                                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white px-3 py-2"
                                >
                                    <option value="FINISHED">FINISHED</option>
                                    <option value="RELEASING">RELEASING</option>
                                    <option value="NOT_YET_RELEASED">ANNOUNCED</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                            Сохранить основные данные
                        </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-4">Медиа</h3>
                            <ImageUploader
                                label="Постер"
                                currentImage={anime.poster_url}
                                onUpload={handlePosterUpload}
                            />
                            <ImageUploader
                                label="Баннер"
                                currentImage={anime.banner_url}
                                onUpload={handleBannerUpload}
                            />
                        </div>

                        <PlayerEditor
                            initialData={{
                                video_source: anime.video_source,
                                player_url: anime.player_url,
                                episodes_data: anime.episodes_data || []
                            }}
                            onSave={handlePlayerSave}
                        />
                    </div>

                </div>
            </main>
        </ProtectedRoute>
    );
}
