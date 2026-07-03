<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class ThesesByCareerExport
{
    public function headings(): array
    {
        return ['Categoría', 'Total Tesis'];
    }

    public function rows(Collection $data): array
    {
        return $data->map(fn($item) => [
            $item->name,
            $item->theses_count,
        ])->toArray();
    }
}
