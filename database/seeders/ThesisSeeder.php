<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Thesis;
use App\Models\ThesisFile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ThesisSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('user_type', 'admin')->first();
        $category = Category::where('name', 'Tesis de Grado')->first();

        $theses = [
            [
                'title' => 'Sistema de Gestión de Tesis Universitarias',
                'abstract' => 'Este proyecto presenta el desarrollo de un sistema web para la gestión digital de tesis universitarias, permitiendo el seguimiento, revisión y archivo de documentos académicos.',
                'tutor' => 'Dr. Juan Pérez García',
                'repo_url' => 'https://github.com/usuario/sistema-tesis',
                'demo_url' => 'https://sistema-tesis.demo.edu',
                'user_id' => $admin->id,
                'category_id' => $category->id,
                'file' => 'thesis_1.txt',
            ],
            [
                'title' => 'Aplicación Móvil para Seguimiento de Egresados',
                'abstract' => 'Desarrollo de una aplicación móvil que permite a la universidad mantener un registro actualizado de sus egresados, facilitando la bolsa de trabajo y seguimiento profesional.',
                'tutor' => 'Dra. María López Martínez',
                'repo_url' => 'https://github.com/usuario/app-egresados',
                'demo_url' => null,
                'user_id' => $admin->id,
                'category_id' => $category->id,
                'file' => 'thesis_2.txt',
            ],
            [
                'title' => 'Inteligencia Artificial en la Detección de Plagio',
                'abstract' => 'Investigación sobre el uso de técnicas de inteligencia artificial y procesamiento de lenguaje natural para la detección automática de plagio en trabajos académicos.',
                'tutor' => 'Ing. Carlos Rodríguez Silva',
                'repo_url' => null,
                'demo_url' => 'https://ia-plagio.demo.edu',
                'user_id' => $admin->id,
                'category_id' => $category->id,
                'file' => 'thesis_3.txt',
            ],
        ];

        foreach ($theses as $thesisData) {
            $file = $thesisData['file'];
            unset($thesisData['file']);

            $thesis = Thesis::create($thesisData);

            ThesisFile::create([
                'thesis_id' => $thesis->id,
                'file_path' => 'thesis_files/' . $file,
                'is_primary' => true,
            ]);
        }
    }
}
