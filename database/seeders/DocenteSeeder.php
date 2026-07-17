<?php

namespace Database\Seeders;

use App\Models\Career;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocenteSeeder extends Seeder
{
    public function run(): void
    {
        $careers = Career::pluck('id', 'name');

        $docentes = [
            ['full_name' => 'Blanco Pacheco Offman', 'email' => 'offman.blanco@test.com', 'career_name' => 'Administración de Empresas'],
            ['full_name' => 'Rodriguez Martinez Oscar', 'email' => 'oscar.rodriguez@test.com', 'career_name' => 'Administración de Empresas'],
            ['full_name' => 'Aoiz Carballo Elio', 'email' => 'elio.aoiz@test.com', 'career_name' => 'Ciencias de la Educación'],
            ['full_name' => 'Jimenez Languidey Guillermo', 'email' => 'guillermo.jimenez@test.com', 'career_name' => 'Ciencias de la Educación'],
            ['full_name' => 'Vargas Rosado Lazaro', 'email' => 'lazaro.vargas@test.com', 'career_name' => 'Contaduría Pública'],
            ['full_name' => 'Moreno Selaez Oscar', 'email' => 'oscar.moreno@test.com', 'career_name' => 'Contaduría Pública'],
            ['full_name' => 'Contreras Sanchez Omar Henrry', 'email' => 'omar.contreras@test.com', 'career_name' => 'Derecho'],
            ['full_name' => 'Davalos Carballo Henry', 'email' => 'henry.davalos@test.com', 'career_name' => 'Enfermería'],
            ['full_name' => 'Osinaga Cabrera Luis Alberto', 'email' => 'luis.osinaga@test.com', 'career_name' => 'Enfermería'],
            ['full_name' => 'Romero Gallardo Julio Cesar', 'email' => 'julio.romero@test.com', 'career_name' => 'Ingeniería Industrial'],
            ['full_name' => 'Saavedra Arevalo Roberto Eddy', 'email' => 'roberto.saavedra@test.com', 'career_name' => 'Ingeniería Industrial'],
            ['full_name' => 'Flores Verazain Ernesto', 'email' => 'ernesto.flores@test.com', 'career_name' => 'Ingeniería Informática'],
            ['full_name' => 'Urcullo Flores Ana Lidia', 'email' => 'ana.urcullo@test.com', 'career_name' => 'Ingeniería Informática'],
            ['full_name' => 'Gonzales Tapia Humberto Ivan', 'email' => 'humberto.gonzales@test.com', 'career_name' => 'Ingeniería del Petróleo y Gas Natural'],
            ['full_name' => 'Miranda Pena Carlos', 'email' => 'carlos.miranda@test.com', 'career_name' => 'Ingeniería en Agropecuaria'],
            ['full_name' => 'Ramirez Prado Panfilo', 'email' => 'panfilo.ramirez@test.com', 'career_name' => 'Ingeniería en Agropecuaria'],
            ['full_name' => 'Nunez Arroyo Jorge', 'email' => 'jorge.nunez@test.com', 'career_name' => 'Ingeniería en Sistemas'],
            ['full_name' => 'Contreras Sanchez Omar Henrry', 'email' => 'omar.contreras.socio@test.com', 'career_name' => 'Monitoreo Socioambiental'],
            ['full_name' => 'Urcullo Flores Ana Lidia', 'email' => 'ana.urcullo.odon@test.com', 'career_name' => 'Odontología'],
        ];

        foreach ($docentes as $d) {
            User::create([
                'full_name' => $d['full_name'],
                'email' => $d['email'],
                'password' => bcrypt('contra123'),
                'career_id' => $careers[$d['career_name']] ?? null,
                'user_type' => 'docente',
                'is_active' => true,
            ]);
        }

        $tribunales = [
            ['full_name' => 'Contreras Sanchez Omar Henrry', 'email' => 'omar.contreras.tribunal@test.com', 'docente_email' => 'omar.contreras@test.com'],
            ['full_name' => 'Davalos Carballo Henry', 'email' => 'henry.davalos.tribunal@test.com', 'docente_email' => 'henry.davalos@test.com'],
            ['full_name' => 'Gonzales Tapia Humberto Ivan', 'email' => 'humberto.gonzales.tribunal@test.com', 'docente_email' => 'humberto.gonzales@test.com'],
            ['full_name' => 'Romero Gallardo Julio Cesar', 'email' => 'julio.romero.tribunal@test.com', 'docente_email' => 'julio.romero@test.com'],
            ['full_name' => 'Rodriguez Martinez Oscar', 'email' => 'oscar.rodriguez.tribunal@test.com', 'docente_email' => 'oscar.rodriguez@test.com'],
        ];

        foreach ($tribunales as $t) {
            $existing = User::where('email', $t['docente_email'])->first();
            User::create([
                'full_name' => $t['full_name'],
                'email' => $t['email'],
                'password' => bcrypt('contra123'),
                'career_id' => $existing?->career_id,
                'user_type' => 'tribunal',
                'is_active' => true,
            ]);
        }
    }
}