<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AnimeStreamsController extends Controller
{
    private $streamServiceUrl;

    public function __construct()
    {
        $this->streamServiceUrl = config('services.streams_service.base_uri', 'http://127.0.0.1:9000');
    }

    /**
     * Получить список эпизодов для аниме
     */
    public function getStreams(Request $request)
    {
        set_time_limit(120); // Increase execution tme for slow scraping
        $title = $request->query('title');

        if (!$title) {
            return response()->json(['error' => 'Title parameter is required'], 400);
        }

        // Bypass Cache for Debugging
        // $cacheKey = 'streams_' . md5($title);
        // $result = Cache::remember($cacheKey, 3600, function () use ($title) { ...

        // Manually build URL to avoid any Guzzle encoding issues
        $streamUrl = "{$this->streamServiceUrl}/streams?title=" . urlencode($title);
        Log::info("DEBUG: Entering getStreams for title: {$title}. Requesting: {$streamUrl}");

        try {
            // Increase timeout to 60s because scraping can be slow
            $response = Http::timeout(60)->get($streamUrl);

            Log::info("DEBUG: Response status: " . $response->status());

            if ($response->failed()) {
                Log::error("Stream service error for title: {$title}", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                return response()->json([
                    'detail' => 'Stream service error: ' . $response->status(),
                    'debug_url' => "{$this->streamServiceUrl}/streams",
                    'status' => $response->status()
                ], $response->status());
            }

            return response()->json($response->json());
            
        } catch (\Exception $e) {
            Log::error("DEBUG: Exception in getStreams: {$e->getMessage()}");
            return response()->json([
                'detail' => 'Service connection error: ' . $e->getMessage(),
                'debug_url' => "{$this->streamServiceUrl}/streams",
                'status' => 503
            ], 503);
        }
    }

    /**
     * Получить конкретный эпизод
     */
    public function getEpisodeStream(Request $request)
    {
        set_time_limit(120);
        $title = $request->query('title');
        $episodeNum = $request->query('episode_num');

        if (!$title || !$episodeNum) {
            return response()->json(['detail' => 'Title and episode_num are required'], 400);
        }

        // Кэширование на 2 часа
        $cacheKey = 'episode_' . md5($title . '_' . $episodeNum);
        
        $result = Cache::remember($cacheKey, 7200, function () use ($title, $episodeNum) {
            try {
                $url = "{$this->streamServiceUrl}/stream/episode?title=" . urlencode($title) . "&episode_num=" . urlencode($episodeNum);
                
                Log::info("DEBUG: Requesting episode: {$url}");
                
                $response = Http::timeout(30)->get($url);

                if ($response->failed()) {
                    Log::error("Stream service error for episode", [
                        'title' => $title,
                        'episode' => $episodeNum,
                        'status' => $response->status(),
                    ]);
                    
                    return [
                        'detail' => 'Stream service error: ' . $response->status(),
                        'status' => $response->status()
                    ];
                }

                return $response->json();
                
            } catch (\Exception $e) {
                Log::error("Exception in getEpisodeStream: {$e->getMessage()}");
                return [
                    'detail' => 'Service connection error: ' . $e->getMessage(),
                    'status' => 503
                ];
            }
        });

        if (isset($result['detail'])) {
            return response()->json($result, $result['status'] ?? 500);
        }

        return response()->json($result);
    }

    /**
     * Очистка кэша для конкретного аниме
     */
    public function clearCache(Request $request)
    {
        $title = $request->query('title');
        
        if ($title) {
            Cache::forget('streams_' . md5($title));
            return response()->json(['message' => 'Cache cleared for title']);
        }

        return response()->json(['error' => 'Title required'], 400);
    }
}
