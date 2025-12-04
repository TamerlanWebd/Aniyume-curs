interface AnimePlayerProps {
    videoSource: 'external' | 'local';
    playerUrl?: string;
}

export default function AnimePlayer({ videoSource, playerUrl }: AnimePlayerProps) {
    if (!playerUrl) {
        return (
            <div className="w-full aspect-video bg-black flex items-center justify-center text-gray-500 rounded-lg">
                Плеер недоступен
            </div>
        );
    }

    return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {videoSource === 'external' ? (
                <iframe
                    src={playerUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            ) : (
                <video
                    src={playerUrl}
                    controls
                    className="w-full h-full"
                />
            )}
        </div>
    );
}
