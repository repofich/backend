<?php

namespace Database\Seeders;

use App\Models\Career;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            CareerSeeder::class,
            CategorySeeder::class,
            PaymentConceptSeeder::class,
            /* DocenteSeeder::class, */
        ]);

        $career = Career::first();

        User::create([
            'full_name' => 'Melissa Shanner Nuñez Ardaya',
            'email' => 'admin@admin.com',
            'password' => bcrypt('admin'),
            'career_id' => $career->id,
            'user_type' => 'admin',
        ]);

        User::create([
            'full_name' => 'Vicedecano',
            'email' => 'vicedecano@test.com',
            'password' => bcrypt('contra123'),
            'career_id' => $career->id,
            'user_type' => 'vicedecano',
        ]);

        User::create([
            'full_name' => 'Director',
            'email' => 'director@test.com',
            'password' => bcrypt('contra123'),
            'career_id' => $career->id,
            'user_type' => 'director',
        ]);

        User::create([
            'ci' => '12345678',
            'registration_number' => '2024-0001',
            'full_name' => 'Estudiante',
            'email' => 'estudiante@test.com',
            'password' => bcrypt('contra123'),
            'career_id' => $career->id,
            'user_type' => 'estudiante',
        ]);

        $this->call([
            ThesisSeeder::class,
        ]);
    }
}
