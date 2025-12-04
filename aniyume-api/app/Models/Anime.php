<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anime extends Model
{
    use HasFactory;

    protected $table = 'anime';

    protected $fillable = [
        'anilist_id',
        'title_romaji',
        'title_english',
        'title_native',
        'description',
        'cover_image',
        'banner_image',
        'average_score',
        'popularity',
        'episodes',
        'type',
        'status',
        'season',
        'season_year',
        'start_date',
        'end_date',
        'streaming_episodes',
        'trailer_url',
        'is_adult',
        'country_of_origin',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'average_score' => 'integer',
        'is_adult' => 'boolean',
        'streaming_episodes' => 'array',
    ];

    protected $appends = [
        'title',
        'poster_url',
        'banner_url',
        'average_rating',
        'aired_from',
        'aired_to',
    ];

    // Accessors for Frontend Compatibility
    public function getTitleAttribute()
    {
        return $this->title_romaji ?? $this->title_english ?? $this->title_native;
    }

    public function getPosterUrlAttribute()
    {
        return $this->cover_image;
    }

    public function getBannerUrlAttribute()
    {
        return $this->banner_image;
    }

    public function getAverageRatingAttribute()
    {
        return $this->average_score; // Assuming score is 0-100 or similar, frontend might expect 0-10 or 0-5. 
        // If frontend expects 0-10 and score is 0-100, we might need to divide.
        // But for now, just return the value.
    }

    public function getAiredFromAttribute()
    {
        return $this->start_date;
    }

    public function getAiredToAttribute()
    {
        return $this->end_date;
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites', 'anime_id', 'user_id')->withTimestamps();
    }

    public function watchers()
    {
        return $this->belongsToMany(User::class, 'anime_user')
                    ->withPivot(['status', 'episodes_watched'])
                    ->withTimestamps();
    }

    /*
    public function updateAverageRating()
    {
        $avg = $this->ratings()->avg('rating');
        $count = $this->ratings()->count();

        $this->update([
            'average_rating' => $avg ?? 0,
            'ratings_count' => $count,
        ]);
    }
    */
}
