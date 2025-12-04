import Link from 'next/link';
import { Star } from 'lucide-react';

interface AnimeCardProps {
    anime: {
        id: number;
        title: string;
        poster_url: string;
        average_rating: number;
        type: string;
        season_year?: number;
    };
}

export default function AnimeCard({ anime }: AnimeCardProps) {
    return (
        <Link href={`/anime/${anime.id}`} className="group relative block overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
            <div className="aspect-[2/3] w-full bg-gray-800 relative">
                {anime.poster_url ? (
                    <img
                        src={anime.poster_url}
                        alt={anime.title}
                        className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">No Image</div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-bold text-yellow-400 flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {anime.average_rating}
                </div>
                <div className="absolute top-2 left-2 bg-primary/90 px-2 py-1 rounded text-xs font-bold text-white">
                    {anime.type}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-10">
                <h3 className="text-lg font-bold text-white line-clamp-1">{anime.title}</h3>
                {anime.season_year && (
                    <p className="text-sm text-gray-300">{anime.season_year}</p>
                )}
            </div>
        </Link>
    );
}
