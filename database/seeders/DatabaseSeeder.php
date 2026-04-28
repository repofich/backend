<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CareerSeeder::class,
            CategorySeeder::class,
        ]);

        $career = \App\Models\Career::first();

        \App\Models\User::create([
            'full_name' => 'Administrador',
            'email' => 'admin@admin.com',
            'password' => bcrypt('admin'),
            'career_id' => $career->id,
            'user_type' => 'admin',
        ]);

        $this->call([
            ThesisSeeder::class,
        ]);
    }
}
