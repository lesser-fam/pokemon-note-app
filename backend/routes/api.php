<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PokemonController;
use App\Http\Controllers\Api\RoleTagController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::post('/login', [AuthController::class, 'login'])->middleware('web');

// Route::middleware(['auth:sanctum'])->group(function () {
//     Route::post('/logout', [AuthController::class, 'logout'])->middleware('web');
//     Route::get('/user', [AuthController::class, 'me']);
// });

Route::get('/pokemon', [PokemonController::class,'index']);
Route::get('/role-tags', [RoleTagController::class, 'index']);