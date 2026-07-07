<?php

use App\Http\Controllers\Api\PokemonController;
use App\Http\Controllers\Api\RoleTagController;
use App\Http\Controllers\Api\AbilityController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\MoveController;
use App\Http\Controllers\Api\NatureController;
use App\Http\Controllers\Api\PokemonAbilityController;
use App\Http\Controllers\Api\PokemonCommonMoveController;
use App\Http\Controllers\Api\OpponentPartyTemplateController;
use Illuminate\Support\Facades\Route;


Route::get('/pokemon', [PokemonController::class, 'index']);
Route::get('/role-tags', [RoleTagController::class, 'index']);

Route::get('/moves', [MoveController::class, 'index']);
Route::get('/pokemon-common-moves', [PokemonCommonMoveController::class, 'index']);

Route::get('/abilities', [AbilityController::class, 'index']);
Route::get('/items', [ItemController::class, 'index']);
Route::get('/natures', [NatureController::class, 'index']);

Route::get('/pokemon-abilities', [PokemonAbilityController::class, 'index']);

Route::get('/opponent-party-templates', [OpponentPartyTemplateController::class, 'index']);
