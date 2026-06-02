<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NatureController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $limit = min(
            max((int) $request->query('limit', 50), 1),
            100,
        );

        $natures = Nature::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('key', 'like', "%{$search}%");
                });
            })
            ->orderBy('id')
            ->limit($limit)
            ->get([
                'id',
                'key',
                'name',
                'increased_stat',
                'decreased_stat',
            ]);

        return response()->json([
            'data' => $natures,
        ]);
    }
}
