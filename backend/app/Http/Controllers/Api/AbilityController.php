<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ability;
use App\Support\KanaSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $limit = min(
            max((int) $request->query('limit', 50), 1),
            100,
        );

        $query = Ability::query()
            ->orderBy('name');

        if ($search === '') {
            $abilities = $query
                ->limit($limit)
                ->get([
                    'id',
                    'key',
                    'name',
                ]);
        } else {
            $abilities = $query
                ->get([
                    'id',
                    'key',
                    'name',
                ])
                ->filter(
                    fn ($ability): bool =>
                    KanaSearch::matches($ability->name, $search)
                    || KanaSearch::matches($ability->key, $search),
                )
                ->take($limit)
                ->values();
        }

        return response()->json([
            'data' => $abilities,
        ]);
    }
}
