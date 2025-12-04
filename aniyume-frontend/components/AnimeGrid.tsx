import AnimeCard from './AnimeCard';

interface AnimeGridProps {
    animeList: any[];
    loading?: boolean;
}

export default function AnimeGrid({ animeList, loading }: AnimeGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (!animeList || animeList.length === 0) {
        return <div className="text-center py-10 text-gray-400">Ничего не найдено</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {animeList.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
            ))}
        </div>
    );
}
