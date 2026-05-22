<?php

namespace App\Services;

class UniversityValidationService
{
    /**
     * Validate a student's CI and registration number against the university database.
     *
     * When the external web service is available, implement the actual HTTP call here.
     * For now, returns true to allow development to proceed.
     */
    public function validateStudent(string $ci, string $registrationNumber): bool
    {
        // TODO: Replace with actual HTTP call to university web service
        // Example:
        // $response = Http::post('https://api.university.edu/validate-student', [
        //     'ci' => $ci,
        //     'registration_number' => $registrationNumber,
        // ]);
        // return $response->successful() && $response->json('valid');

        return true;
    }
}
