<?php

namespace Database\Seeders;

use App\Models\Career;
use Illuminate\Database\Seeder;

class CareerSeeder extends Seeder
{
    public function run(): void
    {
        Career::create(['name' => 'Ingeniería de Sistemas']);
        Career::create(['name' => 'Ingeniería Civil']);
        Career::create(['name' => 'Ingeniería Industrial']);
    }
}
