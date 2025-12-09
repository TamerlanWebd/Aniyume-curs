<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AnimeController;
use App\Http\Controllers\Api\AnimeStreamsController;
use App\Http\Controllers\Api\UserAnimeController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RatingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('firebase-login', [AuthController::class, 'firebaseLogin']);
        
        Route::middleware('auth:api')->group(function () {
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Anime Routes (Public)
    Route::prefix('anime')->group(function () {
        Route::get('/', [AnimeController::class, 'index']);
        Route::get('/{id}', [AnimeController::class, 'show']);
        Route::get('/streams', [AnimeStreamsController::class, 'getStreams']);
        Route::get('/stream/episode', [AnimeStreamsController::class, 'getEpisodeStream']);
        
        // Admin Routes (Protected)
        Route::middleware(['auth:api', 'role:admin'])->group(function () { // Assuming 'role' middleware exists or check in controller
             // For now, using auth:api and we can add admin check in controller or custom middleware
             // But user asked for routes configuration.
             // I'll use a closure or just auth:api for now, assuming AuthController checks admin or middleware does.
             // The user instructions mentioned "admin only" for these.
             // I'll wrap them in a group but since I don't have a registered 'role' middleware yet (unless I create it), 
             // I will just use auth:api and rely on Controller checks or add a simple check.
             // Actually, I'll add a simple middleware or just leave it as auth:api and assume the user will add the role middleware.
             // Wait, I saw 'role:admin' in the original routes file! So it might exist.
             // I'll check if 'role' is registered in Kernel.
             // For safety, I'll use 'auth:api' and maybe a custom 'admin' middleware if I find one.
             // The original file had `Route::middleware('role:admin')`. So I will use it.
        });
    });
    
    // Admin Anime Routes (Explicitly outside the public group to avoid conflicts or just inside with middleware)
    Route::middleware(['auth:api', 'role:admin'])->prefix('anime')->group(function () {
        Route::post('/', [AnimeController::class, 'store']);
        Route::put('/{id}', [AnimeController::class, 'update']);
        Route::delete('/{id}', [AnimeController::class, 'destroy']);
        Route::post('/{id}/poster', [AnimeController::class, 'uploadPoster']);
        Route::post('/{id}/banner', [AnimeController::class, 'uploadBanner']);
        Route::post('/{id}/player', [AnimeController::class, 'updatePlayer']);
    });

    // User Anime Routes (Protected)
    Route::middleware('auth:api')->prefix('user/anime')->group(function () {
        Route::get('/favorites', [UserAnimeController::class, 'getFavorites']);
        Route::post('/favorites/{animeId}', [UserAnimeController::class, 'addToFavorites']);
        Route::delete('/favorites/{animeId}', [UserAnimeController::class, 'removeFromFavorites']);

        Route::get('/watchlist', [UserAnimeController::class, 'getWatchlist']);
        Route::post('/watchlist/{animeId}', [UserAnimeController::class, 'addToWatchlist']);
        Route::put('/watchlist/{animeId}', [UserAnimeController::class, 'updateWatchlist']);
        Route::delete('/watchlist/{animeId}', [UserAnimeController::class, 'removeFromWatchlist']);
    });

    // Reviews Routes (Protected)
    Route::middleware('auth:api')->prefix('reviews')->group(function () {
        Route::post('/', [ReviewController::class, 'store']);
        Route::put('/{id}', [ReviewController::class, 'update']);
        Route::delete('/{id}', [ReviewController::class, 'destroy']);
    });

    // Ratings Routes (Protected)
    Route::middleware('auth:api')->prefix('ratings')->group(function () {
        Route::post('/', [RatingController::class, 'store']);
        Route::delete('/{animeId}', [RatingController::class, 'destroy']);
    });

});