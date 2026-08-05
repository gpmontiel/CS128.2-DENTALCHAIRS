<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clinician extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'student_group_id',
        'student_number',
        'year_level',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function studentGroup(): BelongsTo
    {
        return $this->belongsTo(StudentGroup::class);
    }

    public function chairManagerAssignments(): HasMany
    {
        return $this->hasMany(ChairManagerAssignment::class, 'clinician_id', 'user_id');
    }

    public function dentalChairRequests(): HasMany
    {
        return $this->hasMany(DentalChairRequest::class, 'clinician_id', 'user_id');
    }

    public function assistantRequests(): HasMany
    {
        return $this->hasMany(DentalChairRequest::class, 'assistant_id', 'user_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'clinician_id', 'user_id');
    }
}
