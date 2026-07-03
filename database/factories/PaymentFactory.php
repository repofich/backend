<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => fake()->numberBetween(1000, 50000),
            'currency' => 'bob',
            'payment_type' => 'contado',
            'total_installments' => 1,
            'status' => 'pending',
        ];
    }
}
