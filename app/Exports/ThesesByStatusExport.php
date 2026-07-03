<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class ThesesByStatusExport
{
    public function headings(): array
    {
        return ['Estado', 'Total Tesis'];
    }

    public function rows(Collection $data): array
    {
        return $data->map(fn($item) => [
            $item->status,
            $item->total,
        ])->toArray();
    }
}
