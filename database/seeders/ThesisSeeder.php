<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Thesis;
use App\Models\ThesisFile;
use App\Models\User;
use Illuminate\Database\Seeder;

class ThesisSeeder extends Seeder
{
    public function run(): void
    {
        $estudiante = User::where('user_type', 'estudiante')->first();
        $category = Category::where('name', 'Tesis de Grado')->first();
        $docentes = User::where('user_type', 'docente')->get();
        $careers = \App\Models\Career::pluck('id', 'name');

        $theses = [
            [
                'title' => 'Avances y discusiones sobre el uso de inteligencia artificial (IA) en educación',
                'abstract' => 'La inteligencia artificial está transformando los procesos educativos a nivel global. Este estudio explora los avances recientes en IA aplicada a la educación, analizando tanto las oportunidades como los desafíos éticos y pedagógicos que surgen de su implementación en el aula. Se examinan casos de uso como sistemas de tutoría inteligente, evaluación automatizada y personalización del aprendizaje.',
                'tutor' => 'Blanco Pacheco Offman',
                'tutor_id' => $docentes->firstWhere('full_name', 'Blanco Pacheco Offman')?->id,
                'student_id' => 'estudiante@test.com',
                'file' => 'thesis_1.txt',
            ],
            [
                'title' => 'Aplicaciones de inteligencia artificial (IA) en el contexto educativo ecuatoriano: retos y desafíos',
                'abstract' => 'Esta investigación analiza la implementación de tecnologías de inteligencia artificial en el sistema educativo de Ecuador. Se identifican las principales barreras tecnológicas, de infraestructura y de formación docente que limitan la adopción de IA, así como las oportunidades para mejorar la calidad educativa mediante herramientas inteligentes adaptadas al contexto local.',
                'tutor' => 'Rodriguez Martinez Oscar',
                'tutor_id' => $docentes->firstWhere('full_name', 'Rodriguez Martinez Oscar')?->id,
                'student_id' => 'estudiante@test.com',
                'file' => 'thesis_2.txt',
            ],
            [
                'title' => 'Rendimiento académico y contexto familiar en estudiantes universitarios',
                'abstract' => 'El presente trabajo examina la relación entre el contexto familiar y el rendimiento académico de estudiantes universitarios. A través de un estudio mixto con encuestas y análisis de calificaciones, se identifican factores como el nivel educativo de los padres, el ingreso familiar y el apoyo emocional como determinantes significativos del desempeño académico. Los resultados sugieren la necesidad de políticas institucionales que consideren el entorno familiar.',
                'tutor' => 'Aoiz Carballo Elio',
                'tutor_id' => $docentes->firstWhere('full_name', 'Aoiz Carballo Elio')?->id,
                'student_id' => 'estudiante@test.com',
                'file' => 'thesis_3.txt',
            ],
            [
                'title' => 'Sistema de Gestión de Tesis Universitarias',
                'abstract' => 'Este proyecto presenta el desarrollo de un sistema web para la gestión digital de tesis universitarias, permitiendo el seguimiento, revisión y archivo de documentos académicos.',
                'tutor' => 'Jimenez Languidey Guillermo',
                'tutor_id' => $docentes->firstWhere('full_name', 'Jimenez Languidey Guillermo')?->id,
                'student_id' => 'estudiante@test.com',
                'file' => 'thesis_4.txt',
            ],
        ];

        foreach ($theses as $data) {
            $career = $data['tutor_id'] ? User::find($data['tutor_id'])?->career_id : null;
            $student = User::where('email', $data['student_id'])->first();

            $file = $data['file'];
            unset($data['file'], $data['student_id']);

            $thesis = Thesis::create([
                'title' => $data['title'],
                'abstract' => $data['abstract'],
                'tutor' => $data['tutor'],
                'tutor_id' => $data['tutor_id'],
                'user_id' => $student?->id ?? 1,
                'category_id' => $category->id,
                'career_id' => $career,
                'status' => 'publicado',
                'featured' => true,
                'published_at' => now()->subDays(rand(1, 60)),
                'type' => 'Tesis de Grado',
                'repo_url' => 'https://github.com/ejemplo/' . strtolower(str_replace(' ', '-', explode('(', $data['title'])[0])),
                'demo_url' => null,
            ]);

            ThesisFile::create([
                'thesis_id' => $thesis->id,
                'file_path' => 'thesis_files/' . $file,
                'is_primary' => true,
            ]);
        }
    }
}