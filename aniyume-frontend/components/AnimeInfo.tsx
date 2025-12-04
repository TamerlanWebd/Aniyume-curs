interface AnimeInfoProps {
    anime: any;
}

export default function AnimeInfo({ anime }: AnimeInfoProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-white mb-2">{anime.title}</h1>
            {anime.title_english && (
                <h2 className="text-xl text-gray-400 mb-4">{anime.title_english}</h2>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-900 text-purple-200 rounded-full text-sm">
                    {anime.type}
                </span>
                <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm">
                    {anime.status}
                </span>
                {anime.season_year && (
                    <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm">
                        {anime.season_year}
                    </span>
                )}
            </div>

            <div className="prose prose-invert max-w-none mb-6">
                <p>{anime.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                    <span className="block text-gray-500">Студия</span>
                    {anime.studio || 'Неизвестно'}
                </div>
                <div>
                    <span className="block text-gray-500">Эпизоды</span>
                    {anime.episodes || '?'}
                </div>
                <div>
                    <span className="block text-gray-500">Жанры</span>
                    {anime.genres ? (Array.isArray(anime.genres) ? anime.genres.join(', ') : anime.genres) : '-'}
                </div>
                <div>
                    <span className="block text-gray-500">Рейтинг</span>
                    {anime.average_rating} / 10 ({anime.ratings_count} голосов)
                </div>
            </div>
        </div>
    );
}
