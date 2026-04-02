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
    Schema::create('thesis_tags', function (Blueprint $table) {
        $table->foreignId('thesis_id')->constrained('theses')->cascadeOnDelete();
        $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thesis_tags');
    }
};
