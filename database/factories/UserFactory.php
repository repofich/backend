<?php

namespace Database\Factories;

use App\Models\Career;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->word(),
            'email' => fake()->safeEmail(),
            'password' => fake()->password(),
            'career_id' => Career::factory(),
            'user_type' => 'user',
        ];
    }
}
