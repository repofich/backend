<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class ThesesByYearExport
{
    public function headings(): array
    {
        return ['Año', 'Total Tesis'];
    }

    public function rows(Collection $data): array
    {
        return $data->map(fn($item) => [
            (string) $item->year,
            $item->total,
        ])->toArray();
    }
}
