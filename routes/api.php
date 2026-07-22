<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CareerController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\FormatController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ThesisController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/me/photo', [AuthController::class, 'updateMyPhoto']);
    Route::post('/me/curriculum', [AuthController::class, 'updateMyCurriculum']);

    // Users (admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/photo', [UserController::class, 'updatePhoto']);
        Route::post('/users/{user}/curriculum', [UserController::class, 'updateCurriculum']);
        Route::delete('/users/{user}/photo', [UserController::class, 'deletePhoto']);
        Route::delete('/users/{user}/curriculum', [UserController::class, 'deleteCurriculum']);
        Route::post('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

        // Careers
        Route::post('/careers', [CareerController::class, 'store']);
        Route::put('/careers/{career}', [CareerController::class, 'update']);
        Route::delete('/careers/{career}', [CareerController::class, 'destroy']);

        // Formats
        Route::get('/formats', [FormatController::class, 'index']);
        Route::post('/formats', [FormatController::class, 'store']);
        Route::get('/formats/{format}', [FormatController::class, 'show']);
        Route::put('/formats/{format}', [FormatController::class, 'update']);
        Route::delete('/formats/{format}', [FormatController::class, 'destroy']);
    });

    // Payments
    Route::post('/payments/intent', [PaymentController::class, 'store']);
    Route::post('/payments/confirm', [PaymentController::class, 'confirm']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    // Payment methods
    Route::post('/payments/setup-intent', [PaymentController::class, 'setupIntent']);
    Route::get('/payments/methods', [PaymentController::class, 'listMethods']);
    Route::delete('/payments/methods/{paymentMethod}', [PaymentController::class, 'deleteMethod']);

    // Defense payment
    Route::post('/payments/defense', [PaymentController::class, 'initiateDefensePayment']);

    // Thesis pending defense payment (estudiante)
    Route::get('/thesis/pending-defense-payment', [ThesisController::class, 'pendingDefensePayment'])
        ->middleware('role:estudiante');

    // Thesis status (vicedecano, director, admin)
    Route::put('/thesis/{thesis}/status', [ThesisController::class, 'updateStatus'])
        ->middleware('role:vicedecano,director,admin');

    // Student submit (borrador/en_revision, observado/en_revision)
    Route::post('/thesis/{thesis}/submit', [ThesisController::class, 'submit'])
        ->middleware('role:estudiante');

    Route::post('/thesis/{thesis}/tutor/respond', [ThesisController::class, 'respondTutor'])
        ->middleware('role:docente');

    // Tutor observations (docente)
    Route::middleware('role:docente')->group(function () {
        Route::post('/thesis/{thesis}/tutor/observations', [ThesisController::class, 'storeObservation']);
        Route::post('/thesis/{thesis}/tutor/approve', [ThesisController::class, 'tutorApprove']);
        Route::post('/thesis/{thesis}/tutor/request-changes', [ThesisController::class, 'tutorRequestChanges']);
    });

    // View tutor observations (autenticados: tutor, estudiante owner, admin)
    Route::get('/thesis/{thesis}/tutor-observations', [ThesisController::class, 'tutorObservations']);

    // Thesis (authenticated)
    Route::post('/thesis', [ThesisController::class, 'store']);
    Route::put('/thesis/{thesis}', [ThesisController::class, 'update']);
    Route::delete('/thesis/{thesis}', [ThesisController::class, 'destroy']);

    // Asignación de tutor y evaluador (vicedecano, director)
    Route::middleware('role:vicedecano,director,admin')->group(function () {
        Route::put('/thesis/{thesis}/tutor', [ThesisController::class, 'assignTutor']);
        Route::delete('/thesis/{thesis}/tutor', [ThesisController::class, 'removeTutor']);
        Route::get('/thesis/{thesis}/tutor/history', [ThesisController::class, 'tutorHistory']);
        Route::post('/thesis/{thesis}/evaluator', [EvaluationController::class, 'assignEvaluator']);
        Route::delete('/thesis/{thesis}/evaluator', [EvaluationController::class, 'removeEvaluator']);

        // Trash (papelera)
        Route::get('/trash/theses', [ThesisController::class, 'trash']);
        Route::post('/trash/theses/{id}/restore', [ThesisController::class, 'restore']);
        Route::delete('/trash/theses/{id}/force', [ThesisController::class, 'forceDelete']);
        Route::post('/trash/theses/empty', [ThesisController::class, 'emptyTrash']);
    });

    // Evaluaciones (tribunal, director)
    Route::middleware('role:tribunal,director')->group(function () {
        Route::get('/thesis/{thesis}/evaluations', [EvaluationController::class, 'index']);
        Route::get('/thesis/{thesis}/evaluations/{evaluation}', [EvaluationController::class, 'show']);
        Route::post('/thesis/{thesis}/evaluations', [EvaluationController::class, 'store']);
        Route::put('/thesis/{thesis}/evaluations/{evaluation}', [EvaluationController::class, 'update']);
        Route::delete('/thesis/{thesis}/evaluations/{evaluation}', [EvaluationController::class, 'destroy']);
        Route::post('/evaluations/{evaluation}/file', [EvaluationController::class, 'uploadFile']);
    });

    // Reports (vicedecano, director, admin)
    Route::middleware('role:vicedecano,director,admin')->prefix('reports')->group(function () {
        Route::get('/theses-by-career', [ReportController::class, 'thesesByCareer']);
        Route::get('/theses-by-status', [ReportController::class, 'thesesByStatus']);
        Route::get('/theses-by-year', [ReportController::class, 'thesesByYear']);
        Route::get('/payments', [ReportController::class, 'payments']);
        Route::get('/users-by-role', [ReportController::class, 'usersByRole']);
        Route::get('/thesis-overview', [ReportController::class, 'thesisOverview']);
        Route::get('/thesis-visits', [ReportController::class, 'thesisVisits']);
    });
});

// Careers (public)
Route::get('/careers', [CareerController::class, 'index']);
Route::get('/careers/{career}', [CareerController::class, 'show']);

// Thesis (public)
Route::get('/thesis', [ThesisController::class, 'index']);
Route::get('/thesis/featured', [ThesisController::class, 'featured']);
Route::get('/thesis/recent', [ThesisController::class, 'recent']);
Route::get('/thesis/search', [ThesisController::class, 'search']);
Route::get('/thesis/stats', [ThesisController::class, 'stats']);
Route::get('/thesis/published', [ThesisController::class, 'published']);
Route::get('/thesis/{thesis}', [ThesisController::class, 'show']);
