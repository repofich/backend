<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('theses', function (Blueprint $table) {
            $table->string('tutor_status')->nullable()->after('tutor_id');
        });

        DB::table('theses')
            ->whereNotNull('tutor_id')
            ->update(['tutor_status' => 'accepted']);
    }

    public function down(): void
    {
        Schema::table('theses', function (Blueprint $table) {
            $table->dropColumn('tutor_status');
        });
    }
};
