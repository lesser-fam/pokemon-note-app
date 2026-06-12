<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BattleLog extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'loss_tags' => 'array',
    ];

    public function partyVersion()
    {
        return $this->belongsTo(PartyVersion::class);
    }

    public function selectedPokemon1()
    {
        return $this->belongsTo(PartyPokemon::class, 'selected_pokemon_1_id');
    }

    public function selectedPokemon2()
    {
        return $this->belongsTo(PartyPokemon::class, 'selected_pokemon_2_id');
    }

    public function selectedPokemon3()
    {
        return $this->belongsTo(PartyPokemon::class, 'selected_pokemon_3_id');
    }

    public function neededPokemon()
    {
        return $this->belongsTo(PartyPokemon::class, 'needed_pokemon_id');
    }
}
