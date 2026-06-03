<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Override;

class PartyPokemon extends Model
{
    protected $table = 'party_pokemon';

    protected $guarded = ['id'];

    #[Override]
    protected function casts(): array
    {
        return [
            'item_id'       => 'integer',
            'ability_id'    => 'integer',
            'nature_id'     => 'integer',

            'move_1_id'     => 'integer',
            'move_2_id'     => 'integer',
            'move_3_id'     => 'integer',
            'move_4_id'     => 'integer',

            'ev_h'          => 'integer',
            'ev_a'          => 'integer',
            'ev_b'          => 'integer',
            'ev_c'          => 'integer',
            'ev_d'          => 'integer',
            'ev_s'          => 'integer',

        ];
    }

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

    public function itemMaster(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    public function abilityMaster(): BelongsTo
    {
        return $this->belongsTo(Ability::class, 'ability_id');
    }

    public function natureMaster(): BelongsTo
    {
        return $this->belongsTo(Nature::class, 'nature_id');
    }

    public function move1Master(): BelongsTo
    {
        return $this->belongsTo(Move::class, 'move_1_id');
    }

    public function move2Master(): BelongsTo
    {
        return $this->belongsTo(Move::class, 'move_2_id');
    }

    public function move3Master(): BelongsTo
    {
        return $this->belongsTo(Move::class, 'move_3_id');
    }

    public function move4Master(): BelongsTo
    {
        return $this->belongsTo(Move::class, 'move_4_id');
    }
}
