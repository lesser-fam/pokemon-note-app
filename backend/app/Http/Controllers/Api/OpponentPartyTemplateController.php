<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOpponentPartyTemplateRequest;
use App\Http\Resources\OpponentPartyTemplateResource;
use App\Models\OpponentPartyTemplate;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OpponentPartyTemplateController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $templates = OpponentPartyTemplate::query()
            ->with('pokemon')
            ->latest('id')
            ->get();

        return OpponentPartyTemplateResource::collection($templates);
    }

    public function store(
        StoreOpponentPartyTemplateRequest $request,
    ): OpponentPartyTemplateResource {
        $validated = $request->validated();

        $template = DB::transaction(function () use ($validated) {
            $template = OpponentPartyTemplate::create([
                'memo' => $validated['memo'] ?? null,
            ]);

            foreach ($validated['pokemon'] as $index => $pokemon) {
                $template->pokemon()->create([
                    'pokemon_key' => $pokemon['pokemon_key'],
                    'form_key' => $pokemon['form_key'],
                    'display_order' => $index + 1,
                ]);
            }

            return $template;
        });

        return new OpponentPartyTemplateResource(
            $template->load('pokemon'),
        );
    }

    public function destroy(
        OpponentPartyTemplate $opponentPartyTemplate,
    ): Response {
        $opponentPartyTemplate->delete();

        return response()->noContent();
    }
}
