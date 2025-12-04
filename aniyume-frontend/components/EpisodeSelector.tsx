interface EpisodeSelectorProps {
    episodesData?: any[];
    currentEpisode?: number;
    onSelect: (episode: number) => void;
}

export default function EpisodeSelector({ episodesData, currentEpisode, onSelect }: EpisodeSelectorProps) {
    if (!episodesData || episodesData.length === 0) return null;

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Серии</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-800 rounded-lg">
                {episodesData.map((ep, index) => {
                    const episodeNum = ep.number || index + 1;
                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(episodeNum)}
                            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${currentEpisode === episodeNum
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {episodeNum}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
