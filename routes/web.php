<?php

use App\Http\Controllers\ChairManagerController;
use App\Http\Controllers\ClinicalAdminController;
use App\Http\Controllers\ClinicianController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProgramManagerController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'auth/login')->name('home');

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();

        if ($user->role_id === 1) {
            return redirect()->route('admin.home');
        } elseif ($user->role_id === 2) {
            return redirect()->route('manager.home');
        } else {
            return redirect()->route('clinician.home');
        }
    })->name('dashboard');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

    // CLINICAL ADMIN
    Route::middleware(['role_id:1'])->group(function () {
        Route::get('/admin/home', [ClinicalAdminController::class, 'index'])->name('admin.home');
        Route::post('/admin/attendance/mark', [ClinicalAdminController::class, 'markAttendance'])->name('chair-manager.attendance.mark');
        Route::post('/admin/attendance/manual', [ClinicalAdminController::class, 'storeManual'])->name('chair-manager.attendance.manual');

        Route::get('/admin/manage-requests', [ClinicalAdminController::class, 'manageManagerRequests'])->name('admin.manage-requests');
        Route::post('/admin/manage-requests/{id}/action', [ClinicalAdminController::class, 'updateManagerRequestAction'])->name('admin.manage-requests.action');

        Route::get('/admin/manage-requests/{id}/details', [ChairManagerController::class, 'manageRequests'])->name('admin.manage-requests.details');
        Route::post('/admin/manage-requests/{assignmentId}/request/{requestId}', [ChairManagerController::class, 'updateRequestStatus'])->name('admin.update-request-status');

        Route::get('/admin/manage-reports', [ProgramManagerController::class, 'manageReports'])->name('admin.manage-reports');
        Route::get('/admin/manage-reports/students/{id}/attendance', [ProgramManagerController::class, 'getStudentAttendance']);
        Route::get('/admin/manage-reports/export/group/{groupId}', [ProgramManagerController::class, 'getGroupAttendance']);
        Route::get('/admin/manage-reports/export/chair/{roomId}', [ProgramManagerController::class, 'getChairUsage']);
        Route::get('/admin/manage-reports/export/all-chair', [ProgramManagerController::class, 'getAllChairUsage']);

        Route::get('/admin/management', [ClinicalAdminController::class, 'management'])->name('admin.management');

        Route::post('/admin/management/users', [ClinicalAdminController::class, 'storeUser'])->name('admin.management.users.store');
        Route::put('/admin/management/users/{id}/student-info', [ClinicalAdminController::class, 'reassignStudentGroup'])->name('admin.management.users.update-student-info');
        Route::delete('/admin/management/users/{id}', [ClinicalAdminController::class, 'destroyUser'])->name('admin.management.users.destroy');

        Route::post('/admin/management/rooms', [ClinicalAdminController::class, 'storeRoom'])->name('admin.management.rooms.store');
        Route::put('/admin/management/rooms/{id}', [ClinicalAdminController::class, 'updateRoom'])->name('admin.management.rooms.update');
        Route::delete('/admin/management/rooms/{id}', [ClinicalAdminController::class, 'destroyRoom'])->name('admin.management.rooms.destroy');

        Route::post('/admin/management/rooms/{roomId}/sections', [ClinicalAdminController::class, 'storeSection'])->name('admin.management.sections.store');
        Route::put('/admin/management/sections/{id}', [ClinicalAdminController::class, 'updateSection'])->name('admin.management.sections.update');
        Route::delete('/admin/management/sections/{id}', [ClinicalAdminController::class, 'destroySection'])->name('admin.management.sections.destroy');

    });

    // PROGRAM MANAGER
    Route::middleware(['role_id:2'])->group(function () {
        Route::get('/manager/home', [ProgramManagerController::class, 'manageReports'])->name('manager.home');

        Route::get('/manager/manage-reports/students/{id}/attendance', [ProgramManagerController::class, 'getStudentAttendance']);
        Route::get('/manager/manage-reports/export/group/{groupId}', [ProgramManagerController::class, 'getGroupAttendance']);
        Route::get('/manager/manage-reports/export/chair/{roomId}', [ProgramManagerController::class, 'getChairUsage']);
        Route::get('/manager/manage-reports/export/all-chair', [ProgramManagerController::class, 'getAllChairUsage']);
    });

    // CLINICIAN & CHAIR MANAGER
    Route::middleware(['role_id:3'])->group(function () {
        // CLINICIANS
        Route::get('/clinician/home', [ClinicianController::class, 'index'])->name('clinician.home');
        Route::get('/clinician/available-assistants', [ClinicianController::class, 'getAvailableClinicians']);
        Route::post('/clinician/edit-assistant', [ClinicianController::class, 'editAssistant']);
        Route::post('/clinician/cancel-chair-schedule', [ClinicianController::class, 'cancelSchedule']);

        Route::get('/clinician/create-chair-request', [ClinicianController::class, 'createChairRequest'])->name('clinician.create-chair-request');
        Route::post('/clinician/store-chair-request', [ClinicianController::class, 'storeChairRequest'])->name('clinician.store-chair-request');

        Route::get('/clinician/request-tracker', [ClinicianController::class, 'trackRequest'])->name('clinician.request-tracker');

        // CHAIR MANAGER
        Route::get('/chair-manager/home', [ChairManagerController::class, 'index'])->name('chair-manager.home');
        Route::post('/chair-manager/request-role', [ChairManagerController::class, 'store'])->name('chair-manager.store');
        Route::post('/chair-manager/cancel-request/{assignment}', [ChairManagerController::class, 'cancelRequest'])->name('chair-manager.update');
        Route::get('/chair-manager/history', [ChairManagerController::class, 'history'])->name('chair-manager.history');

        Route::get('/chair-manager/manage-requests/{id}', [ChairManagerController::class, 'manageRequests'])->name('chair-manager.manage-requests');
        Route::post('/chair-manager/manage-requests/{assignmentId}/request/{requestId}', [ChairManagerController::class, 'updateRequestStatus'])->name('chair-manager.update-request-status');

        Route::get('/chair-manager/request-details/{id}', [ChairManagerController::class, 'requestDetails'])->name('chair-manager.request-details');
    });
});


require __DIR__.'/settings.php';
