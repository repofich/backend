<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_validations', function (Blueprint $table) {
            $table->id();
            $table->string('ci', 20);
            $table->string('registration_number', 50);
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            $table->unique(['ci', 'registration_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_validations');
    }
};
