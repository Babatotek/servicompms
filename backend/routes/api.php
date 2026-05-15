<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\AppraisalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MpmsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\SettingsController;
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);

// ── Authenticated ─────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/auth/me',      [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Profile
    Route::patch('/profile',          [ProfileController::class, 'update']);
    Route::patch('/profile/password', [ProfileController::class, 'changePassword']);

    // Dashboard — role-aware, cached
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Performance Contracts ─────────────────────────────────────────────────
    Route::prefix('contracts')->group(function () {
        Route::get('/my/{year}',       [ContractController::class, 'mine']);
        Route::post('/',               [ContractController::class, 'store']);
        Route::get('/pending',         [ContractController::class, 'pending']);
        Route::patch('/{contract}/submit',  [ContractController::class, 'submit']);
        Route::patch('/{contract}/approve', [ContractController::class, 'approve']);
        Route::patch('/{contract}/return',  [ContractController::class, 'return']);
    });

    // ── Appraisals ────────────────────────────────────────────────────────────
    Route::prefix('appraisals')->group(function () {
        Route::get('/my/{period}',                    [AppraisalController::class, 'mine']);
        Route::post('/',                              [AppraisalController::class, 'store']);
        Route::get('/supervisor-queue',               [AppraisalController::class, 'supervisorQueue']);
        Route::get('/counter-queue',                  [AppraisalController::class, 'counterQueue']);
        Route::patch('/{appraisal}/review',           [AppraisalController::class, 'review']);
        Route::patch('/{appraisal}/counter-sign',     [AppraisalController::class, 'counterSign']);
        Route::patch('/{appraisal}/return-from-counter', [AppraisalController::class, 'returnFromCounter']);
    });

    // ── Leaderboard ───────────────────────────────────────────────────────────
    Route::prefix('leaderboard')->group(function () {
        Route::get('/annual/{year}',      [LeaderboardController::class, 'annual']);
        Route::get('/quarter/{year}',     [LeaderboardController::class, 'quarter']);
        Route::get('/departments/{year}', [LeaderboardController::class, 'departments']);
    });

    // ── Analytics ─────────────────────────────────────────────────────────────
    Route::get('/analytics/me',  [AnalyticsController::class, 'me']);
    Route::get('/analytics/org', [AnalyticsController::class, 'org'])
        ->middleware('role:Deputy Director,National Coordinator,Super Admin');

    // ── MPMS ──────────────────────────────────────────────────────────────────
    Route::prefix('mpms')->group(function () {
        Route::get('/dashboard/{year}',        [MpmsController::class, 'dashboard']);
        Route::get('/kpis',                    [MpmsController::class, 'kpis']);
        Route::post('/achievements',           [MpmsController::class, 'storeAchievement']);
        Route::patch('/achievements/{achievement}', [MpmsController::class, 'updateAchievement']);
    });

    // ── Admin ─────────────────────────────────────────────────────────────────
    Route::prefix('admin')
        ->middleware('role:Super Admin,National Coordinator')
        ->group(function () {
            Route::get('/users',           [UserController::class, 'index']);
            Route::post('/users',          [UserController::class, 'store']);
            Route::patch('/users/{user}',  [UserController::class, 'update']);

            Route::get('/departments',              [DepartmentController::class, 'index']);
            Route::post('/departments',             [DepartmentController::class, 'store']);
            Route::patch('/departments/{department}', [DepartmentController::class, 'update']);

            Route::get('/settings',   [SettingsController::class, 'index']);
            Route::patch('/settings', [SettingsController::class, 'update']);
        });
});
