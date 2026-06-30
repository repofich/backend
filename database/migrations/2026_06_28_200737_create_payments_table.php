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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_payment_method_id')->nullable();
            $table->integer('amount')->comment('en centavos');
            $table->string('currency', 3)->default('bob');
            $table->string('concept')->nullable();
            $table->string('payment_type'); // contado, credito
            $table->tinyInteger('installment_number')->nullable();
            $table->tinyInteger('total_installments')->default(1);
            $table->string('status')->default('pending'); // pending, succeeded, failed, refunded
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('parent_payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
