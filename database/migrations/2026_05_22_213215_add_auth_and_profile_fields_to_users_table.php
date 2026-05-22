<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('ci', 20)->unique()->nullable()->after('id');
            $table->string('registration_number', 50)->nullable()->after('ci');
            $table->timestamp('email_verified_at')->nullable()->after('registration_number');
            $table->rememberToken()->after('email_verified_at');
            $table->string('photo_path')->nullable()->after('user_type');
            $table->string('curriculum_pdf_path')->nullable()->after('photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ci', 'registration_number', 'email_verified_at', 'remember_token', 'photo_path', 'curriculum_pdf_path']);
        });
    }
};
