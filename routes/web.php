<?php

use App\Http\Controllers\Inertia\AuthController;
use App\Http\Controllers\Inertia\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home']);

Route::get('/login', [PageController::class, 'login'])->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::get('/register', [PageController::class, 'register'])->name('register');
Route::post('/register', [AuthController::class, 'register']);

Route::get('/crear-proyecto', [PageController::class, 'createProject']);

Route::get('/pagos', [PageController::class, 'payments'])->middleware('auth');

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
