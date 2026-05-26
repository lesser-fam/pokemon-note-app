<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartyPokemon extends Model
{
    protected $table = 'party_pokemon';

    protected $guarded = ['id'];

    public function partyVersion()
    {
        return $this->belongsTo(PartyVersion::class);
    }

    public function roleTags()
    {
        return $this->belongsToMany(
            RoleTag::class,
            'party_pokemon_role_tags'
        )->withTimestamps();
    }
}
