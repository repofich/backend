<?php

namespace Database\Factories;

use App\Models\Career;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ThesisFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'abstract' => fake()->paragraph(),
            'tutor' => fake()->name(),
            'repo_url' => fake()->url(),
            'demo_url' => fake()->url(),
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'featured' => false,
            'type' => fake()->randomElement(['Tesis de Grado', 'Proyecto de Grado', 'Trabajo Dirigido']),
            'status' => 'borrador',
            'tutor_id' => null,
            'tutor_status' => null,
            'career_id' => null,
            'assigned_evaluator_id' => null,
            'published_at' => null,
            'observations' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn() => [
            'status' => 'publicado',
            'published_at' => now(),
        ]);
    }

    public function withTutor(): static
    {
        return $this->state(fn() => [
            'tutor_id' => User::factory(['user_type' => 'docente']),
            'tutor' => fake()->name(),
            'tutor_status' => 'accepted',
        ]);
    }
}
