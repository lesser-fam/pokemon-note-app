<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PokemonCsvService;
use Illuminate\Http\JsonResponse;

class PokemonController extends Controller
{
    public function index(PokemonCsvService $pokemonCsvService): JsonResponse
    {
        return response()->json([
            'data' => $pokemonCsvService->all(),
        ]);
    }
}