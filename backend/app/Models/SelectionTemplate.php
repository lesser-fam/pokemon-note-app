<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SelectionTemplate extends Model
{
    protected $guarded = ['id'];

    public function partyVersion()
    {
        return $this->belongsTo(PartyVersion::class);
    }

    public function leadPokemon()
    {
        return $this->belongsTo(PartyPokemon::class, 'lead_pokemon_id');
    }

    public function switchPokemon()
    {
        return $this->belongsTo(PartyPokemon::class, 'switch_pokemon_id');
    }

    public function finisherPokemon()
    {
        return $this->belongsTo(PartyPokemon::class, 'finisher_pokemon_id');
    }
}
