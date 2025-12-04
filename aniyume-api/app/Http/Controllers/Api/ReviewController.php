<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'anime_id' => 'required|exists:anime,id',
            'content' => 'required|string|min:10',
            'is_spoiler' => 'boolean'
        ]);

        // One review per user per anime
        $review = Review::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'anime_id' => $request->anime_id
            ],
            [
                'content' => $request->content,
                'is_spoiler' => $request->is_spoiler ?? false
            ]
        );

        return response()->json($review, 201);
    }

    public function update(Request $request, $id)
    {
        $review = Review::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        
        $request->validate([
            'content' => 'required|string|min:10',
            'is_spoiler' => 'boolean'
        ]);

        $review->update($request->only(['content', 'is_spoiler']));

        return response()->json($review);
    }

    public function destroy($id)
    {
        $review = Review::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $review->delete();

        return response()->json(['message' => 'Review deleted']);
    }
}
