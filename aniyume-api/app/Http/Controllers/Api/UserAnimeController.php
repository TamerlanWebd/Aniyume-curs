<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use Illuminate\Http\Request;

class UserAnimeController extends Controller
{
    // Favorites
    public function getFavorites(Request $request)
    {
        $favorites = $request->user()->favorites()->paginate(20);
        return response()->json($favorites);
    }

    public function addToFavorites(Request $request, $animeId)
    {
        $request->user()->favorites()->syncWithoutDetaching([$animeId]);
        return response()->json(['message' => 'Added to favorites']);
    }

    public function removeFromFavorites(Request $request, $animeId)
    {
        $request->user()->favorites()->detach($animeId);
        return response()->json(['message' => 'Removed from favorites']);
    }

    // Watchlist
    public function getWatchlist(Request $request)
    {
        $watchlist = $request->user()->watchlist()->paginate(20);
        return response()->json($watchlist);
    }

    public function addToWatchlist(Request $request, $animeId)
    {
        $request->validate([
            'status' => 'required|in:watching,completed,planned,dropped,on_hold',
            'episodes_watched' => 'integer|min:0'
        ]);

        $request->user()->watchlist()->syncWithoutDetaching([
            $animeId => [
                'status' => $request->status,
                'episodes_watched' => $request->input('episodes_watched', 0)
            ]
        ]);

        return response()->json(['message' => 'Added to watchlist']);
    }

    public function updateWatchlist(Request $request, $animeId)
    {
        $request->validate([
            'status' => 'in:watching,completed,planned,dropped,on_hold',
            'episodes_watched' => 'integer|min:0'
        ]);

        $request->user()->watchlist()->updateExistingPivot($animeId, $request->only(['status', 'episodes_watched']));

        return response()->json(['message' => 'Watchlist updated']);
    }

    public function removeFromWatchlist(Request $request, $animeId)
    {
        $request->user()->watchlist()->detach($animeId);
        return response()->json(['message' => 'Removed from watchlist']);
    }
}
