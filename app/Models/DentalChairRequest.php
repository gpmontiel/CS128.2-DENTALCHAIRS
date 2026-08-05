<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DentalChairRequest extends Model
{
    protected $fillable = [
        'clinician_id',
        'section_id',
        'assistant_id',
        'shift',
        'date',
        'status',
        'chair_number'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(Clinician::class, 'clinician_id', 'user_id');
    }

    public function assistant(): BelongsTo
    {
        return $this->belongsTo(Clinician::class, 'assistant_id', 'user_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
