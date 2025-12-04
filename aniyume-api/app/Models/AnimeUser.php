<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class AnimeUser extends Pivot
{
    protected $table = 'anime_user';

    protected $fillable = [
        'user_id',
        'anime_id',
        'status',
        'episodes_watched',
    ];

    public $timestamps = true;
}
