<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class UsersByRoleExport
{
    public function headings(): array
    {
        return ['Rol', 'Total Usuarios'];
    }

    public function rows(Collection $data): array
    {
        return $data->map(fn($item) => [
            $item->user_type,
            $item->total,
        ])->toArray();
    }
}
