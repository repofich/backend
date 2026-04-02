<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ThesisController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/login', function () {
    return response()->json([
    'token' => 'abc123xyz',
    "user" => [
        'id' => 1,
        'name' => 'Juan Pérez',
        'email' => 'juan@email.com',
    ]]);
});

Route::get('/thesis', [ThesisController::class, 'index']);
Route::get('/thesis/search/{search}', [ThesisController::class, 'search']);
Route::get('/thesis/{id}', [ThesisController::class, 'show']);
Route::post('/thesis', [ThesisController::class, 'store']);
Route::put('/thesis/{id}', [ThesisController::class, 'update']);
Route::delete('/thesis/{id}', [ThesisController::class, 'destroy']);
