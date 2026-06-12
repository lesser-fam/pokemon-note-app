<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BattleLogController;
use App\Http\Controllers\Api\PartyController;
use App\Http\Controllers\Api\PartyPokemonController;
use App\Http\Controllers\Api\PartyVersionController;
use App\Http\Controllers\Api\SelectionTemplateController;
use Illuminate\Support\Facades\Route;

Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/api/logout', [AuthController::class, 'logout']);
    Route::get('/api/user', [AuthController::class, 'me']);

    Route::get('/api/parties', [PartyController::class, 'index']);
    Route::post('/api/parties', [PartyController::class, 'store']);
    Route::get('/api/parties/{party}', [PartyController::class, 'show']);
    Route::put('/api/parties/{party}', [PartyController::class, 'update']);
    Route::delete('/api/parties/{party}', [PartyController::class, 'destroy']);

    Route::post('/api/party-versions/{partyVersion}/pokemon', [PartyPokemonController::class, 'store']);
    Route::delete('/api/party-pokemon/{partyPokemon}', [PartyPokemonController::class, 'destroy']);

    Route::post('/api/party-versions/{partyVersion}/new-version', [PartyVersionController::class, 'storeNewVersion']);

    Route::post('/api/party-versions/{partyVersion}/selection-templates', [SelectionTemplateController::class, 'store']);
    Route::put('/api/selection-templates/{selectionTemplate}', [SelectionTemplateController::class, 'update']);
    Route::delete('/api/selection-templates/{selectionTemplate}', [SelectionTemplateController::class, 'destroy']);

    Route::post('/api/party-versions/{partyVersion}/battle-logs', [BattleLogController::class, 'store']);
    Route::delete('/api/battle-logs/{battleLog}', [BattleLogController::class, 'destroy']);
});
