interface AnimePosterProps {
    posterUrl?: string;
    title: string;
}

export default function AnimePoster({ posterUrl, title }: AnimePosterProps) {
    return (
        <div className="w-full max-w-xs mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800">
            {posterUrl ? (
                <img
                    src={posterUrl}
                    alt={title}
                    className="w-full h-auto object-cover"
                />
            ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-500">
                    No Image
                </div>
            )}
        </div>
    );
}
