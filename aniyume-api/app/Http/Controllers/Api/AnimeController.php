<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnimeController extends Controller
{
    public function index(Request $request)
    {
        $query = Anime::query();

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title_romaji', 'like', "%{$search}%")
                  ->orWhere('title_english', 'like', "%{$search}%")
                  ->orWhere('title_native', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort = $request->input('sort', 'popularity'); // default sort
        $direction = $request->input('direction', 'desc');
        
        if (in_array($sort, ['popularity', 'average_score', 'created_at', 'start_date'])) {
             // DB has 'popularity', 'average_score', 'created_at', 'start_date'
             if ($sort === 'average_rating') $sort = 'average_score'; // Map frontend param to DB column
             if ($sort === 'aired_from') $sort = 'start_date';
             
             $query->orderBy($sort, $direction);
        }

        $anime = $query->paginate(20);

        return response()->json($anime);
    }

    public function show($id)
    {
        $anime = Anime::with(['reviews.user', 'ratings'])->findOrFail($id);
        return response()->json($anime);
    }

    public function store(Request $request)
    {
        // Admin only (middleware handled in routes)
        $validated = $request->validate([
            'title' => 'required|string',
            'status' => 'required|string',
            'type' => 'required|string',
            // ... other validations
        ]);

        $anime = Anime::create($request->all());
        return response()->json($anime, 201);
    }

    public function update(Request $request, $id)
    {
        $anime = Anime::findOrFail($id);
        $anime->update($request->all());
        return response()->json($anime);
    }

    public function destroy($id)
    {
        $anime = Anime::findOrFail($id);
        $anime->delete();
        return response()->json(['message' => 'Anime deleted']);
    }

    public function uploadPoster(Request $request, $id)
    {
        $request->validate(['image' => 'required|image|max:2048']);
        $anime = Anime::findOrFail($id);

        if ($request->file('image')) {
            $path = $request->file('image')->store('anime/posters', 'public');
            $anime->update(['poster_url' => Storage::url($path)]);
        }

        return response()->json(['url' => $anime->poster_url]);
    }

    public function uploadBanner(Request $request, $id)
    {
        $request->validate(['image' => 'required|image|max:4096']);
        $anime = Anime::findOrFail($id);

        if ($request->file('image')) {
            $path = $request->file('image')->store('anime/banners', 'public');
            $anime->update(['banner_url' => Storage::url($path)]);
        }

        return response()->json(['url' => $anime->banner_url]);
    }

    public function updatePlayer(Request $request, $id)
    {
        $anime = Anime::findOrFail($id);
        $anime->update($request->only(['video_source', 'player_url', 'episodes_data']));
        return response()->json($anime);
    }
}
