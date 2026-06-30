<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Move;
use App\Support\KanaSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MoveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $limit = min(
            max((int) $request->query('limit', 50), 1),
            100,
        );

        $query = Move::query()
            ->orderBy('name');

        if ($search === '') {
            $moves = $query
                ->limit($limit)
                ->get([
                    'id',
                    'key',
                    'name',
                    'type',
                    'damage_class',
                    'power',
                    'is_scoring_target',
                ]);
        } else {
            $moves = $query
                ->get([
                    'id',
                    'key',
                    'name',
                    'type',
                    'damage_class',
                    'power',
                    'is_scoring_target',
                ])
                ->filter(
                    fn ($move): bool =>
                    KanaSearch::matches($move->name, $search)
                    || KanaSearch::matches($move->key, $search),
                )
                ->take($limit)
                ->values();
        }

        return response()->json([
            'data' => $moves,
        ]);
    }
}
