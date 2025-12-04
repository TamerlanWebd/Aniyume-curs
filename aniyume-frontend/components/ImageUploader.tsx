"use client";

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
    label: string;
    currentImage?: string;
    onUpload: (file: File) => Promise<string>;
}

export default function ImageUploader({ label, currentImage, onUpload }: ImageUploaderProps) {
    const [preview, setPreview] = useState(currentImage);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const url = await onUpload(file);
            setPreview(url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="flex items-center space-x-4">
                <div className="w-32 h-48 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border border-gray-600">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-500 text-xs">Нет фото</span>
                    )}
                </div>
                <div>
                    <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center">
                        <Upload className="w-4 h-4 mr-2" />
                        {loading ? 'Загрузка...' : 'Загрузить'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={loading} />
                    </label>
                </div>
            </div>
        </div>
    );
}
