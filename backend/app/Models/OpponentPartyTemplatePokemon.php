<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpponentPartyTemplatePokemon extends Model
{
    protected $table = 'opponent_party_template_pokemon';

    protected $guarded = ['id'];

    public function template(): BelongsTo
    {
        return $this->belongsTo(
            OpponentPartyTemplate::class,
            'opponent_party_template_id',
        );
    }
}
