<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpponentPartyTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'memo' => $this->memo,

            'pokemon' => $this->whenLoaded('pokemon', function () {
                return $this->pokemon
                    ->map(function ($pokemon) {
                        return [
                            'id' => $pokemon->id,
                            'pokemon_key' => $pokemon->pokemon_key,
                            'form_key' => $pokemon->form_key,
                            'display_order' => $pokemon->display_order,
                        ];
                    })
                    ->values();
            }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
