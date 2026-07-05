<?php

namespace App\Http\Controllers;

use App\Exports\PaymentsExport;
use App\Exports\ThesesByCareerExport;
use App\Exports\ThesesByStatusExport;
use App\Exports\ThesesByYearExport;
use App\Exports\ThesisOverviewExport;
use App\Exports\ThesisVisitsExport;
use App\Exports\UsersByRoleExport;
use App\Models\Category;
use App\Models\Evaluation;
use App\Models\PageVisit;
use App\Models\Payment;
use App\Models\Thesis;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function thesesByCareer(Request $request): JsonResponse|StreamedResponse
    {
        $data = Category::withCount('theses')->get();

        if ($request->query('export') === 'csv') {
            return $this->exportCsv(new ThesesByCareerExport, $data, 'tesis-por-carrera.csv');
        }

        return response()->json(['data' => $data]);
    }

    public function thesesByStatus(Request $request): JsonResponse|StreamedResponse
    {
        $data = Thesis::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        if ($request->query('export') === 'csv') {
            return $this->exportCsv(new ThesesByStatusExport, $data, 'tesis-por-estado.csv');
        }

        return response()->json(['data' => $data]);
    }

    public function thesesByYear(Request $request): JsonResponse|StreamedResponse
    {
        $data = Thesis::all()
            ->groupBy(fn($t) => $t->created_at->format('Y'))
            ->map(fn($items, $year) => (object) ['year' => (int) $year, 'total' => $items->count()])
            ->sortBy('year')
            ->values();

        if ($request->query('export') === 'csv') {
            return $this->exportCsv(new ThesesByYearExport, collect($data), 'tesis-por-anio.csv');
        }

        return response()->json(['data' => $data]);
    }

    public function payments(Request $request): JsonResponse|StreamedResponse
    {
        $data = Payment::where('status', 'succeeded')->get()
            ->groupBy(fn($p) => $p->paid_at?->format('Y-m'))
            ->map(fn($items, $period) => (object) [
                'period' => $period,
                'total_amount' => $items->sum('amount'),
                'total_count' => $items->count(),
            ])
            ->sortBy('period')
            ->values();

        if ($request->query('export') === 'csv') {
            return $this->exportCsv(new PaymentsExport, collect($data), 'ingresos-por-pagos.csv');
        }

        return response()->json(['data' => $data]);
    }

    public function thesisOverview(Request $request): JsonResponse|StreamedResponse
    {
        $totalTheses = Thesis::count();
        $publishedTheses = Thesis::where('status', 'publicado')->count();
        $totalFiles = \App\Models\ThesisFile::count();
        $totalUsers = User::count();
        $totalDocentes = User::where('user_type', 'docente')->count();
        $totalEstudiantes = User::where('user_type', 'estudiante')->count();
        $totalEvaluations = Evaluation::count();
        $totalVisits = PageVisit::sum('visits');

        $data = [
            'total_theses' => $totalTheses,
            'published_theses' => $publishedTheses,
            'publication_rate' => $totalTheses > 0
                ? round(($publishedTheses / $totalTheses) * 100, 1) . '%'
                : '0%',
            'total_files' => $totalFiles,
            'total_users' => $totalUsers,
            'total_docentes' => $totalDocentes,
            'total_estudiantes' => $totalEstudiantes,
            'total_evaluations' => $totalEvaluations,
            'total_visits' => $totalVisits,
        ];

        if ($request->query('export') === 'csv') {
            return $this->exportCsv(new ThesisOverviewExport, collect($data), 'resumen-general.csv');
        }

        return response()->json(['data' => $data]);
    }

    public function thesisVisits(Request $request): JsonResponse|StreamedResponse
    {
        $data = PageVisit::select('page_visits.*', 'theses.title', 'theses.id as thesis_id')
            ->join('theses', DB::raw("CONCAT('tesis/', theses.id)"), '=', 'page_visits.path')
            ->where('page_visits.path', 'LIKE', 'tesis/%')
            ->orderBy('page_visits.visits', 'desc')
            ->get();

        if ($request->query('export') === 'csv') {
            return $this->exportCsv(new ThesisVisitsExport, $data, 'visitas-por-tesis.csv');
        }

        return response()->json(['data' => $data]);
    }

    public function usersByRole(Request $request): JsonResponse|StreamedResponse
    {
        $data = User::selectRaw('user_type, count(*) as total')
            ->groupBy('user_type')
            ->orderBy('user_type')
            ->get();

        if ($request->query('export') === 'csv') {
            return $this->exportCsv(new UsersByRoleExport, $data, 'usuarios-por-rol.csv');
        }

        return response()->json(['data' => $data]);
    }

    private function exportCsv(object $export, Collection $data, string $filename): StreamedResponse
    {
        $headings = $export->headings();
        $rows = $export->rows($data);

        return response()->streamDownload(function () use ($headings, $rows) {
            $output = fopen('php://output', 'w');
            fputs($output, "\xEF\xBB\xBF");
            fputcsv($output, $headings);
            foreach ($rows as $row) {
                fputcsv($output, $row);
            }
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
