<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoleTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleTagController extends Controller
{
    public function index():JsonResponse
    {
        return response()->json([
            'data'=>RoleTag::orderBy('id')->get(),
        ]);
    }
}
