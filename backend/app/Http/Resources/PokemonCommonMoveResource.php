<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PokemonCommonMoveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pokemon_key' => $this->pokemon_key,
            'form_key' => $this->form_key,
            'move_id' => $this->move_id,
            'usage_rank' => $this->usage_rank,
            'memo' => $this->memo,
            'move_master' => $this->whenLoaded('move', function () {
                return [
                    'id' => $this->move->id,
                    'key' => $this->move->key,
                    'name' => $this->move->name,
                    'type' => $this->move->type,
                    'damage_class' => $this->move->damage_class,
                    'power' => $this->move->power,
                    'is_scoring_target' => $this->move->is_scoring_target,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
