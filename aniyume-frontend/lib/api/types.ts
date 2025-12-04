export interface Anime {
    id: number;
    anilist_id: number;
    title_romaji: string;
    title_english: string;
    title_native: string;
    description: string;
    cover_image: string;
    banner_image: string;
    format: string;
    status: string;
    type: string;
    episodes: number;
    duration: number;
    genres: Array<{ id: number; name: string; slug: string }> | string[];
    studios: Array<{ id: number; name: string }>;
    average_score: number;
    popularity: number;
    season: string;
    season_year: number;
    start_date: string;
    end_date: string;
    is_adult: boolean;
    last_synced_at: string;
}
