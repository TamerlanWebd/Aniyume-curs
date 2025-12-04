"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { ratingService } from '@/lib/services/ratingService';

interface RatingWidgetProps {
    animeId: number;
    initialRating?: number;
    onRate?: (rating: number) => void;
}

export default function RatingWidget({ animeId, initialRating, onRate }: RatingWidgetProps) {
    const [rating, setRating] = useState(initialRating || 0);
    const [hover, setHover] = useState(0);

    const handleRate = async (value: number) => {
        try {
            setRating(value);
            await ratingService.rateAnime(animeId, value);
            if (onRate) onRate(value);
        } catch (error) {
            console.error("Failed to rate", error);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            {[...Array(10)].map((_, index) => {
                const value = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        className="focus:outline-none"
                        onClick={() => handleRate(value)}
                        onMouseEnter={() => setHover(value)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <Star
                            className={`w-5 h-5 transition-colors ${value <= (hover || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-600'
                                }`}
                        />
                    </button>
                );
            })}
            <span className="ml-2 text-sm text-gray-400">
                {rating > 0 ? `Ваша оценка: ${rating}` : 'Оцените аниме'}
            </span>
        </div>
    );
}
