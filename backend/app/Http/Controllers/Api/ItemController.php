<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Support\KanaSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $limit = min(
            max((int) $request->query('limit', 50), 1),
            100,
        );

        $query = Item::query()
            ->orderBy('name');

        if ($search === '') {
            $items = $query
                ->limit($limit)
                ->get([
                    'id',
                    'key',
                    'name',
                    'description',
                ]);
        } else {
            $items = $query
                ->get([
                    'id',
                    'key',
                    'name',
                    'description',
                ])
                ->filter(
                    fn ($item): bool =>
                    KanaSearch::matches($item->name, $search)
                    || KanaSearch::matches($item->key, $search),
                )
                ->take($limit)
                ->values();
        }

        return response()->json([
            'data' => $items,
        ]);
    }
}
