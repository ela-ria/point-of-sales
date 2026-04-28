<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ReceiptController;

// Public
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products',        [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/{id}',   [ProductController::class, 'show']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',     [AuthController::class, 'me']);

    // Products — admin only
    Route::middleware('role:admin')->group(function () {
        Route::post  ('/products',                [ProductController::class, 'store']);
        Route::put   ('/products/{id}',           [ProductController::class, 'update']);
        Route::patch ('/products/{id}/deactivate',[ProductController::class, 'deactivate']);

        // User management
        Route::get   ('/users',     [UserController::class, 'index']);
        Route::post  ('/users',     [UserController::class, 'store']);
        Route::put   ('/users/{id}',[UserController::class, 'update']);
        Route::delete('/users/{id}',[UserController::class, 'destroy']);
    });

    // Sales — cashier and admin
    Route::middleware('role:cashier,admin')->group(function () {
        Route::get   ('/sales',                          [SaleController::class, 'index']);
        Route::post  ('/sales',                          [SaleController::class, 'store']);
        Route::get   ('/sales/{id}',                     [SaleController::class, 'show']);
        Route::post  ('/sales/{id}/items',               [SaleController::class, 'addItem']);
        Route::delete('/sales/{id}/items/{itemId}',      [SaleController::class, 'voidItem']);
        Route::post  ('/sales/{id}/discount',            [SaleController::class, 'applyDiscount']);
        Route::post  ('/sales/{id}/complete',            [SaleController::class, 'complete']);
        Route::post  ('/sales/{id}/cancel',              [SaleController::class, 'cancel']);
        Route::get   ('/sales/{id}/receipt',             [ReceiptController::class, 'show']);
    });

    // Post-void & audit — supervisor and admin
    Route::middleware('role:supervisor,admin')->group(function () {
        Route::post('/sales/{id}/post-void', [SaleController::class, 'postVoid']);
        Route::get ('/voided-sales',         [SaleController::class, 'voidedSales']);
        Route::get ('/cancelled-sales',      [SaleController::class, 'cancelledSales']);
    });
});