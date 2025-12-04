<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'anime_id',
        'rating',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function anime()
    {
        return $this->belongsTo(Anime::class);
    }

    protected static function booted()
    {
        static::saved(function ($rating) {
            $rating->anime->updateAverageRating();
        });

        static::deleted(function ($rating) {
            $rating->anime->updateAverageRating();
        });
    }
}
