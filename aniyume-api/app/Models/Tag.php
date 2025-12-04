<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'anilist_id',
        'name',
        'description',
        'category',
        'is_adult',
    ];

    protected $casts = [
        'is_adult' => 'boolean',
    ];

    public function anime(): BelongsToMany
    {
        return $this->belongsToMany(Anime::class)
            ->withPivot('rank');
    }
}
