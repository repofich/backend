<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('thesis_files', function (Blueprint $table) {
            $table->boolean('is_primary')->default(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('thesis_files', function (Blueprint $table) {
            $table->boolean('is_primary')->default(null)->change();
        });
    }
};
