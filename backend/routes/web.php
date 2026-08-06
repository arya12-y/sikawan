<?php

use Illuminate\Support\Facades\Route;

// SPA: semua path non-API diarahkan ke index.html (frontend hasil build)
Route::get('/{any}', function () {
    return response()->file(public_path('index.html'));
})->where('any', '.*');
