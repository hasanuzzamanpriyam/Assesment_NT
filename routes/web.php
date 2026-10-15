<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TicketCommentController;
use App\Http\Controllers\TicketController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Live AI Analyzer endpoint for ticket drafting
    Route::post('/tickets/analyze-ai', [TicketController::class, 'analyzeAi'])->name('tickets.analyze-ai');

    // Ticket Status and Assignee updates
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'changeStatus'])->name('tickets.status');
    Route::patch('/tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');

    // Comments
    Route::post('/tickets/{ticket}/comments', [TicketCommentController::class, 'store'])->name('tickets.comments.store');

    // Tickets Resource
    Route::resource('tickets', TicketController::class);

    // Category Management (Admin only)
    Route::middleware('admin')->group(function () {
        Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
    });

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
