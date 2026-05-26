<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Party extends Model
{
    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function versions()
    {
        return $this->hasMany(PartyVersion::class);
    }

    public function currentVersion()
    {
        return $this->hasOne(PartyVersion::class)->where('is_current', true);
    }
}
