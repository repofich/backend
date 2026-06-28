<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('theses', 'assigned_evaluator_id')) {
            Schema::table('theses', function (Blueprint $table) {
                $table->foreignId('assigned_evaluator_id')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete()
                    ->after('tutor_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('theses', function (Blueprint $table) {
            $table->dropForeign(['assigned_evaluator_id']);
            $table->dropColumn('assigned_evaluator_id');
        });
    }
};
