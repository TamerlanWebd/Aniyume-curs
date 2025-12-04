"use client";

import { useState } from 'react';

interface PlayerEditorProps {
    initialData: {
        video_source: 'external' | 'local';
        player_url: string;
        episodes_data: any[];
    };
    onSave: (data: any) => Promise<void>;
}

export default function PlayerEditor({ initialData, onSave }: PlayerEditorProps) {
    const [source, setSource] = useState(initialData.video_source);
    const [url, setUrl] = useState(initialData.player_url);
    const [episodes, setEpisodes] = useState(JSON.stringify(initialData.episodes_data, null, 2));

    const handleSave = async () => {
        try {
            const parsedEpisodes = JSON.parse(episodes);
            await onSave({
                video_source: source,
                player_url: url,
                episodes_data: parsedEpisodes
            });
            alert("Сохранено!");
        } catch (error) {
            console.error("Save failed", error);
            alert("Ошибка сохранения (проверьте JSON)");
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">Настройки плеера</h3>

            <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Источник</label>
                <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                    <option value="external">Внешний (Iframe)</option>
                    <option value="local">Локальный (MP4)</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">URL Плеера</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Данные эпизодов (JSON)</label>
                <textarea
                    value={episodes}
                    onChange={(e) => setEpisodes(e.target.value)}
                    className="w-full h-40 bg-gray-700 text-white rounded px-3 py-2 font-mono text-sm"
                />
            </div>

            <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
                Сохранить настройки плеера
            </button>
        </div>
    );
}
