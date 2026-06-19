<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('thesis_tags', function (Blueprint $table) {
            if (!Schema::hasColumn('thesis_tags', 'tag_id')) {
                $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('thesis_tags', function (Blueprint $table) {
            if (Schema::hasColumn('thesis_tags', 'tag_id')) {
                $table->dropForeign(['tag_id']);
                $table->dropColumn('tag_id');
            }
        });
    }
};
