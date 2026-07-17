<?php

namespace Database\Seeders;

use App\Models\Career;
use Illuminate\Database\Seeder;

class CareerSeeder extends Seeder
{
    public function run(): void
    {
        $careers = [
            [
                'name' => 'Administración de Empresas',
                'knowledge_areas' => ['Gestión Empresarial', 'Recursos Humanos', 'Marketing', 'Finanzas Corporativas', 'Emprendimiento'],
            ],
            [
                'name' => 'Ciencias de la Educación',
                'knowledge_areas' => ['Pedagogía', 'Didáctica', 'Psicopedagogía', 'Tecnología Educativa', 'Currículum'],
            ],
            [
                'name' => 'Contaduría Pública',
                'knowledge_areas' => ['Contabilidad', 'Auditoría', 'Tributación', 'Costos', 'Finanzas'],
            ],
            [
                'name' => 'Derecho',
                'knowledge_areas' => ['Derecho Civil', 'Derecho Penal', 'Derecho Laboral', 'Derecho Constitucional', 'Derecho Empresarial'],
            ],
            [
                'name' => 'Enfermería',
                'knowledge_areas' => ['Cuidados Críticos', 'Salud Pública', 'Enfermería Clínica', 'Farmacología', 'Bioética'],
            ],
            [
                'name' => 'Ingeniería Industrial',
                'knowledge_areas' => ['Gestión de Operaciones', 'Logística', 'Calidad', 'Seguridad Industrial', 'Productividad'],
            ],
            [
                'name' => 'Ingeniería Informática',
                'knowledge_areas' => ['Desarrollo de Software', 'Redes', 'Bases de Datos', 'Inteligencia Artificial', 'Seguridad Informática'],
            ],
            [
                'name' => 'Ingeniería del Petróleo y Gas Natural',
                'knowledge_areas' => ['Perforación', 'Yacimientos', 'Refinación', 'Gas Natural', 'Petroquímica'],
            ],
            [
                'name' => 'Ingeniería en Agropecuaria',
                'knowledge_areas' => ['Producción Agrícola', 'Producción Pecuaria', 'Suelos', 'Riego', 'Agroindustria'],
            ],
            [
                'name' => 'Ingeniería en Sistemas',
                'knowledge_areas' => ['Ingeniería de Software', 'Sistemas de Información', 'Redes', 'Arquitectura de Computadoras', 'Gestión de TI'],
            ],
            [
                'name' => 'Monitoreo Socioambiental',
                'knowledge_areas' => ['Impacto Ambiental', 'SIG', 'Gestión Social', 'Indicadores Ambientales', 'Evaluación Ambiental'],
            ],
            [
                'name' => 'Odontología',
                'knowledge_areas' => ['Odontología General', 'Ortodoncia', 'Periodoncia', 'Cirugía Oral', 'Endodoncia'],
            ],
        ];

        foreach ($careers as $data) {
            Career::create([
                'name' => $data['name'],
                'knowledge_areas' => $data['knowledge_areas'],
                'director_id' => null,
                'format_config' => null,
            ]);
        }
    }
}
