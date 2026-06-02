<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Move;
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

        $moves = Move::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('key', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
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

        return response()->json([
            'data' => $moves,
        ]);
    }
}
