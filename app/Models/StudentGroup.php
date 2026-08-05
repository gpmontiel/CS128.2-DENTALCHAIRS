<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentGroup extends Model
{
    protected $fillable = ['group_name'];

    public function clinicians(): HasMany
    {
        return $this->hasMany(Clinician::class);
    }
}
