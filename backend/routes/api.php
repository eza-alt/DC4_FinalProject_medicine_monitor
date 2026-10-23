<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MedicineBatchController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\StockRequestController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/medicines', [MedicineController::class, 'index']);
    Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);

    Route::get('/batches', [MedicineBatchController::class, 'index']);
    Route::get('/batches/{batch}', [MedicineBatchController::class, 'show']);

    Route::get('/stock-requests', [StockRequestController::class, 'index']);
    Route::post('/stock-requests', [StockRequestController::class, 'store']);
    Route::get('/stock-requests/{stockRequest}', [StockRequestController::class, 'show']);
    Route::delete('/stock-requests/{stockRequest}', [StockRequestController::class, 'destroy']);

    // Admin only
    Route::middleware('admin')->group(function () {
        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);

        Route::post('/batches', [MedicineBatchController::class, 'store']);
        Route::put('/batches/{batch}', [MedicineBatchController::class, 'update']);
        Route::delete('/batches/{batch}', [MedicineBatchController::class, 'destroy']);

        Route::patch('/stock-requests/{stockRequest}/status', [StockRequestController::class, 'updateStatus']);
    });
});