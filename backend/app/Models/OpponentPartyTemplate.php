<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OpponentPartyTemplate extends Model
{
    protected $guarded = ['id'];

    public function pokemon(): HasMany
    {
        return $this
            ->hasMany(OpponentPartyTemplatePokemon::class)
            ->orderBy('display_order');
    }
}
