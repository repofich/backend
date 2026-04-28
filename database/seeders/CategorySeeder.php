<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::create(['name' => 'Tesis de Grado']);
        Category::create(['name' => 'Tesis de Maestría']);
        Category::create(['name' => 'Tesis Doctoral']);
    }
}
