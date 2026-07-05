<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class ThesisOverviewExport
{
    public function headings(): array
    {
        return ['Métrica', 'Valor'];
    }

    public function rows(Collection $data): array
    {
        return [
            ['Total Tesis', $data['total_theses']],
            ['Tesis Publicadas', $data['published_theses']],
            ['Tasa de Publicación', $data['publication_rate']],
            ['Archivos Subidos', $data['total_files']],
            ['Usuarios Registrados', $data['total_users']],
            ['Docentes', $data['total_docentes']],
            ['Estudiantes', $data['total_estudiantes']],
            ['Evaluaciones Realizadas', $data['total_evaluations']],
            ['Total Visitas', $data['total_visits']],
        ];
    }
}
