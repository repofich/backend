<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('theses', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();
        });

        Schema::table('thesis_files', function (Blueprint $table) {
            $table->foreign('thesis_id')->references('id')->on('theses')->cascadeOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('career_id')->references('id')->on('careers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('theses', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['category_id']);
        });

        Schema::table('thesis_files', function (Blueprint $table) {
            $table->dropForeign(['thesis_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['career_id']);
        });
    }
};
