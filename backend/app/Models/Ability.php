<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ability extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function battleRegulations(): BelongsToMany
    {
        return $this->belongsToMany(BattleRegulation::class);
    }

    public function effectRules(): HasMany
    {
        return $this->hasMany(AbilityEffectRule::class);
    }
}
