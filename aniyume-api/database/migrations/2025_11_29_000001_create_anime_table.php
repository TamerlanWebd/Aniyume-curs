<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anime', function (Blueprint $table) {
            $table->id();
            
            // Main Info
            $table->string('title')->index(); // FullText candidate
            $table->string('title_english')->nullable()->index(); // FullText candidate
            $table->string('title_japanese')->nullable();
            $table->text('description')->nullable(); // FullText candidate

            // Media
            $table->string('poster_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('trailer_url')->nullable();

            // Player
            $table->enum('video_source', ['external', 'local'])->default('external');
            $table->string('player_url')->nullable();
            $table->json('episodes_data')->nullable(); // JSON with episode details

            // Metadata
            $table->integer('episodes')->nullable();
            $table->string('status')->index(); // e.g., 'FINISHED', 'RELEASING'
            $table->string('type')->index(); // e.g., 'TV', 'MOVIE'
            $table->decimal('average_rating', 3, 2)->default(0)->index();
            $table->integer('ratings_count')->default(0);

            // Dates
            $table->date('aired_from')->nullable();
            $table->date('aired_to')->nullable();

            // Additional
            $table->string('studio')->nullable();
            $table->json('genres')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // FullText Search Index (MySQL/PostgreSQL compatible approach)
        // Laravel doesn't support fulltext in blueprint for all drivers easily, so we use raw SQL if needed.
        // But for standard MySQL/MariaDB:
        if (config('database.default') !== 'sqlite') {
             DB::statement('ALTER TABLE anime ADD FULLTEXT fulltext_index (title, title_english, description)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('anime');
    }
};
