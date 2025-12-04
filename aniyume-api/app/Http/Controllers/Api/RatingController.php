<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'anime_id' => 'required|exists:anime,id',
            'rating' => 'required|integer|min:1|max:10'
        ]);

        $rating = Rating::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'anime_id' => $request->anime_id
            ],
            [
                'rating' => $request->rating
            ]
        );

        return response()->json($rating);
    }

    public function destroy($animeId)
    {
        $rating = Rating::where('user_id', auth()->id())
                        ->where('anime_id', $animeId)
                        ->firstOrFail();
        
        $rating->delete();

        return response()->json(['message' => 'Rating removed']);
    }
}
