<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE theses SET status = 'en_revision' WHERE status = 'revision'");
        DB::statement("UPDATE theses SET status = 'borrador' WHERE status IS NULL");

        Schema::table('theses', function (Blueprint $table) {
            $table->timestamp('published_at')->nullable()->after('status');
            $table->text('observations')->nullable()->after('published_at');
        });

        Schema::table('theses', function (Blueprint $table) {
            $table->string('status', 30)->default('borrador')->change();
        });
    }

    public function down(): void
    {
        DB::statement("UPDATE theses SET status = 'revision' WHERE status = 'en_revision'");

        Schema::table('theses', function (Blueprint $table) {
            $table->dropColumn('observations');
            $table->dropColumn('published_at');
        });

        Schema::table('theses', function (Blueprint $table) {
            $table->string('status', 20)->default('revision')->change();
        });
    }
};
