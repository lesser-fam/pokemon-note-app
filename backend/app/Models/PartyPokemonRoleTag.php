<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartyPokemonRoleTag extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'item_id' => 'integer',
            'ability_id' => 'integer',
            'nature_id' => 'integer',

            'move_1_id' => 'integer',
            'move_2_id' => 'integer',
            'move_3_id' => 'integer',
            'move_4_id' => 'integer',

            'ev_h' => 'integer',
            'ev_a' => 'integer',
            'ev_b' => 'integer',
            'ev_c' => 'integer',
            'ev_d' => 'integer',
            'ev_s' => 'integer',
        ];
    }
}
