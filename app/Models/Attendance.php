<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'dental_chair_request_id',
        'status',
        'reason',
        'clinician_id',
        'section_id',
        'date',
        'shift',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function dentalChairRequest(): BelongsTo
    {
        return $this->belongsTo(DentalChairRequest::class);
    }

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(Clinician::class, 'clinician_id', 'user_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
