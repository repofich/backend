<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('thesis_tags', function (Blueprint $table) {
            if (!Schema::hasColumn('thesis_tags', 'thesis_id')) {
                $table->foreignId('thesis_id')->constrained('theses')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('thesis_tags', function (Blueprint $table) {
            if (Schema::hasColumn('thesis_tags', 'thesis_id')) {
                $table->dropForeign(['thesis_id']);
                $table->dropColumn('thesis_id');
            }
        });
    }
};
