<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleTag extends Model
{

    protected $guarded = ['id'];

    protected $casts = [
        'examples' => 'array',
    ];
}
