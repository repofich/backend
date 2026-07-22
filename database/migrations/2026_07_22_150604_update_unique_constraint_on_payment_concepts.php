<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_concepts', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->unique(['code', 'career_id']);
        });
    }

    public function down(): void
    {
        Schema::table('payment_concepts', function (Blueprint $table) {
            $table->dropUnique(['code', 'career_id']);
            $table->unique(['code']);
        });
    }
};
