<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PartyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/api/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/api/logout', [AuthController::class, 'logout']);
    Route::get('/api/user', [AuthController::class, 'me']);

    Route::get('/api/parties', [PartyController::class, 'index']);
    Route::post('/api/parties', [PartyController::class, 'store']);
    Route::get('/api/parties/{party}', [PartyController::class, 'show']);
});
