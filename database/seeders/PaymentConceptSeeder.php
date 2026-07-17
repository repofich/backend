<?php

namespace Database\Seeders;

use App\Models\Career;
use App\Models\PaymentConcept;
use Illuminate\Database\Seeder;

class PaymentConceptSeeder extends Seeder
{
    public function run(): void
    {
        $careers = Career::all();

        if ($careers->isEmpty()) {
            PaymentConcept::create([
                'career_id' => null,
                'name' => 'Defensa de Tesis',
                'code' => 'defensa_tesis',
                'description' => 'Pago por concepto de defensa de tesis de grado',
                'amount' => 50000,
                'is_active' => true,
            ]);
        } else {
            foreach ($careers as $career) {
                PaymentConcept::create([
                    'career_id' => $career->id,
                    'name' => 'Defensa de Tesis - ' . $career->name,
                    'code' => 'defensa_tesis',
                    'description' => 'Pago por concepto de defensa de tesis de grado para ' . $career->name,
                    'amount' => 50000,
                    'is_active' => true,
                ]);
            }
        }
    }
}
