<?php

namespace Database\Factories;

use App\Models\Career;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'ci' => fake()->unique()->numerify('##########'),
            'registration_number' => fake()->unique()->numerify('2024-####'),
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'career_id' => Career::factory(),
            'user_type' => 'estudiante',
        ];
    }
}
