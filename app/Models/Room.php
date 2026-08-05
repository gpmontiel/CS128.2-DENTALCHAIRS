<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = ['room_name', 'section_name', 'chair_count'];

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }
}
