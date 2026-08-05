<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dental_chair_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinician_id')
                ->constrained('clinicians', 'user_id')
                ->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->foreignId('assistant_id')
                ->nullable()
                ->constrained('clinicians', 'user_id')
                ->nullOnDelete();
            $table->string('shift');
            $table->date('date');
            $table->string('status');
            $table->integer('chair_number');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dental_chair_requests');
    }
};
