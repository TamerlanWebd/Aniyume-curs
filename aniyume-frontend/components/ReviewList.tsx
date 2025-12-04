import { Star } from 'lucide-react';

interface Review {
    id: number;
    user: {
        name: string;
        avatar_url?: string;
    };
    content: string;
    is_spoiler: boolean;
    created_at: string;
}

interface ReviewListProps {
    reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="mt-8 bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                Нет отзывов. Будьте первым!
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4">Отзывы</h3>
            {reviews.map((review) => (
                <div key={review.id} className="bg-gray-800 rounded-lg p-4 shadow">
                    <div className="flex items-center mb-2">
                        {review.user.avatar_url ? (
                            <img src={review.user.avatar_url} alt={review.user.name} className="w-8 h-8 rounded-full mr-2" />
                        ) : (
                            <div className="w-8 h-8 bg-gray-600 rounded-full mr-2" />
                        )}
                        <span className="font-semibold text-white">{review.user.name}</span>
                        <span className="ml-auto text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <div className={`text-gray-300 ${review.is_spoiler ? 'blur-sm hover:blur-none transition-all cursor-pointer' : ''}`}>
                        {review.is_spoiler && <span className="text-red-500 text-xs font-bold block mb-1">Осторожно, спойлер! (Наведите чтобы прочитать)</span>}
                        {review.content}
                    </div>
                </div>
            ))}
        </div>
    );
}
