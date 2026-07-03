<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class PaymentsExport
{
    public function headings(): array
    {
        return ['Período', 'Total Ingresos (BS)', 'Cantidad Pagos'];
    }

    public function rows(Collection $data): array
    {
        return $data->map(fn($item) => [
            $item->period,
            number_format($item->total_amount / 100, 2),
            $item->total_count,
        ])->toArray();
    }
}
