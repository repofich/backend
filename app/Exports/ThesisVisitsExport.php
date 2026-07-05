<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class ThesisVisitsExport
{
    public function headings(): array
    {
        return ['Título', 'ID Tesis', 'Visitas', 'Última Visita'];
    }

    public function rows(Collection $data): array
    {
        return $data->map(fn($item) => [
            $item->title,
            $item->thesis_id,
            $item->visits,
            $item->last_visited_at?->format('Y-m-d H:i:s'),
        ])->toArray();
    }
}
