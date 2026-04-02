<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ThesisFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'abstract' => fake()->text(),
            'tutor' => fake()->text(),
            'repo_url' => fake()->regexify('[A-Za-z0-9]{nullable}'),
            'demo_url' => fake()->regexify('[A-Za-z0-9]{nullable}'),
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
        ];
    }
}
