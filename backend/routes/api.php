<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MedicineController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/medicines', [MedicineController::class, 'index']);
Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);

Route::middleware('admin')->group(function () {
    Route::post('/medicines', [MedicineController::class, 'store']);
    Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
    Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
});

    // Temporary route to test the admin check. We'll delete it later.
    Route::middleware('admin')->get('/admin-check', function () {
        return response()->json(['message' => 'Welcome, admin.']);
    });
});