<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartyVersion extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'is_current' => 'boolean',
    ];

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function pokemon()
    {
        return $this->hasMany(PartyPokemon::class);
    }

    public function selectionTemplates()
    {
        return $this->hasMany(SelectionTemplate::class);
    }
}
