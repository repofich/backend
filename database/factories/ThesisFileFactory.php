<?php

namespace Database\Factories;

use App\Models\Thesis;
use Illuminate\Database\Eloquent\Factories\Factory;

class ThesisFileFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'thesis_id' => Thesis::factory(),
            'file_path' => fake()->word(),
            'is_primary' => fake()->boolean(),
        ];
    }
}
