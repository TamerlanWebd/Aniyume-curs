<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anime_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('anime_id')->constrained('anime')->onDelete('cascade');
            $table->enum('status', ['watching', 'completed', 'planned', 'dropped', 'on_hold']);
            $table->integer('episodes_watched')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'anime_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anime_user');
    }
};
