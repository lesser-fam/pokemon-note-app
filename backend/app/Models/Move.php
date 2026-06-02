<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Move extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'power' => 'integer',
            'is_scoring_target' => 'boolean',
        ];
    }

    public function battleRegulations(): BelongsToMany
    {
        return $this->belongsToMany(BattleRegulation::class);
    }
}
