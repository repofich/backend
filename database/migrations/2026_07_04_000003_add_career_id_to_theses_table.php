<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('theses', function (Blueprint $table) {
            $table->unsignedBigInteger('career_id')->nullable()->after('category_id');
            $table->foreign('career_id')->references('id')->on('careers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('theses', function (Blueprint $table) {
            $table->dropForeign(['career_id']);
            $table->dropColumn('career_id');
        });
    }
};
