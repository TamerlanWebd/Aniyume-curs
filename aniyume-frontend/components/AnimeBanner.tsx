interface AnimeBannerProps {
    bannerUrl?: string;
    title: string;
}

export default function AnimeBanner({ bannerUrl, title }: AnimeBannerProps) {
    if (!bannerUrl) return null;

    return (
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
            <img
                src={bannerUrl}
                alt={`${title} Banner`}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
    );
}
