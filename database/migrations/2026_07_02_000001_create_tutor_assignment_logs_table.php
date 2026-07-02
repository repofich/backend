<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutor_assignment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thesis_id')->constrained()->cascadeOnDelete();
            $table->foreignId('previous_tutor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('new_tutor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->foreignId('changed_by')->constrained('users');
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_assignment_logs');
    }
};
