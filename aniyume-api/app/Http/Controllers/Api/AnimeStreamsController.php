<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnimeStreamsController extends Controller
{
    /**
     * Return anime data + streaming_episodes from Python service.
     *
     * @param int $id Anime ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($id)
    {
        // Увеличиваем лимит времени выполнения для парсинга (может занять до 2 минут)
        set_time_limit(120);
        
        $anime = Anime::findOrFail($id);

        // Get title for search (prefer romaji, fallback to english/native)
        $title = $anime->title_romaji
            ?? $anime->title_english
            ?? $anime->title
            ?? $anime->title_native;

        if (!$title) {
            return response()->json([
                'message' => 'Anime title is missing',
            ], 400);
        }

        // Get Python service URL from config (port 9000 to avoid conflict with Laravel)
        $baseUri = config('services.streams_service.base_uri', 'http://127.0.0.1:9000');

        // Call Python streaming service (increased timeout for parsing)
        try {
            $response = Http::timeout(30)->get($baseUri . '/streams', [
                'title' => $title,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'message' => 'Streams not available',
                    'upstream_status' => $response->status(),
                    'details' => $response->json(),
                ], $response->status());
            }

            $data = $response->json();
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Stream service is unavailable',
                'error' => $e->getMessage(),
            ], 503);
        }

        // Return combined response with new format
        return response()->json([
            'anime_id' => $anime->id,
            'anilist_id' => $anime->anilist_id,
            'title_romaji' => $anime->title_romaji,
            'title_english' => $anime->title_english,
            'title_native' => $anime->title_native,
            'description' => $anime->description,
            'poster_url' => $anime->poster_url,
            'banner_url' => $anime->banner_url,
            'average_rating' => $anime->average_rating,
            'type' => $anime->type,
            'status' => $anime->status,
            'episodes' => $anime->episodes,
            'season' => $anime->season,
            'season_year' => $anime->season_year,
            'aired_from' => $anime->aired_from,
            'aired_to' => $anime->aired_to,
            // New format from Python service
            'anime_title' => $data['anime_title'] ?? null,
            'streaming_episodes' => $data['streaming_episodes'] ?? [],
        ]);
    }

    public function episode(Request $request, $id)
    {
        $anime = Anime::findOrFail($id);
        
        $title = $anime->title_romaji
            ?? $anime->title_english
            ?? $anime->title
            ?? $anime->title_native;

        $episodeNum = $request->query('episode_num');

        if (!$episodeNum) {
            return response()->json(['message' => 'Episode number required'], 400);
        }

        $baseUri = config('services.streams_service.base_uri', 'http://127.0.0.1:9000');

        try {
            $response = Http::timeout(30)->get($baseUri . '/stream/episode', [
                'title' => $title,
                'episode_num' => $episodeNum
            ]);

            if ($response->failed()) {
                return response()->json($response->json(), $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['message' => 'Service unavailable'], 503);
        }
    }
}
