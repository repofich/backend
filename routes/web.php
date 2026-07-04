<?php

use App\Http\Controllers\Inertia\AuthController;
use App\Http\Controllers\Inertia\PageController;
use App\Http\Controllers\Inertia\ThesisController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home']);

Route::get('/login', [PageController::class, 'login'])->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::get('/register', [PageController::class, 'register'])->name('register');
Route::post('/register', [AuthController::class, 'register']);

Route::get('/crear-proyecto', [PageController::class, 'createProject']);
Route::post('/crear-proyecto', [ThesisController::class, 'store'])->middleware('auth');

Route::get('/mis-proyectos', [PageController::class, 'myProjects'])->middleware('auth');

Route::get('/editar-proyecto/{thesis}', [PageController::class, 'editProject'])->middleware('auth');
Route::post('/editar-proyecto/{thesis}', [ThesisController::class, 'update'])->middleware('auth');
Route::delete('/eliminar-proyecto/{thesis}', [ThesisController::class, 'destroy'])->middleware('auth');

Route::post('/tesis/{thesis}/archivos', [ThesisController::class, 'uploadFile'])->middleware('auth');
Route::delete('/tesis/{thesis}/archivos/{file}', [ThesisController::class, 'deleteFile'])->middleware('auth');

Route::get('/pagos', [PageController::class, 'payments'])->middleware('auth');

Route::get('/perfil', [PageController::class, 'profile'])->middleware('auth');
Route::post('/perfil', [App\Http\Controllers\Inertia\ProfileController::class, 'update'])->middleware('auth');

Route::get('/mis-evaluaciones', [PageController::class, 'misEvaluaciones'])->middleware('auth');
Route::get('/evaluar/{thesis}', [PageController::class, 'evaluarTesis'])->middleware('auth');
Route::get('/admin/tesis', [PageController::class, 'adminTesis'])->middleware('auth');
Route::get('/admin/usuarios', [PageController::class, 'adminUsers'])->middleware('auth');
Route::get('/admin/usuarios/crear', [PageController::class, 'createUser'])->middleware('auth');
Route::get('/admin/usuarios/{user}/editar', [PageController::class, 'editUser'])->middleware('auth');

Route::get('/admin/carreras', [PageController::class, 'adminCareers'])->middleware('auth');
Route::get('/admin/carreras/crear', [PageController::class, 'createCareer'])->middleware('auth');
Route::get('/admin/carreras/{career}/editar', [PageController::class, 'editCareer'])->middleware('auth');

Route::get('/tesis/{thesis}', [PageController::class, 'thesisDetail']);

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
