<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PartyController;
use App\Http\Controllers\Api\PartyPokemonController;
use App\Http\Controllers\Api\SelectionTemplateController;
use Illuminate\Support\Facades\Route;

Route::post('/api/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/api/logout', [AuthController::class, 'logout']);
    Route::get('/api/user', [AuthController::class, 'me']);

    Route::get('/api/parties', [PartyController::class, 'index']);
    Route::post('/api/parties', [PartyController::class, 'store']);
    Route::get('/api/parties/{party}', [PartyController::class, 'show']);

    Route::post('/api/party-versions/{partyVersion}/pokemon', [PartyPokemonController::class, 'store']);

    Route::post('/api/party-versions/{partyVersion}/selection-templates', [SelectionTemplateController::class, 'store']);
});
