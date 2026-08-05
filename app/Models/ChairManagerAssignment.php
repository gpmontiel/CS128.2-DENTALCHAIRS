<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChairManagerAssignment extends Model
{
    protected $fillable = [
        'clinician_id',
        'section_id',
        'shift',
        'date',
        'status'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(Clinician::class, 'clinician_id', 'user_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
