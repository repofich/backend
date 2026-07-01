<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Payment;
use App\Models\Thesis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private array $endpoints = [
        'reports/theses-by-career',
        'reports/theses-by-status',
        'reports/theses-by-year',
        'reports/payments',
        'reports/users-by-role',
    ];

    public function test_unauthenticated_cannot_access_reports(): void
    {
        foreach ($this->endpoints as $endpoint) {
            $response = $this->getJson("/api/$endpoint");
            $response->assertUnauthorized();
        }
    }

    public function test_unauthorized_role_cannot_access_reports(): void
    {
        $user = User::factory()->create(['user_type' => 'estudiante']);
        $this->actingAs($user, 'api');

        foreach ($this->endpoints as $endpoint) {
            $response = $this->getJson("/api/$endpoint");
            $response->assertForbidden();
        }
    }

    public function test_vicedecano_can_access_all_reports(): void
    {
        $this->seedBasicData();

        $user = User::factory()->create(['user_type' => 'vicedecano']);
        $this->actingAs($user, 'api');

        foreach ($this->endpoints as $endpoint) {
            $response = $this->getJson("/api/$endpoint");
            $response->assertOk();
            $response->assertJsonStructure(['data']);
        }
    }

    public function test_director_can_access_all_reports(): void
    {
        $this->seedBasicData();

        $user = User::factory()->create(['user_type' => 'director']);
        $this->actingAs($user, 'api');

        foreach ($this->endpoints as $endpoint) {
            $response = $this->getJson("/api/$endpoint");
            $response->assertOk();
            $response->assertJsonStructure(['data']);
        }
    }

    public function test_theses_by_career_returns_expected_structure(): void
    {
        $category = Category::factory()->create(['name' => 'Ingeniería de Sistemas']);
        Thesis::factory(3)->create(['category_id' => $category->id]);

        $user = User::factory()->create(['user_type' => 'vicedecano']);
        $response = $this->actingAs($user, 'api')
            ->getJson('/api/reports/theses-by-career');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment([
            'name' => 'Ingeniería de Sistemas',
            'theses_count' => 3,
        ]);
    }

    public function test_theses_by_status_returns_expected_structure(): void
    {
        Thesis::factory()->create(['status' => 'borrador']);
        Thesis::factory(2)->create(['status' => 'publicado']);

        $user = User::factory()->create(['user_type' => 'vicedecano']);
        $response = $this->actingAs($user, 'api')
            ->getJson('/api/reports/theses-by-status');

        $response->assertOk();
        $response->assertJsonFragment(['status' => 'borrador', 'total' => 1]);
        $response->assertJsonFragment(['status' => 'publicado', 'total' => 2]);
    }

    public function test_theses_by_year_returns_expected_structure(): void
    {
        Thesis::factory()->create(['created_at' => now()->subYear()]);
        Thesis::factory(2)->create();

        $user = User::factory()->create(['user_type' => 'vicedecano']);
        $response = $this->actingAs($user, 'api')
            ->getJson('/api/reports/theses-by-year');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_payments_returns_expected_structure(): void
    {
        $user = User::factory()->create(['user_type' => 'vicedecano']);

        Payment::factory(2)->create([
            'user_id' => $user->id,
            'status' => 'succeeded',
            'amount' => 5000,
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/reports/payments');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment([
            'total_amount' => 10000,
            'total_count' => 2,
        ]);
    }

    public function test_users_by_role_returns_expected_structure(): void
    {
        $user = User::factory()->create(['user_type' => 'vicedecano']);
        User::factory(3)->create(['user_type' => 'estudiante']);
        User::factory(2)->create(['user_type' => 'tutor']);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/reports/users-by-role');

        $response->assertOk();
        $response->assertJsonFragment(['user_type' => 'vicedecano', 'total' => 1]);
        $response->assertJsonFragment(['user_type' => 'estudiante', 'total' => 3]);
        $response->assertJsonFragment(['user_type' => 'tutor', 'total' => 2]);
    }

    public function test_export_csv_returns_file_response(): void
    {
        $category = Category::factory()->create(['name' => 'Ingeniería de Sistemas']);
        Thesis::factory()->create(['category_id' => $category->id]);

        $user = User::factory()->create(['user_type' => 'vicedecano']);
        $response = $this->actingAs($user, 'api')
            ->get('/api/reports/theses-by-career?export=csv');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename=tesis-por-carrera.csv');
    }

    private function seedBasicData(): void
    {
        Category::factory()->create();
        Thesis::factory()->create();
        User::factory()->create();
    }
}
