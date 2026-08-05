<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    protected $fillable = ['room_id', 'section_name', 'chair_count'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function chairManagerAssignments(): HasMany
    {
        return $this->hasMany(ChairManagerAssignment::class);
    }

    public function dentalChairRequests(): HasMany
    {
        return $this->hasMany(DentalChairRequest::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
